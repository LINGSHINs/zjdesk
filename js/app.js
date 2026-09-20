/**
 * ============================================================
 *  SZ.app - 书桌刷题应用主入口与控制器
 * ============================================================
 *
 *  版本: 2.0.0
 *  作者: SZ Team
 *  描述: 书桌刷题应用的主入口文件，整合所有子模块，
 *        负责应用初始化、路由控制、UI渲染、事件绑定、
 *        数据同步、响应式适配等核心功能。
 *
 *  命名空间: window.SZ.app
 *
 *  整合模块:
 *    - SZ.utils       工具函数库
 *    - SZ.particles   粒子特效系统
 *    - SZ.sounds      音效系统
 *    - SZ.stats       统计系统
 *    - SZ.modes       刷题模式引擎
 *    - SZ.easterEggs  彩蛋模式集合
 *    - SZ.themes      主题皮肤系统
 *
 *  核心功能:
 *    1. 应用初始化流程管理
 *    2. 路由与面板切换
 *    3. 题目渲染与答题交互
 *    4. 答题卡管理
 *    5. 计时器管理
 *    6. 设置面板交互
 *    7. 数据同步与持久化
 *    8. 彩蛋解锁机制
 *    9. 响应式适配
 *   10. PWA与离线支持
 *
 * ============================================================
 */

(function (window) {
    'use strict';

    // ============================================================
    //  命名空间初始化
    // ============================================================
    window.SZ = window.SZ || {};
    SZ.app = SZ.app || {};

    var app = SZ.app;

    // ============================================================
    //  常量定义
    // ============================================================

    /** localStorage 存储键名 */
    var STORAGE_KEYS = {
        APP_SETTINGS: 'sz_app_settings',           // 应用设置
        CURRENT_MODE: 'sz_current_mode',            // 当前刷题模式
        CURRENT_QUESTION_INDEX: 'sz_current_q_idx', // 当前题目索引
        ANSWER_RECORDS: 'sz_answer_records',        // 答题记录（当前会话）
        EXAM_STATE: 'sz_exam_state',                // 考试状态
        DAILY_REMINDER: 'sz_daily_reminder',        // 每日提醒设置
        LAST_VISIT: 'sz_last_visit',                // 最后访问时间
        EASTER_EGGS_UNLOCKED: 'sz_easter_unlocked', // 已解锁的彩蛋
        SEARCH_HISTORY: 'sz_search_history',        // 搜索历史
        QUICK_SETTINGS: 'sz_quick_settings'         // 快捷设置
    };

    /** 面板/页面标识 */
    var PANELS = {
        WELCOME: 'welcome',     // 欢迎页/首页
        QUIZ: 'quiz',           // 答题页
        STATS: 'stats',         // 统计页
        WRONG: 'wrong',         // 错题集
        FAVORITE: 'favorite',   // 收藏夹
        SEARCH: 'search'        // 搜索结果
    };

    /** 刷题模式入口 */
    var MODE_ENTRIES = {
        ORDER: 'order',         // 顺序练习
        RANDOM: 'random',       // 随机练习
        CHAPTER: 'chapter',     // 章节练习
        DAILY: 'daily',         // 每日一练
        EXAM: 'exam',           // 模拟考试
        WRONG: 'wrong',         // 错题本
        FAVORITE: 'favorite',   // 收藏夹
        CHALLENGE: 'challenge'  // 挑战模式
    };

    /** 题目类型 */
    var QUESTION_TYPES = {
        SINGLE: '单选',         // 单选题
        MULTIPLE: '多选',       // 多选题
        JUDGE: '判断'           // 判断题
    };

    /** 答题状态 */
    var ANSWER_STATUS = {
        UNANSWERED: 0,          // 未作答
        CORRECT: 1,             // 答对
        WRONG: 2                // 答错
    };

    /** 默认应用设置 */
    var DEFAULT_SETTINGS = {
        theme: 'default',           // 当前主题
        fontSize: 'medium',         // 字体大小
        fontFamily: 'system',       // 字体
        soundEnabled: true,         // 音效开关
        soundVolume: 0.7,           // 音效音量
        bgMusicEnabled: false,      // 背景音乐开关
        bgMusicVolume: 0.3,         // 背景音乐音量
        particlesEnabled: true,     // 粒子特效开关
        autoNext: false,            // 自动下一题
        showAnswer: true,           // 显示答案解析
        nightMode: 'auto',          // 夜间模式 auto/manual
        nightModeManual: false,     // 手动夜间模式状态
        dailyReminder: false,       // 每日提醒
        reminderTime: '20:00',      // 提醒时间
        vibrateEnabled: true,       // 震动反馈
        swipeEnabled: true,         // 滑动切换
        keyboardShortcuts: true,    // 键盘快捷键
        showProgress: true,         // 显示进度条
        showTimer: true,            // 显示计时器
        answerCardMode: 'grid',     // 答题卡展示模式 grid/list
        language: 'zh-CN',          // 语言
        dataSaver: false            // 省流模式
    };

    /** 键盘快捷键映射 */
    var KEYBOARD_SHORTCUTS = {
        '1': 'select_a',
        '2': 'select_b',
        '3': 'select_c',
        '4': 'select_d',
        '5': 'select_e',
        '6': 'select_f',
        'A': 'select_a',
        'B': 'select_b',
        'C': 'select_c',
        'D': 'select_d',
        'E': 'select_e',
        'F': 'select_f',
        'ArrowLeft': 'prev_question',
        'ArrowRight': 'next_question',
        'ArrowUp': 'prev_question',
        'ArrowDown': 'next_question',
        'Enter': 'submit_answer',
        ' ': 'toggle_answer_card',
        'Escape': 'close_panel',
        'Numpad1': 'select_a',
        'Numpad2': 'select_b',
        'Numpad3': 'select_c',
        'Numpad4': 'select_d',
        'Numpad5': 'select_e',
        'Numpad6': 'select_f'
    };

    /** 科乐美秘籍序列 */
    var KONAMI_CODE = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];

    // ============================================================
    //  应用状态管理
    // ============================================================

    app.state = {
        /** 应用是否已初始化 */
        initialized: false,

        /** 当前面板 */
        currentPanel: PANELS.WELCOME,

        /** 当前刷题模式 */
        currentMode: MODE_ENTRIES.ORDER,

        /** 当前模式配置 */
        modeConfig: {},

        /** 题库数据 */
        questions: [],

        /** 题库元数据 */
        questionMeta: {},

        /** 当前题目列表（筛选后的） */
        currentQuestionList: [],

        /** 当前题目索引 */
        currentQuestionIndex: 0,

        /** 答题记录 { questionId: { status, userAnswer, timeSpent } } */
        answerRecords: {},

        /** 当前选中的选项 */
        selectedOptions: [],

        /** 是否已提交答案 */
        answerSubmitted: false,

        /** 计时器 */
        timer: {
            enabled: false,
            startTime: 0,
            elapsed: 0,
            intervalId: null,
            totalTime: 0  // 考试模式总时长
        },

        /** 考试模式状态 */
        examState: {
            started: false,
            paused: false,
            remainingTime: 0,
            questionCount: 100
        },

        /** 连击计数 */
        combo: 0,

        /** 最大连击 */
        maxCombo: 0,

        /** 设置 */
        settings: {},

        /** 侧边栏状态 */
        sidebarOpen: false,

        /** 设置面板状态 */
        settingsPanelOpen: false,

        /** 搜索面板状态 */
        searchPanelOpen: false,

        /** 答题卡面板状态 */
        answerCardOpen: false,

        /** 彩蛋解锁状态 */
        easterEggs: {
            konami: false,
            logoClick: 0,
            unlocked: []
        },

        /** Logo点击计数 */
        logoClickCount: 0,

        /** Logo点击计时器 */
        logoClickTimer: null,

        /** 科乐美输入序列 */
        konamiSequence: [],

        /** 触摸滑动起始点 */
        touchStartX: 0,
        touchStartY: 0,

        /** 窗口尺寸 */
        viewport: {
            width: 0,
            height: 0,
            isMobile: false,
            isPortrait: true
        }
    }

    // ============================================================
    //  DOM 元素缓存
    // ============================================================

    app.dom = {};

    /**
     * 缓存DOM元素
     */
    function cacheDomElements() {
        var d = app.dom;

        // 加载动画
        d.loader = document.getElementById('app-loader');

        // 粒子画布
        d.particlesCanvas = document.getElementById('particles-canvas');

        // 应用主容器
        d.appContainer = document.getElementById('app');

        // 顶部导航
        d.header = document.querySelector('.app-header');
        d.appLogo = document.getElementById('app-logo');
        d.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
        d.btnSearch = document.getElementById('btn-search');
        d.btnThemeQuick = document.getElementById('btn-theme-quick');
        d.btnStats = document.getElementById('btn-stats');
        d.btnSettings = document.getElementById('btn-settings');
        d.currentModeBadge = document.getElementById('current-mode-badge');
        d.modeTabs = document.getElementById('mode-tabs');

        // 侧边栏
        d.sidebar = document.getElementById('app-sidebar');
        d.sidebarOverlay = document.getElementById('sidebar-overlay');
        d.btnCloseSidebar = document.getElementById('btn-close-sidebar');
        d.modeItems = document.querySelectorAll('.mode-item');

        // 侧边栏统计
        d.miniTotalDays = document.getElementById('mini-total-days');
        d.miniTotalQuestions = document.getElementById('mini-total-questions');
        d.miniAccuracy = document.getElementById('mini-accuracy');
        d.streakDays = document.getElementById('streak-days');

        // 面板
        d.panelWelcome = document.getElementById('panel-welcome');
        d.panelQuiz = document.getElementById('panel-quiz');
        d.panelStats = document.getElementById('panel-stats');

        // 欢迎页元素
        d.todayDone = document.getElementById('today-done');
        d.todayTarget = document.getElementById('today-target');
        d.todayAccuracy = document.getElementById('today-accuracy');
        d.btnContinuePractice = document.getElementById('btn-continue-practice');
        d.overallProgress = document.getElementById('overall-progress');

        // 答题页元素
        d.quizProgressFill = document.getElementById('quiz-progress-fill');
        d.currentQNum = document.getElementById('current-q-num');
        d.totalQNum = document.getElementById('total-q-num');
        d.questionType = document.getElementById('question-type');
        d.questionIndex = document.getElementById('question-index');
        d.questionCategory = document.getElementById('question-category');
        d.questionStem = document.getElementById('question-stem');
        d.optionsList = document.getElementById('options-list');
        d.btnFavorite = document.getElementById('btn-favorite');
        d.answerAnalysis = document.getElementById('answer-analysis');
        d.analysisResult = document.getElementById('analysis-result');
        d.correctAnswer = document.getElementById('correct-answer');
        d.analysisText = document.getElementById('analysis-text');

        // 操作栏
        d.btnPrevQuestion = document.getElementById('btn-prev-question');
        d.btnNextQuestion = document.getElementById('btn-next-question');
        d.btnHint = document.getElementById('btn-hint');
        d.btnAnswerCard = document.getElementById('btn-answer-card');
        d.btnNote = document.getElementById('btn-note');

        // 答题卡
        d.answerCardPanel = document.getElementById('answer-card-panel');
        d.answerCardGrid = document.getElementById('answer-card-grid');
        d.btnCloseCard = document.getElementById('btn-close-card');
        d.cardAnswered = document.getElementById('card-answered');
        d.cardAccuracy = document.getElementById('card-accuracy');
        d.btnSubmitExam = document.getElementById('btn-submit-exam');

        // 统计页
        d.statTotalQuestions = document.getElementById('stat-total-questions');
        d.statAccuracy = document.getElementById('stat-accuracy');
        d.statStreak = document.getElementById('stat-streak');

        // 计时器显示
        d.timerDisplay = document.getElementById('timer-display');

        // 设置面板（动态创建时缓存）
        d.settingsPanel = null;
        d.searchPanel = null;
    }

    // ============================================================
    //  工具函数
    // ============================================================

    /**
     * 从 localStorage 读取数据
     */
    function getStorage(key, defaultValue) {
        try {
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('[SZ.app] 读取localStorage失败:', key, e);
            return defaultValue;
        }
    }

    /**
     * 保存数据到 localStorage
     */
    function setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('[SZ.app] 保存localStorage失败:', key, e);
            return false;
        }
    }

    /**
     * 检查 localStorage 支持
     */
    function checkLocalStorageSupport() {
        try {
            var testKey = '__sz_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 格式化时间 (秒 -> mm:ss 或 HH:mm:ss)
     */
    function formatTime(seconds) {
        seconds = Math.floor(seconds);
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        if (h > 0) {
            return (h < 10 ? '0' + h : h) + ':' +
                   (m < 10 ? '0' + m : m) + ':' +
                   (s < 10 ? '0' + s : s);
        }
        return (m < 10 ? '0' + m : m) + ':' +
               (s < 10 ? '0' + s : s);
    }

    /**
     * 格式化数字（加千分位）
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * 生成唯一ID
     */
    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 防抖函数
     */
    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    /**
     * 节流函数
     */
    function throttle(fn, limit) {
        var inThrottle;
        return function () {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(function () {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * 转义HTML
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    /**
     * 检测是否为移动设备
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 768;
    }

    /**
     * 检测是否为竖屏
     */
    function isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    /**
     * 震动反馈
     */
    function vibrate(pattern) {
        if (app.state.settings.vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * 获取当前时间字符串
     */
    function getTodayString() {
        var d = new Date();
        return d.getFullYear() + '-' +
               (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '-' +
               (d.getDate() < 10 ? '0' : '') + d.getDate();
    }

    // ============================================================
    //  应用初始化流程
    // ============================================================

    /**
     * 应用初始化入口
     * 按顺序执行初始化流程
     */
    app.init = function () {
        console.log('[SZ.app] 开始初始化...');

        var startTime = performance.now();

        // 步骤1: 检查localStorage支持
        if (!checkLocalStorageSupport()) {
            console.warn('[SZ.app] localStorage不受支持，部分功能将受限');
            showNoStorageWarning();
        }

        // 步骤2: 加载设置
        loadSettings();

        // 步骤3: 缓存DOM元素
        cacheDomElements();

        // 步骤4: 加载主题设置并应用
        initTheme();

        // 步骤5: 初始化粒子特效系统
        initParticles();

        // 步骤6: 初始化音效系统
        initSounds();

        // 步骤7: 初始化统计系统
        initStats();

        // 步骤8: 加载题库数据
        loadQuestionData(function () {
            // 步骤9: 初始化UI事件绑定
            bindEvents();

            // 步骤10: 渲染首屏数据
            renderWelcome();

            // 步骤11: 更新侧边栏统计
            updateSidebarStats();

            // 步骤12: 隐藏加载动画
            hideLoader();

            // 步骤13: 初始化彩蛋监听
            initEasterEggs();

            // 步骤14: 初始化响应式
            initResponsive();

            // 步骤15: 初始化PWA
            initPWA();

            // 步骤16: 每日提醒检查
            checkDailyReminder();

            // 步骤17: 夜间模式检查
            checkNightMode();

            // 标记初始化完成
            app.state.initialized = true;

            var endTime = performance.now();
            console.log('[SZ.app] 初始化完成，耗时: ' + (endTime - startTime).toFixed(2) + 'ms');

            // 触发应用就绪事件
            triggerEvent('app:ready');
        });
    };

    /**
     * 显示localStorage不支持警告
     */
    function showNoStorageWarning() {
        var warning = document.createElement('div');
        warning.className = 'storage-warning';
        warning.innerHTML =
            '<div class="warning-content">' +
                '<svg class="icon"><use href="#icon-hint"/></svg>' +
                '<p>您的浏览器不支持本地存储功能，学习进度将无法保存。</p>' +
                '<p>请使用现代浏览器或开启Cookie功能以获得完整体验。</p>' +
            '</div>';
        document.body.appendChild(warning);
    }

    /**
     * 加载设置
     */
    function loadSettings() {
        var savedSettings = getStorage(STORAGE_KEYS.APP_SETTINGS, {});
        app.state.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);

        // 加载彩蛋解锁状态
        app.state.easterEggs.unlocked = getStorage(STORAGE_KEYS.EASTER_EGGS_UNLOCKED, []);

        console.log('[SZ.app] 设置已加载', app.state.settings);
    }

    /**
     * 保存设置
     */
    function saveSettings() {
        setStorage(STORAGE_KEYS.APP_SETTINGS, app.state.settings);
    }

    /**
     * 初始化主题
     */
    function initTheme() {
        if (SZ.themes && typeof SZ.themes.setTheme === 'function') {
            var themeId = app.state.settings.theme || 'default';
            SZ.themes.setTheme(themeId);

            // 应用字体设置
            if (SZ.themes.setFontSize) {
                SZ.themes.setFontSize(app.state.settings.fontSize);
            }
            if (SZ.themes.setFont && app.state.settings.fontFamily !== 'system') {
                SZ.themes.setFont(app.state.settings.fontFamily);
            }
        }
        console.log('[SZ.app] 主题系统初始化完成');
    }

    /**
     * 初始化粒子特效系统
     */
    function initParticles() {
        if (SZ.particles && typeof SZ.particles.init === 'function') {
            if (app.state.settings.particlesEnabled) {
                try {
                    SZ.particles.init({
                        canvas: app.dom.particlesCanvas,
                        theme: app.state.settings.theme
                    });
                    // 尝试调用 start 方法
                    if (typeof SZ.particles.start === 'function') {
                        SZ.particles.start();
                    } else if (SZ.particles.defaultManager && typeof SZ.particles.defaultManager.start === 'function') {
                        SZ.particles.defaultManager.start();
                    }
                    // 确保 trigger 方法存在
                    if (typeof SZ.particles.trigger !== 'function') {
                        SZ.particles.trigger = function(effectName, options) {
                            options = options || {};
                            var mgr = SZ.particles.defaultManager;
                            if (!mgr) return;
                            var x = options.x || window.innerWidth / 2;
                            var y = options.y || window.innerHeight / 2;
                            if (mgr.clickEffects && mgr.clickEffects.ripple) {
                                mgr.clickEffects.ripple(x, y);
                            }
                        };
                    }
                } catch(e) {
                    console.warn('[SZ.app] 粒子系统初始化失败:', e);
                }
            }
        }
        console.log('[SZ.app] 粒子特效系统初始化完成');
    }

    /**
     * 初始化音效系统
     */
    function initSounds() {
        if (SZ.sounds && typeof SZ.sounds.init === 'function') {
            SZ.sounds.init({
                enabled: app.state.settings.soundEnabled,
                volume: app.state.settings.soundVolume
            });
        }
        console.log('[SZ.app] 音效系统初始化完成');
    }

    /**
     * 初始化统计系统
     */
    function initStats() {
        if (SZ.stats && typeof SZ.stats.init === 'function') {
            SZ.stats.init();
        }
        console.log('[SZ.app] 统计系统初始化完成');
    }

    /**
     * 加载题库数据
     */
    function loadQuestionData(callback) {
        var dataUrl = 'data/questions.json';

        console.log('[SZ.app] 正在加载题库数据...');

        fetch(dataUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('网络请求失败: ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                app.state.questions = data.questions || [];
                app.state.questionMeta = data.meta || {};

                console.log('[SZ.app] 题库加载完成，共 ' + app.state.questions.length + ' 题');

                if (callback) callback();
            })
            .catch(function (error) {
                console.error('[SZ.app] 题库加载失败:', error);

                // 加载失败时使用空数据，确保应用仍可运行
                app.state.questions = [];
                app.state.questionMeta = { total: 0, types: [], departments: [] };

                if (callback) callback();
            });
    }

    /**
     * 隐藏加载动画
     */
    function hideLoader() {
        var loader = app.dom.loader;
        if (!loader) return;

        loader.classList.add('loader-hidden');

        // 显示应用主容器
        if (app.dom.appContainer) {
            app.dom.appContainer.style.visibility = 'visible';
        }

        // 动画结束后移除loader
        setTimeout(function () {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 600);

        // 播放进入音效
        playSound('ui_start');

        // 触发粒子入场特效
        if (SZ.particles && SZ.particles.trigger) {
            SZ.particles.trigger('welcome');
        }
    }

    // ============================================================
    //  事件系统
    // ============================================================

    var eventHandlers = {};

    /**
     * 绑定事件
     */
    function on(eventName, handler) {
        if (!eventHandlers[eventName]) {
            eventHandlers[eventName] = [];
        }
        eventHandlers[eventName].push(handler);
    }

    /**
     * 解绑事件
     */
    function off(eventName, handler) {
        if (!eventHandlers[eventName]) return;
        var index = eventHandlers[eventName].indexOf(handler);
        if (index > -1) {
            eventHandlers[eventName].splice(index, 1);
        }
    }

    /**
     * 触发事件
     */
    function triggerEvent(eventName, data) {
        if (!eventHandlers[eventName]) return;
        eventHandlers[eventName].forEach(function (handler) {
            try {
                handler(data);
            } catch (e) {
                console.error('[SZ.app] 事件处理异常:', eventName, e);
            }
        });
    }

    // 暴露事件方法
    app.on = on;
    app.off = off;
    app.trigger = triggerEvent;

    // ============================================================
    //  音效播放封装
    // ============================================================

    /**
     * 播放音效
     */
    function playSound(soundName, options) {
        if (!app.state.settings.soundEnabled) return;
        if (SZ.sounds && typeof SZ.sounds.play === 'function') {
            try {
                SZ.sounds.play(soundName, options);
            } catch (e) {
                // 静默失败
            }
        }
    }

    /**
     * 设置音效音量
     */
    function setSoundVolume(volume) {
        if (SZ.sounds && typeof SZ.sounds.setVolume === 'function') {
            SZ.sounds.setVolume('master', volume);
        }
    }

    // ============================================================
    //  路由/面板切换
    // ============================================================

    /**
     * 切换面板
     * @param {string} panelId - 面板ID
     * @param {object} options - 切换选项
     */
    app.switchPanel = function (panelId, options) {
        options = options || {};

        if (app.state.currentPanel === panelId && !options.force) {
            return;
        }

        console.log('[SZ.app] 切换面板:', app.state.currentPanel, '->', panelId);

        // 播放切换音效
        playSound('ui_switch');

        // 触发切换前事件
        triggerEvent('panel:beforeChange', {
            from: app.state.currentPanel,
            to: panelId
        });

        // 隐藏所有面板
        hideAllPanels();

        // 显示目标面板
        showPanel(panelId);

        // 更新当前面板状态
        var oldPanel = app.state.currentPanel;
        app.state.currentPanel = panelId;

        // 更新导航状态
        updateNavActiveState(panelId);

        // 渲染目标面板内容
        renderPanelContent(panelId, options);

        // 触发切换后事件
        triggerEvent('panel:change', {
            from: oldPanel,
            to: panelId
        });

        // 粒子特效
        if (SZ.particles && SZ.particles.trigger) {
            SZ.particles.trigger('panel_change', { panel: panelId });
        }
    };

    /**
     * 隐藏所有面板
     */
    function hideAllPanels() {
        var panels = document.querySelectorAll('.panel');
        panels.forEach(function (panel) {
            panel.classList.remove('active');
            panel.hidden = true;
        });
    }

    /**
     * 显示指定面板
     */
    function showPanel(panelId) {
        var panelMap = {
            'welcome': app.dom.panelWelcome,
            'quiz': app.dom.panelQuiz,
            'stats': app.dom.panelStats
        };

        var panel = panelMap[panelId];
        if (panel) {
            panel.hidden = false;
            // 使用requestAnimationFrame确保hidden移除后再添加active类
            requestAnimationFrame(function () {
                panel.classList.add('active');
            });
        }
    }

    /**
     * 更新导航激活状态
     */
    function updateNavActiveState(panelId) {
        // 更新顶部Tabs
        if (app.dom.modeTabs) {
            var tabs = app.dom.modeTabs.querySelectorAll('.mode-tab');
            tabs.forEach(function (tab) {
                var mode = tab.dataset.mode;
                if ((mode === 'practice' && (panelId === 'welcome' || panelId === 'quiz')) ||
                    (mode === 'exam' && panelId === 'quiz' && app.state.currentMode === MODE_ENTRIES.EXAM) ||
                    (mode === 'review' && panelId === 'wrong')) {
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                } else {
                    tab.classList.remove('active');
                    tab.setAttribute('aria-selected', 'false');
                }
            });
        }

        // 更新统计按钮状态
        if (app.dom.btnStats) {
            if (panelId === 'stats') {
                app.dom.btnStats.classList.add('active');
            } else {
                app.dom.btnStats.classList.remove('active');
            }
        }
    }

    /**
     * 渲染面板内容
     */
    function renderPanelContent(panelId, options) {
        switch (panelId) {
            case PANELS.WELCOME:
                renderWelcome();
                break;
            case PANELS.QUIZ:
                // 答题面板在进入模式时渲染
                break;
            case PANELS.STATS:
                renderStats();
                break;
            case PANELS.WRONG:
                renderWrongBook();
                break;
        }
    }

    // ============================================================
    //  欢迎页渲染
    // ============================================================

    /**
     * 渲染欢迎页
     */
    function renderWelcome() {
        console.log('[SZ.app] 渲染欢迎页');

        // 获取今日学习数据
        var todayData = getTodayStats();

        // 更新今日数据卡片
        if (app.dom.todayDone) {
            animateNumber(app.dom.todayDone, todayData.doneCount, 0, 800);
        }
        if (app.dom.todayTarget) {
            app.dom.todayTarget.textContent = todayData.targetCount;
        }
        if (app.dom.todayAccuracy) {
            app.dom.todayAccuracy.textContent = todayData.accuracy + '%';
        }

        // 更新整体进度
        updateOverallProgress();

        // 更新继续练习按钮
        updateContinueButton();
    }

    /**
     * 获取今日学习统计
     */
    function getTodayStats() {
        if (SZ.stats && typeof SZ.stats.getDailyStats === 'function') {
            var stats = SZ.stats.getDailyStats(getTodayString());
            return {
                doneCount: stats.totalQuestions || 0,
                correctCount: stats.correctCount || 0,
                accuracy: stats.totalQuestions > 0
                    ? Math.round(stats.correctCount / stats.totalQuestions * 100)
                    : 0,
                targetCount: app.state.settings.dailyGoal || 50,
                studyTime: stats.studyTime || 0
            };
        }

        return {
            doneCount: 0,
            correctCount: 0,
            accuracy: 0,
            targetCount: 50,
            studyTime: 0
        };
    }

    /**
     * 更新整体学习进度
     */
    function updateOverallProgress() {
        if (!app.dom.overallProgress) return;

        var total = app.state.questions.length;
        var completed = 0;

        if (SZ.stats && typeof SZ.stats.getOverallStats === 'function') {
            var overall = SZ.stats.getOverallStats();
            completed = overall.totalAnswered || 0;
        }

        var percent = total > 0 ? Math.round(completed / total * 100) : 0;
        percent = Math.min(percent, 100);

        app.dom.overallProgress.style.width = percent + '%';

        // 更新进度标签
        var labels = app.dom.overallProgress.parentElement.parentElement.querySelector('.progress-labels');
        if (labels) {
            labels.innerHTML =
                '<span>已完成 ' + formatNumber(completed) + '/' + formatNumber(total) + ' 题</span>' +
                '<span>' + percent + '%</span>';
        }
    }

    /**
     * 更新继续练习按钮
     */
    function updateContinueButton() {
        if (!app.dom.btnContinuePractice) return;

        var lastIndex = getStorage(STORAGE_KEYS.CURRENT_QUESTION_INDEX, 0);
        var total = app.state.questions.length;
        var btnSub = app.dom.btnContinuePractice.querySelector('.btn-sub');

        if (btnSub) {
            btnSub.textContent = '第 ' + (lastIndex + 1) + ' 题 / 共 ' + total + ' 题';
        }
    }

    /**
     * 数字动画
     */
    function animateNumber(element, target, start, duration) {
        start = start || 0;
        duration = duration || 500;

        var startTime = performance.now();
        var startVal = parseInt(element.textContent) || start;

        function update(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // easeOutQuad
            progress = progress * (2 - progress);

            var current = Math.round(startVal + (target - startVal) * progress);
            element.textContent = formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ============================================================
    //  更新侧边栏统计
    // ============================================================

    /**
     * 更新侧边栏统计数据
     */
    function updateSidebarStats() {
        var stats = {
            totalDays: 0,
            totalQuestions: 0,
            accuracy: 0,
            streakDays: 0
        };

        if (SZ.stats && typeof SZ.stats.getOverallStats === 'function') {
            var overall = SZ.stats.getOverallStats();
            stats.totalDays = overall.studyDays || 0;
            stats.totalQuestions = overall.totalAnswered || 0;
            stats.accuracy = overall.totalAnswered > 0
                ? Math.round(overall.correctCount / overall.totalAnswered * 100)
                : 0;
            stats.streakDays = overall.streak || 0;
        }

        if (app.dom.miniTotalDays) {
            app.dom.miniTotalDays.textContent = stats.totalDays;
        }
        if (app.dom.miniTotalQuestions) {
            app.dom.miniTotalQuestions.textContent = formatNumber(stats.totalQuestions);
        }
        if (app.dom.miniAccuracy) {
            app.dom.miniAccuracy.textContent = stats.accuracy + '%';
        }
        if (app.dom.streakDays) {
            app.dom.streakDays.textContent = stats.streakDays;
        }

        // 更新错题本数量
        var wrongBadge = document.querySelector('.mode-item[data-mode-entry="wrong"] .mode-item-badge');
        if (wrongBadge && SZ.stats && typeof SZ.stats.getWrongBook === 'function') {
            var wrongBook = SZ.stats.getWrongBook();
            wrongBadge.textContent = wrongBook.length || 0;
        }

        // 更新收藏夹数量
        var favBadge = document.querySelector('.mode-item[data-mode-entry="favorite"] .mode-item-badge');
        if (favBadge && SZ.stats && typeof SZ.stats.getFavorites === 'function') {
            var favorites = SZ.stats.getFavorites();
            favBadge.textContent = favorites.length || 0;
        }
    }

    // ============================================================
    //  刷题模式管理
    // ============================================================

    /**
     * 进入刷题模式
     * @param {string} modeEntry - 模式入口标识
     * @param {object} config - 模式配置
     */
    app.enterMode = function (modeEntry, config) {
        console.log('[SZ.app] 进入模式:', modeEntry, config);

        app.state.currentMode = modeEntry;
        app.state.modeConfig = config || {};

        // 更新模式徽章
        updateModeBadge(modeEntry);

        // 根据模式生成题目列表
        generateQuestionList(modeEntry, config);

        // 重置答题状态
        resetQuizState();

        // 切换到答题面板
        app.switchPanel(PANELS.QUIZ, { force: true });

        // 初始化计时器
        initTimer(modeEntry);

        // 渲染第一题
        if (app.state.currentQuestionList.length > 0) {
            renderCurrentQuestion();
            renderAnswerCard();
        } else {
            showEmptyState(modeEntry);
        }

        // 保存当前模式
        setStorage(STORAGE_KEYS.CURRENT_MODE, modeEntry);

        // 触发模式进入事件
        triggerEvent('mode:enter', { mode: modeEntry, config: config });

        // 播放模式进入音效
        playSound('mode_enter');
    };

    /**
     * 更新模式徽章
     */
    function updateModeBadge(modeEntry) {
        if (!app.dom.currentModeBadge) return;

        var badgeMap = {
            'order': '顺序练习',
            'random': '随机练习',
            'chapter': '章节练习',
            'daily': '每日一练',
            'exam': '模拟考试',
            'wrong': '错题回顾',
            'favorite': '收藏夹',
            'challenge': '挑战模式'
        };

        app.dom.currentModeBadge.textContent = badgeMap[modeEntry] || '练习';
    }

    /**
     * 根据模式生成题目列表
     */
    function generateQuestionList(modeEntry, config) {
        config = config || {};
        var questions = app.state.questions.slice();

        switch (modeEntry) {
            case MODE_ENTRIES.ORDER:
                // 顺序练习：按原始顺序
                app.state.currentQuestionList = questions;
                // 恢复上次进度
                var lastIndex = getStorage(STORAGE_KEYS.CURRENT_QUESTION_INDEX, 0);
                app.state.currentQuestionIndex = Math.min(lastIndex, questions.length - 1);
                break;

            case MODE_ENTRIES.RANDOM:
                // 随机练习：打乱顺序
                app.state.currentQuestionList = shuffleArray(questions);
                app.state.currentQuestionIndex = 0;
                break;

            case MODE_ENTRIES.CHAPTER:
                // 章节练习：按部门/章节筛选
                var dept = config.department;
                if (dept) {
                    app.state.currentQuestionList = questions.filter(function (q) {
                        return q.department === dept;
                    });
                } else {
                    app.state.currentQuestionList = questions;
                }
                app.state.currentQuestionIndex = 0;
                break;

            case MODE_ENTRIES.DAILY:
                // 每日一练：每天10道随机题
                var dailyKey = 'sz_daily_' + getTodayString();
                var dailyQuestionIds = getStorage(dailyKey, null);

                if (!dailyQuestionIds) {
                    var shuffled = shuffleArray(questions);
                    var dailyCount = config.count || 10;
                    var dailyQuestions = shuffled.slice(0, dailyCount);
                    dailyQuestionIds = dailyQuestions.map(function (q) { return q.id; });
                    setStorage(dailyKey, dailyQuestionIds);
                }

                app.state.currentQuestionList = questions.filter(function (q) {
                    return dailyQuestionIds.indexOf(q.id) > -1;
                });
                // 按保存的顺序排列
                app.state.currentQuestionList.sort(function (a, b) {
                    return dailyQuestionIds.indexOf(a.id) - dailyQuestionIds.indexOf(b.id);
                });
                app.state.currentQuestionIndex = 0;
                break;

            case MODE_ENTRIES.EXAM:
                // 模拟考试：随机抽取指定数量
                var examCount = config.questionCount || 100;
                var examShuffled = shuffleArray(questions);
                app.state.currentQuestionList = examShuffled.slice(0, examCount);
                app.state.currentQuestionIndex = 0;

                // 设置考试时长（每题约1分钟）
                app.state.timer.totalTime = config.timeLimit || (examCount * 60);
                app.state.examState.remainingTime = app.state.timer.totalTime;
                break;

            case MODE_ENTRIES.WRONG:
                // 错题本：从统计系统获取错题
                if (SZ.stats && typeof SZ.stats.getWrongBook === 'function') {
                    var wrongBook = SZ.stats.getWrongBook();
                    var wrongIds = wrongBook.map(function (item) { return item.questionId; });
                    app.state.currentQuestionList = questions.filter(function (q) {
                        return wrongIds.indexOf(q.id) > -1;
                    });
                } else {
                    app.state.currentQuestionList = [];
                }
                app.state.currentQuestionIndex = 0;
                break;

            case MODE_ENTRIES.FAVORITE:
                // 收藏夹
                if (SZ.stats && typeof SZ.stats.getFavorites === 'function') {
                    var favorites = SZ.stats.getFavorites();
                    var favIds = favorites.map(function (item) { return item.questionId; });
                    app.state.currentQuestionList = questions.filter(function (q) {
                        return favIds.indexOf(q.id) > -1;
                    });
                } else {
                    app.state.currentQuestionList = [];
                }
                app.state.currentQuestionIndex = 0;
                break;

            case MODE_ENTRIES.CHALLENGE:
                // 挑战模式：限时答题
                var challengeCount = config.questionCount || 20;
                var challengeShuffled = shuffleArray(questions);
                app.state.currentQuestionList = challengeShuffled.slice(0, challengeCount);
                app.state.currentQuestionIndex = 0;
                app.state.timer.totalTime = config.timeLimit || 300; // 5分钟
                break;

            default:
                app.state.currentQuestionList = questions;
                app.state.currentQuestionIndex = 0;
        }
    }

    /**
     * 重置答题状态
     */
    function resetQuizState() {
        app.state.answerRecords = {};
        app.state.selectedOptions = [];
        app.state.answerSubmitted = false;
        app.state.combo = 0;

        // 停止之前的计时器
        stopTimer();
    }

    /**
     * Fisher-Yates 洗牌算法
     */
    function shuffleArray(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    /**
     * 显示空状态
     */
    function showEmptyState(modeEntry) {
        var emptyMessages = {
            'wrong': '暂无错题，继续保持！',
            'favorite': '暂无收藏题目',
            'daily': '今日练习已完成，明天再来吧！',
            'default': '暂无题目数据'
        };

        var message = emptyMessages[modeEntry] || emptyMessages.default;

        var container = document.getElementById('question-container');
        if (container) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<svg class="empty-icon"><use href="#icon-book"/></svg>' +
                    '<p class="empty-text">' + message + '</p>' +
                    '<button class="btn btn-primary" onclick="SZ.app.switchPanel(\'welcome\')">' +
                        '返回首页' +
                    '</button>' +
                '</div>';
        }

        // 隐藏操作栏
        var actions = document.querySelector('.quiz-actions');
        if (actions) {
            actions.style.display = 'none';
        }
    }

    // ============================================================
    //  计时器管理
    // ============================================================

    /**
     * 初始化计时器
     */
    function initTimer(modeEntry) {
        // 某些模式需要计时器
        var needsTimer = modeEntry === MODE_ENTRIES.EXAM ||
                         modeEntry === MODE_ENTRIES.CHALLENGE ||
                         app.state.settings.showTimer;

        if (!needsTimer) {
            app.state.timer.enabled = false;
            return;
        }

        app.state.timer.enabled = true;
        app.state.timer.startTime = Date.now();
        app.state.timer.elapsed = 0;

        // 考试/挑战模式使用倒计时
        if (modeEntry === MODE_ENTRIES.EXAM || modeEntry === MODE_ENTRIES.CHALLENGE) {
            app.state.examState.started = true;
            startCountdown();
        } else {
            // 练习模式使用正计时
            startStopwatch();
        }
    }

    /**
     * 启动正计时
     */
    function startStopwatch() {
        stopTimer();
        app.state.timer.startTime = Date.now() - app.state.timer.elapsed * 1000;

        app.state.timer.intervalId = setInterval(function () {
            app.state.timer.elapsed = Math.floor((Date.now() - app.state.timer.startTime) / 1000);
            updateTimerDisplay();
        }, 1000);
    }

    /**
     * 启动倒计时
     */
    function startCountdown() {
        stopTimer();

        app.state.timer.intervalId = setInterval(function () {
            app.state.examState.remainingTime--;
            updateTimerDisplay();

            // 时间到
            if (app.state.examState.remainingTime <= 0) {
                stopTimer();
                handleTimeUp();
            }

            // 最后1分钟提示
            if (app.state.examState.remainingTime === 60) {
                playSound('exam_warning');
                showToast('考试还有1分钟结束', 'warning');
            }
        }, 1000);
    }

    /**
     * 停止计时器
     */
    function stopTimer() {
        if (app.state.timer.intervalId) {
            clearInterval(app.state.timer.intervalId);
            app.state.timer.intervalId = null;
        }
    }

    /**
     * 暂停计时器
     */
    function pauseTimer() {
        if (app.state.timer.intervalId) {
            stopTimer();
            app.state.examState.paused = true;
        }
    }

    /**
     * 恢复计时器
     */
    function resumeTimer() {
        if (app.state.examState.paused) {
            if (app.state.currentMode === MODE_ENTRIES.EXAM ||
                app.state.currentMode === MODE_ENTRIES.CHALLENGE) {
                startCountdown();
            } else {
                startStopwatch();
            }
            app.state.examState.paused = false;
        }
    }

    /**
     * 更新计时器显示
     */
    function updateTimerDisplay() {
        var displayEl = app.dom.timerDisplay || document.getElementById('timer-display');
        if (!displayEl) return;

        var timeStr;
        if (app.state.currentMode === MODE_ENTRIES.EXAM ||
            app.state.currentMode === MODE_ENTRIES.CHALLENGE) {
            timeStr = formatTime(app.state.examState.remainingTime);
        } else {
            timeStr = formatTime(app.state.timer.elapsed);
        }

        displayEl.textContent = timeStr;
    }

    /**
     * 处理时间到
     */
    function handleTimeUp() {
        playSound('exam_end');

        showConfirmDialog({
            title: '考试时间到',
            message: '考试时间已结束，系统将自动提交您的答卷。',
            confirmText: '查看成绩',
            showCancel: false,
            onConfirm: function () {
                submitExam();
            }
        });
    }

    // ============================================================
    //  题目渲染
    // ============================================================

    /**
     * 渲染当前题目
     */
    function renderCurrentQuestion() {
        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        renderQuestion(question);
        renderProgress();
        updateNavButtons();
    }

    /**
     * 渲染题目
     */
    function renderQuestion(question) {
        if (!question) return;

        var qIndex = app.state.currentQuestionIndex + 1;
        var total = app.state.currentQuestionList.length;

        // 题号
        if (app.dom.questionIndex) {
            app.dom.questionIndex.textContent = qIndex < 10 ? '0' + qIndex : qIndex;
        }

        // 分类/部门
        if (app.dom.questionCategory) {
            app.dom.questionCategory.textContent = question.department || '综合';
        }

        // 题型
        if (app.dom.questionType) {
            app.dom.questionType.textContent = question.type + '题';
        }

        // 题干
        if (app.dom.questionStem) {
            app.dom.questionStem.innerHTML = '<p>' + escapeHtml(question.question) + '</p>';
        }

        // 渲染选项
        renderOptions(question.options, question.type);

        // 重置答案状态
        app.state.selectedOptions = [];
        app.state.answerSubmitted = false;

        // 隐藏解析
        if (app.dom.answerAnalysis) {
            app.dom.answerAnalysis.hidden = true;
        }

        // 更新收藏状态
        updateFavoriteButton(question.id);

        // 检查是否已有答题记录
        var record = app.state.answerRecords[question.id];
        if (record) {
            // 恢复已选答案
            app.state.selectedOptions = record.userAnswer
                ? record.userAnswer.split('')
                : [];
            restoreSelectedOptions();

            // 显示答题结果
            if (record.status !== ANSWER_STATUS.UNANSWERED) {
                app.state.answerSubmitted = true;
                showAnswerResult(record.status === ANSWER_STATUS.CORRECT, false);
            }
        }

        // 保存当前进度（顺序练习模式）
        if (app.state.currentMode === MODE_ENTRIES.ORDER) {
            setStorage(STORAGE_KEYS.CURRENT_QUESTION_INDEX, app.state.currentQuestionIndex);
        }

        // 触发题目渲染事件
        triggerEvent('question:render', { question: question, index: qIndex });
    }

    /**
     * 渲染选项
     */
    function renderOptions(options, type) {
        if (!app.dom.optionsList) return;

        var optionLabels = 'ABCDEF';
        var html = '';
        var inputType = (type === QUESTION_TYPES.MULTIPLE) ? 'checkbox' : 'radio';

        options.forEach(function (option, index) {
            var label = optionLabels[index] || String.fromCharCode(65 + index);
            html +=
                '<label class="option-item" data-option="' + label + '">' +
                    '<input type="' + inputType + '" name="question-option" value="' + label + '">' +
                    '<span class="option-marker">' + label + '</span>' +
                    '<span class="option-text">' + escapeHtml(option) + '</span>' +
                    '<span class="option-indicator"></span>' +
                '</label>';
        });

        app.dom.optionsList.innerHTML = html;
        app.dom.optionsList.setAttribute('role', inputType === 'checkbox' ? 'group' : 'radiogroup');

        // 绑定选项点击事件
        bindOptionEvents();
    }

    /**
     * 恢复已选选项状态
     */
    function restoreSelectedOptions() {
        var optionItems = app.dom.optionsList.querySelectorAll('.option-item');
        optionItems.forEach(function (item) {
            var option = item.dataset.option;
            var input = item.querySelector('input');
            if (app.state.selectedOptions.indexOf(option) > -1) {
                item.classList.add('selected');
                if (input) input.checked = true;
            }
        });
    }

    /**
     * 更新收藏按钮状态
     */
    function updateFavoriteButton(questionId) {
        if (!app.dom.btnFavorite) return;

        var isFavorite = false;
        if (SZ.stats && typeof SZ.stats.isFavorite === 'function') {
            isFavorite = SZ.stats.isFavorite(questionId);
        }

        if (isFavorite) {
            app.dom.btnFavorite.classList.add('active');
        } else {
            app.dom.btnFavorite.classList.remove('active');
        }
    }

    // ============================================================
    //  选项交互
    // ============================================================

    /**
     * 绑定选项事件
     */
    function bindOptionEvents() {
        var optionItems = app.dom.optionsList.querySelectorAll('.option-item');

        optionItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                // 已提交答案时不响应选择
                if (app.state.answerSubmitted) return;

                e.preventDefault();
                var option = item.dataset.option;

                handleOptionClick(option, item);
            });
        });
    }

    /**
     * 处理选项点击
     */
    function handleOptionClick(option, element) {
        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        var type = question.type;
        var input = element.querySelector('input');

        if (type === QUESTION_TYPES.MULTIPLE) {
            // 多选题：切换选中状态
            var idx = app.state.selectedOptions.indexOf(option);
            if (idx > -1) {
                app.state.selectedOptions.splice(idx, 1);
                element.classList.remove('selected');
                if (input) input.checked = false;
            } else {
                app.state.selectedOptions.push(option);
                element.classList.add('selected');
                if (input) input.checked = true;
            }

            // 排序选项
            app.state.selectedOptions.sort();

            playSound('ui_select');
            vibrate(10);
        } else {
            // 单选/判断题：直接选中
            var optionItems = app.dom.optionsList.querySelectorAll('.option-item');
            optionItems.forEach(function (item) {
                item.classList.remove('selected');
                var inp = item.querySelector('input');
                if (inp) inp.checked = false;
            });

            app.state.selectedOptions = [option];
            element.classList.add('selected');
            if (input) input.checked = true;

            playSound('ui_select');
            vibrate(10);

            // 自动提交（如果设置了自动提交且为判断题）
            if (app.state.settings.autoNext && type === QUESTION_TYPES.JUDGE) {
                setTimeout(function () {
                    submitAnswer();
                }, 300);
            }
        }
    }

    // ============================================================
    //  答案提交与反馈
    // ============================================================

    /**
     * 提交答案
     */
    function submitAnswer() {
        if (app.state.answerSubmitted) return;

        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        // 检查是否有选择
        if (app.state.selectedOptions.length === 0) {
            showToast('请先选择答案', 'warning');
            playSound('ui_warning');
            return;
        }

        // 标记已提交
        app.state.answerSubmitted = true;

        // 用户答案
        var userAnswer = app.state.selectedOptions.join('');
        var correctAnswer = question.answer;
        var isCorrect = userAnswer === correctAnswer;

        // 记录答题结果
        var record = {
            questionId: question.id,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            status: isCorrect ? ANSWER_STATUS.CORRECT : ANSWER_STATUS.WRONG,
            timeSpent: 0,
            timestamp: Date.now()
        };
        app.state.answerRecords[question.id] = record;

        // 同步到统计系统
        syncAnswerRecord(question, record);

        // 更新连击
        if (isCorrect) {
            app.state.combo++;
            app.state.maxCombo = Math.max(app.state.maxCombo, app.state.combo);
        } else {
            app.state.combo = 0;
        }

        // 显示答案结果
        showAnswerResult(isCorrect, true);

        // 更新答题卡
        updateAnswerCardItem(app.state.currentQuestionIndex, record.status);

        // 播放音效
        if (isCorrect) {
            playSound('correct_' + (Math.floor(Math.random() * 3) + 1));
            vibrate([30, 50, 30]);
        } else {
            playSound('wrong_' + (Math.floor(Math.random() * 3) + 1));
            vibrate([100]);
        }

        // 粒子特效
        if (SZ.particles && SZ.particles.trigger) {
            SZ.particles.trigger(isCorrect ? 'correct' : 'wrong', {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }

        // 自动下一题
        if (app.state.settings.autoNext && isCorrect) {
            setTimeout(function () {
                goToNextQuestion();
            }, 1500);
        }

        // 检查成就
        checkAchievements(question, record);

        // 触发答案提交事件
        triggerEvent('answer:submit', {
            question: question,
            record: record,
            isCorrect: isCorrect,
            combo: app.state.combo
        });
    }

    /**
     * 显示答案结果
     */
    function showAnswerResult(isCorrect, animate) {
        if (!app.dom.answerAnalysis) return;

        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        // 显示解析区
        app.dom.answerAnalysis.hidden = false;

        // 更新结果文本
        if (app.dom.analysisResult) {
            if (isCorrect) {
                app.dom.analysisResult.className = 'analysis-result result-correct';
                app.dom.analysisResult.innerHTML =
                    '<svg class="icon"><use href="#icon-check"/></svg>' +
                    '回答正确' +
                    (app.state.combo > 2 ? ' <span class="combo-badge">x' + app.state.combo + '</span>' : '');
            } else {
                app.dom.analysisResult.className = 'analysis-result result-wrong';
                app.dom.analysisResult.innerHTML =
                    '<svg class="icon"><use href="#icon-close"/></svg>' +
                    '回答错误';
            }
        }

        // 正确答案
        if (app.dom.correctAnswer) {
            app.dom.correctAnswer.textContent = '正确答案：' + question.answer;
        }

        // 解析文本
        if (app.dom.analysisText) {
            var explanation = question.explanation ||
                '本题考查对知识点的理解和运用，请结合正确答案加深记忆。';
            app.dom.analysisText.textContent = explanation;
        }

        // 标记选项正确/错误状态
        var optionItems = app.dom.optionsList.querySelectorAll('.option-item');
        optionItems.forEach(function (item) {
            var option = item.dataset.option;
            item.classList.remove('correct', 'wrong', 'selected');

            if (question.answer.indexOf(option) > -1) {
                item.classList.add('correct');
            }
            if (app.state.selectedOptions.indexOf(option) > -1 &&
                question.answer.indexOf(option) === -1) {
                item.classList.add('wrong');
            }
        });

        // 动画效果
        if (animate) {
            app.dom.answerAnalysis.style.animation = 'none';
            // 强制重绘
            app.dom.answerAnalysis.offsetHeight;
            app.dom.answerAnalysis.style.animation = 'slideUp 0.3s ease';
        }
    }

    /**
     * 同步答题记录到统计系统
     */
    function syncAnswerRecord(question, record) {
        if (!SZ.stats) return;

        // 记录答题
        if (typeof SZ.stats.recordAnswer === 'function') {
            SZ.stats.recordAnswer({
                questionId: question.id,
                questionType: question.type,
                department: question.department,
                isCorrect: record.status === ANSWER_STATUS.CORRECT,
                userAnswer: record.userAnswer,
                timeSpent: record.timeSpent,
                timestamp: record.timestamp
            });
        }

        // 错题加入错题本
        if (record.status === ANSWER_STATUS.WRONG) {
            if (typeof SZ.stats.addToWrongBook === 'function') {
                SZ.stats.addToWrongBook({
                    questionId: question.id,
                    wrongAnswer: record.userAnswer,
                    timestamp: record.timestamp
                });
            }
        } else {
            // 答对时，错题本中的题可以考虑降低复习权重或移除
            if (typeof SZ.stats.removeFromWrongBook === 'function' &&
                app.state.currentMode === MODE_ENTRIES.WRONG) {
                // 在错题复习模式下答对可选择移除
                // SZ.stats.removeFromWrongBook(question.id);
            }
        }

        // 更新掌握度
        if (typeof SZ.stats.updateMastery === 'function') {
            SZ.stats.updateMastery(question.id, record.status === ANSWER_STATUS.CORRECT);
        }

        // 添加经验值
        if (typeof SZ.stats.addExp === 'function') {
            var exp = record.status === ANSWER_STATUS.CORRECT ? 10 : 2;
            SZ.stats.addExp(exp);
        }
    }

    /**
     * 检查成就
     */
    function checkAchievements(question, record) {
        if (!SZ.stats || typeof SZ.stats.checkAchievements !== 'function') return;

        var newAchievements = SZ.stats.checkAchievements();
        if (newAchievements && newAchievements.length > 0) {
            newAchievements.forEach(function (achievement) {
                showAchievementUnlock(achievement);
            });
        }
    }

    /**
     * 显示成就解锁弹窗
     */
    function showAchievementUnlock(achievement) {
        var popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML =
            '<div class="achievement-content">' +
                '<div class="achievement-icon">' +
                    '<svg class="icon"><use href="#icon-trophy"/></svg>' +
                '</div>' +
                '<div class="achievement-info">' +
                    '<div class="achievement-title">成就解锁</div>' +
                    '<div class="achievement-name">' + (achievement.name || '') + '</div>' +
                    '<div class="achievement-desc">' + (achievement.description || '') + '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(popup);

        playSound('achievement_unlock');

        // 3秒后移除
        setTimeout(function () {
            popup.classList.add('fade-out');
            setTimeout(function () {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 500);
        }, 3000);
    }

    // ============================================================
    //  题目导航
    // ============================================================

    /**
     * 上一题
     */
    function goToPrevQuestion() {
        if (app.state.currentQuestionIndex <= 0) {
            showToast('已经是第一题了', 'info');
            return;
        }

        app.state.currentQuestionIndex--;
        renderCurrentQuestion();
        playSound('ui_switch');

        triggerEvent('question:prev', { index: app.state.currentQuestionIndex });
    }

    /**
     * 下一题
     */
    function goToNextQuestion() {
        var total = app.state.currentQuestionList.length;

        if (app.state.currentQuestionIndex >= total - 1) {
            // 最后一题
            if (app.state.currentMode === MODE_ENTRIES.EXAM ||
                app.state.currentMode === MODE_ENTRIES.CHALLENGE) {
                // 考试/挑战模式提示提交
                showConfirmDialog({
                    title: '答题完成',
                    message: '您已完成所有题目，是否提交答卷？',
                    confirmText: '提交答卷',
                    cancelText: '再检查一下',
                    onConfirm: function () {
                        submitExam();
                    }
                });
            } else {
                showToast('已经是最后一题了', 'info');
            }
            return;
        }

        app.state.currentQuestionIndex++;
        renderCurrentQuestion();
        playSound('ui_switch');

        triggerEvent('question:next', { index: app.state.currentQuestionIndex });
    }

    /**
     * 跳转到指定题目
     */
    function goToQuestion(index) {
        var total = app.state.currentQuestionList.length;
        if (index < 0 || index >= total) return;

        app.state.currentQuestionIndex = index;
        renderCurrentQuestion();
        updateAnswerCardHighlight();

        playSound('ui_switch');

        triggerEvent('question:jump', { index: index });
    }

    /**
     * 更新导航按钮状态
     */
    function updateNavButtons() {
        var total = app.state.currentQuestionList.length;
        var current = app.state.currentQuestionIndex;

        // 上一题按钮
        if (app.dom.btnPrevQuestion) {
            app.dom.btnPrevQuestion.disabled = current <= 0;
            if (current <= 0) {
                app.dom.btnPrevQuestion.classList.add('disabled');
            } else {
                app.dom.btnPrevQuestion.classList.remove('disabled');
            }
        }

        // 下一题按钮
        if (app.dom.btnNextQuestion) {
            var isLast = current >= total - 1;
            app.dom.btnNextQuestion.disabled = isLast &&
                app.state.currentMode !== MODE_ENTRIES.EXAM &&
                app.state.currentMode !== MODE_ENTRIES.CHALLENGE;

            // 最后一题时按钮文字变化
            var btnText = app.dom.btnNextQuestion.querySelector('span') || app.dom.btnNextQuestion;
            if (isLast && (app.state.currentMode === MODE_ENTRIES.EXAM ||
                           app.state.currentMode === MODE_ENTRIES.CHALLENGE)) {
                btnText.textContent = '交卷';
            } else if (isLast) {
                btnText.textContent = '已完成';
            } else {
                btnText.textContent = '下一题';
            }
        }
    }

    // ============================================================
    //  进度条
    // ============================================================

    /**
     * 渲染进度条
     */
    function renderProgress() {
        var current = app.state.currentQuestionIndex + 1;
        var total = app.state.currentQuestionList.length;
        var percent = total > 0 ? (current / total) * 100 : 0;

        if (app.dom.quizProgressFill) {
            app.dom.quizProgressFill.style.width = percent + '%';
        }

        if (app.dom.currentQNum) {
            app.dom.currentQNum.textContent = current;
        }

        if (app.dom.totalQNum) {
            app.dom.totalQNum.textContent = total;
        }
    }

    // ============================================================
    //  答题卡
    // ============================================================

    /**
     * 渲染答题卡
     */
    function renderAnswerCard() {
        if (!app.dom.answerCardGrid) return;

        var questions = app.state.currentQuestionList;
        var html = '';

        questions.forEach(function (q, index) {
            var statusClass = 'unanswered';
            var record = app.state.answerRecords[q.id];

            if (record) {
                if (record.status === ANSWER_STATUS.CORRECT) {
                    statusClass = 'correct';
                } else if (record.status === ANSWER_STATUS.WRONG) {
                    statusClass = 'wrong';
                }
            }

            if (index === app.state.currentQuestionIndex) {
                statusClass += ' current';
            }

            html +=
                '<button class="card-item ' + statusClass + '" data-index="' + index + '">' +
                    (index + 1) +
                '</button>';
        });

        app.dom.answerCardGrid.innerHTML = html;

        // 绑定答题卡点击事件
        var cardItems = app.dom.answerCardGrid.querySelectorAll('.card-item');
        cardItems.forEach(function (item) {
            item.addEventListener('click', function () {
                var index = parseInt(item.dataset.index, 10);
                goToQuestion(index);
                closeAnswerCard();
            });
        });

        // 更新答题卡统计
        updateAnswerCardStats();
    }

    /**
     * 更新答题卡单项状态
     */
    function updateAnswerCardItem(index, status) {
        if (!app.dom.answerCardGrid) return;

        var item = app.dom.answerCardGrid.querySelector('.card-item[data-index="' + index + '"]');
        if (!item) return;

        item.classList.remove('unanswered', 'correct', 'wrong');
        if (status === ANSWER_STATUS.CORRECT) {
            item.classList.add('correct');
        } else if (status === ANSWER_STATUS.WRONG) {
            item.classList.add('wrong');
        } else {
            item.classList.add('unanswered');
        }

        // 更新统计
        updateAnswerCardStats();
    }

    /**
     * 更新答题卡高亮当前题
     */
    function updateAnswerCardHighlight() {
        if (!app.dom.answerCardGrid) return;

        var items = app.dom.answerCardGrid.querySelectorAll('.card-item');
        items.forEach(function (item) {
            item.classList.remove('current');
            var idx = parseInt(item.dataset.index, 10);
            if (idx === app.state.currentQuestionIndex) {
                item.classList.add('current');
                // 滚动到可视区域
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        });
    }

    /**
     * 更新答题卡统计
     */
    function updateAnswerCardStats() {
        var answered = 0;
        var correct = 0;
        var total = app.state.currentQuestionList.length;

        for (var id in app.state.answerRecords) {
            if (app.state.answerRecords.hasOwnProperty(id)) {
                var record = app.state.answerRecords[id];
                if (record.status !== ANSWER_STATUS.UNANSWERED) {
                    answered++;
                    if (record.status === ANSWER_STATUS.CORRECT) {
                        correct++;
                    }
                }
            }
        }

        if (app.dom.cardAnswered) {
            app.dom.cardAnswered.textContent = answered;
        }

        if (app.dom.cardAccuracy) {
            var accuracy = answered > 0 ? Math.round(correct / answered * 100) : 0;
            app.dom.cardAccuracy.textContent = accuracy + '%';
        }
    }

    /**
     * 打开答题卡
     */
    function openAnswerCard() {
        if (!app.dom.answerCardPanel) return;

        app.dom.answerCardPanel.hidden = false;
        app.state.answerCardOpen = true;

        renderAnswerCard();
        playSound('ui_open');

        triggerEvent('answerCard:open');
    }

    /**
     * 关闭答题卡
     */
    function closeAnswerCard() {
        if (!app.dom.answerCardPanel) return;

        app.dom.answerCardPanel.hidden = true;
        app.state.answerCardOpen = false;

        playSound('ui_close');

        triggerEvent('answerCard:close');
    }

    // ============================================================
    //  考试提交
    // ============================================================

    /**
     * 提交考试答卷
     */
    function submitExam() {
        stopTimer();

        var total = app.state.currentQuestionList.length;
        var answered = 0;
        var correct = 0;
        var wrong = 0;

        for (var id in app.state.answerRecords) {
            if (app.state.answerRecords.hasOwnProperty(id)) {
                var record = app.state.answerRecords[id];
                if (record.status !== ANSWER_STATUS.UNANSWERED) {
                    answered++;
                    if (record.status === ANSWER_STATUS.CORRECT) {
                        correct++;
                    } else {
                        wrong++;
                    }
                }
            }
        }

        var score = total > 0 ? Math.round(correct / total * 100) : 0;
        var timeUsed = app.state.timer.totalTime - app.state.examState.remainingTime;

        // 显示考试结果
        showExamResult({
            total: total,
            answered: answered,
            correct: correct,
            wrong: wrong,
            unanswered: total - answered,
            score: score,
            timeUsed: timeUsed,
            passed: score >= 60
        });

        // 记录考试结果
        if (SZ.stats && typeof SZ.stats.recordExam === 'function') {
            SZ.stats.recordExam({
                mode: app.state.currentMode,
                score: score,
                correct: correct,
                total: total,
                timeUsed: timeUsed,
                timestamp: Date.now()
            });
        }

        playSound(score >= 60 ? 'exam_pass' : 'exam_fail');
    }

    /**
     * 显示考试结果
     */
    function showExamResult(result) {
        var modal = document.createElement('div');
        modal.className = 'exam-result-modal modal-overlay';
        modal.innerHTML =
            '<div class="modal-content exam-result-content">' +
                '<div class="result-header ' + (result.passed ? 'passed' : 'failed') + '">' +
                    '<div class="result-icon">' +
                        '<svg class="icon"><use href="#icon-' + (result.passed ? 'trophy' : 'close') + '"/></svg>' +
                    '</div>' +
                    '<div class="result-title">' + (result.passed ? '恭喜通过！' : '未通过考试') + '</div>' +
                    '<div class="result-score">' + result.score + '<span>分</span></div>' +
                '</div>' +
                '<div class="result-body">' +
                    '<div class="result-stats">' +
                        '<div class="result-stat">' +
                            '<span class="result-stat-label">总题数</span>' +
                            '<span class="result-stat-value">' + result.total + '</span>' +
                        '</div>' +
                        '<div class="result-stat">' +
                            '<span class="result-stat-label">答对</span>' +
                            '<span class="result-stat-value correct">' + result.correct + '</span>' +
                        '</div>' +
                        '<div class="result-stat">' +
                            '<span class="result-stat-label">答错</span>' +
                            '<span class="result-stat-value wrong">' + result.wrong + '</span>' +
                        '</div>' +
                        '<div class="result-stat">' +
                            '<span class="result-stat-label">未答</span>' +
                            '<span class="result-stat-value">' + result.unanswered + '</span>' +
                        '</div>' +
                        '<div class="result-stat">' +
                            '<span class="result-stat-label">用时</span>' +
                            '<span class="result-stat-value">' + formatTime(result.timeUsed) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="result-footer">' +
                    '<button class="btn btn-secondary" id="btn-result-review">' +
                        '<svg class="icon"><use href="#icon-book"/></svg>查看解析' +
                    '</button>' +
                    '<button class="btn btn-primary" id="btn-result-back">' +
                        '返回首页' +
                    '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        // 绑定按钮事件
        modal.querySelector('#btn-result-back').addEventListener('click', function () {
            document.body.removeChild(modal);
            app.switchPanel(PANELS.WELCOME);
            updateSidebarStats();
        });

        modal.querySelector('#btn-result-review').addEventListener('click', function () {
            document.body.removeChild(modal);
            // 显示所有题目的解析
            app.state.currentQuestionIndex = 0;
            // 标记所有已答题目显示答案
            renderCurrentQuestion();
        });

        // 点击遮罩不关闭（必须点击按钮）
    }

    // ============================================================
    //  统计页面渲染
    // ============================================================

    /**
     * 渲染统计页面
     */
    function renderStats() {
        console.log('[SZ.app] 渲染统计页面');

        if (!SZ.stats) return;

        var overall = SZ.stats.getOverallStats ? SZ.stats.getOverallStats() : {};

        // 更新总体数据
        if (app.dom.statTotalQuestions) {
            animateNumber(app.dom.statTotalQuestions, overall.totalAnswered || 0, 0, 1000);
        }
        if (app.dom.statAccuracy) {
            var accuracy = overall.totalAnswered > 0
                ? (overall.correctCount / overall.totalAnswered * 100).toFixed(1)
                : '0.0';
            app.dom.statAccuracy.textContent = accuracy + '%';
        }
        if (app.dom.statStreak) {
            app.dom.statStreak.textContent = (overall.streak || 0) + ' 天';
        }

        // 触发统计渲染事件
        triggerEvent('stats:render', { stats: overall });
    }

    // ============================================================
    //  错题集渲染
    // ============================================================

    /**
     * 渲染错题集
     */
    function renderWrongBook() {
        console.log('[SZ.app] 渲染错题集');
        // 错题集实际上是一个模式入口，通过 enterMode('wrong') 进入
        // 这里可以渲染错题列表视图
    }

    // ============================================================
    //  侧边栏管理
    // ============================================================

    /**
     * 打开侧边栏
     */
    function openSidebar() {
        if (!app.dom.sidebar) return;

        app.dom.sidebar.classList.add('open');
        app.dom.sidebarOverlay.classList.add('show');
        app.state.sidebarOpen = true;

        playSound('ui_open');

        triggerEvent('sidebar:open');
    }

    /**
     * 关闭侧边栏
     */
    function closeSidebar() {
        if (!app.dom.sidebar) return;

        app.dom.sidebar.classList.remove('open');
        app.dom.sidebarOverlay.classList.remove('show');
        app.state.sidebarOpen = false;

        playSound('ui_close');

        triggerEvent('sidebar:close');
    }

    /**
     * 切换侧边栏
     */
    function toggleSidebar() {
        if (app.state.sidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // ============================================================
    //  设置面板
    // ============================================================

    /**
     * 打开设置面板
     */
    function openSettingsPanel() {
        // 如果面板已存在，直接显示
        if (app.dom.settingsPanel) {
            app.dom.settingsPanel.classList.add('open');
            app.state.settingsPanelOpen = true;
            playSound('ui_open');
            return;
        }

        // 创建设置面板
        createSettingsPanel();
        app.dom.settingsPanel.classList.add('open');
        app.state.settingsPanelOpen = true;
        playSound('ui_open');

        triggerEvent('settings:open');
    }

    /**
     * 关闭设置面板
     */
    function closeSettingsPanel() {
        if (!app.dom.settingsPanel) return;

        app.dom.settingsPanel.classList.remove('open');
        app.state.settingsPanelOpen = false;
        playSound('ui_close');

        triggerEvent('settings:close');
    }

    /**
     * 创建设置面板
     */
    function createSettingsPanel() {
        var panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.id = 'settings-panel';
        panel.innerHTML =
            '<div class="settings-overlay" id="settings-overlay"></div>' +
            '<div class="settings-content">' +
                '<div class="settings-header">' +
                    '<h2>设置</h2>' +
                    '<button class="btn-icon" id="btn-close-settings" aria-label="关闭设置">' +
                        '<svg class="icon"><use href="#icon-close"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="settings-body">' +
                    // 皮肤设置
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-palette"/></svg>皮肤主题' +
                        '</h3>' +
                        '<div class="settings-grid theme-grid" id="theme-grid"></div>' +
                    '</div>' +
                    // 字体设置
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-font"/></svg>字体设置' +
                        '</h3>' +
                        '<div class="settings-item">' +
                            '<label>字体大小</label>' +
                            '<div class="segmented-control" id="font-size-control">' +
                                '<button data-size="small">小</button>' +
                                '<button data-size="medium">中</button>' +
                                '<button data-size="large">大</button>' +
                                '<button data-size="xlarge">特大</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>字体风格</label>' +
                            '<select class="settings-select" id="font-family-select"></select>' +
                        '</div>' +
                    '</div>' +
                    // 音效设置
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-sound-on"/></svg>音效设置' +
                        '</h3>' +
                        '<div class="settings-item">' +
                            '<label>音效开关</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="sound-enabled-toggle" ' +
                                (app.state.settings.soundEnabled ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>音效音量</label>' +
                            '<input type="range" id="sound-volume" min="0" max="100" value="' +
                            Math.round(app.state.settings.soundVolume * 100) + '" class="slider-input">' +
                        '</div>' +
                    '</div>' +
                    // 背景设置
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-bg"/></svg>背景设置' +
                        '</h3>' +
                        '<div class="settings-item">' +
                            '<label>粒子特效</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="particles-enabled-toggle" ' +
                                (app.state.settings.particlesEnabled ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>背景模糊</label>' +
                            '<input type="range" id="bg-blur" min="0" max="20" value="0" class="slider-input">' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>背景亮度</label>' +
                            '<input type="range" id="bg-brightness" min="30" max="100" value="100" class="slider-input">' +
                        '</div>' +
                    '</div>' +
                    // 答题设置
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-book"/></svg>答题设置' +
                        '</h3>' +
                        '<div class="settings-item">' +
                            '<label>自动下一题</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="auto-next-toggle" ' +
                                (app.state.settings.autoNext ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>显示答案解析</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="show-answer-toggle" ' +
                                (app.state.settings.showAnswer ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                        '<div class="settings-item">' +
                            '<label>震动反馈</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="vibrate-toggle" ' +
                                (app.state.settings.vibrateEnabled ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                    // 夜间模式
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-hint"/></svg>夜间模式' +
                        '</h3>' +
                        '<div class="segmented-control" id="night-mode-control">' +
                            '<button data-mode="auto">自动</button>' +
                            '<button data-mode="manual">手动</button>' +
                        '</div>' +
                        '<div class="settings-item" id="night-mode-manual-item" style="display:none;margin-top:12px;">' +
                            '<label>夜间模式</label>' +
                            '<label class="switch">' +
                                '<input type="checkbox" id="night-mode-toggle" ' +
                                (app.state.settings.nightModeManual ? 'checked' : '') + '>' +
                                '<span class="slider"></span>' +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                    // 数据管理
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-download"/></svg>数据管理' +
                        '</h3>' +
                        '<div class="settings-actions">' +
                            '<button class="btn btn-secondary" id="btn-export-data">' +
                                '<svg class="icon"><use href="#icon-download"/></svg>导出数据' +
                            '</button>' +
                            '<button class="btn btn-secondary" id="btn-import-data">' +
                                '<svg class="icon"><use href="#icon-refresh"/></svg>导入数据' +
                            '</button>' +
                            '<input type="file" id="import-file-input" accept=".json" style="display:none;">' +
                        '</div>' +
                        '<div class="settings-actions" style="margin-top:8px;">' +
                            '<button class="btn btn-danger" id="btn-clear-data">' +
                                '清除所有数据' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    // 快捷键说明
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">' +
                            '<svg class="icon"><use href="#icon-hint"/></svg>快捷键' +
                        '</h3>' +
                        '<div class="shortcut-list">' +
                            '<div class="shortcut-item"><kbd>1-6</kbd><span>选择选项A-F</span></div>' +
                            '<div class="shortcut-item"><kbd>↑</kbd><kbd>↓</kbd><span>上一题/下一题</span></div>' +
                            '<div class="shortcut-item"><kbd>←</kbd><kbd>→</kbd><span>上一题/下一题</span></div>' +
                            '<div class="shortcut-item"><kbd>Enter</kbd><span>提交答案</span></div>' +
                            '<div class="shortcut-item"><kbd>Space</kbd><span>打开答题卡</span></div>' +
                            '<div class="shortcut-item"><kbd>Esc</kbd><span>关闭面板</span></div>' +
                        '</div>' +
                    '</div>' +
                    // 关于
                    '<div class="settings-section">' +
                        '<h3 class="settings-section-title">关于</h3>' +
                        '<div class="about-info">' +
                            '<p>书桌 ShuZhuo v2.0.0</p>' +
                            '<p>高效备考，轻松通关</p>' +
                            '<p class="copyright">© 2024 SZ Team</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(panel);
        app.dom.settingsPanel = panel;

        // 绑定设置面板事件
        bindSettingsEvents();

        // 渲染主题网格
        renderThemeGrid();

        // 渲染字体列表
        renderFontList();
    }

    /**
     * 渲染主题选择网格
     */
    function renderThemeGrid() {
        var grid = document.getElementById('theme-grid');
        if (!grid) return;

        var themes = SZ.themes && SZ.themes.getThemeList
            ? SZ.themes.getThemeList()
            : [
                { id: 'default', name: '默认', colors: ['#667eea', '#764ba2'] },
                { id: 'dark', name: '暗夜', colors: ['#2d3748', '#1a202c'] },
                { id: 'ocean', name: '海洋', colors: ['#2193b0', '#6dd5ed'] },
                { id: 'sunset', name: '日落', colors: ['#ff6b6b', '#feca57'] },
                { id: 'forest', name: '森林', colors: ['#11998e', '#38ef7d'] },
                { id: 'purple', name: '紫罗兰', colors: ['#834d9b', '#d04ed6'] }
            ];

        var html = '';
        themes.forEach(function (theme) {
            var isActive = app.state.settings.theme === theme.id;
            var gradient = theme.colors && theme.colors.length >= 2
                ? 'linear-gradient(135deg, ' + theme.colors[0] + ', ' + theme.colors[1] + ')'
                : theme.gradient || '#667eea';

            html +=
                '<button class="theme-item ' + (isActive ? 'active' : '') + '" data-theme="' + theme.id + '" title="' + theme.name + '">' +
                    '<span class="theme-preview" style="background: ' + gradient + '"></span>' +
                    '<span class="theme-name">' + theme.name + '</span>' +
                '</button>';
        });

        grid.innerHTML = html;

        // 绑定主题切换事件
        var themeItems = grid.querySelectorAll('.theme-item');
        themeItems.forEach(function (item) {
            item.addEventListener('click', function () {
                var themeId = item.dataset.theme;
                setTheme(themeId);
            });

            // hover预览
            item.addEventListener('mouseenter', function () {
                if (SZ.themes && SZ.themes.previewTheme) {
                    SZ.themes.previewTheme(item.dataset.theme);
                }
            });

            item.addEventListener('mouseleave', function () {
                if (SZ.themes && SZ.themes.cancelPreview) {
                    SZ.themes.cancelPreview();
                }
            });
        });
    }

    /**
     * 渲染字体列表
     */
    function renderFontList() {
        var select = document.getElementById('font-family-select');
        if (!select) return;

        var fonts = SZ.themes && SZ.themes.getFontList
            ? SZ.themes.getFontList()
            : [
                { id: 'system', name: '系统默认', family: 'system-ui, sans-serif' },
                { id: 'pingfang', name: '苹方', family: '"PingFang SC", sans-serif' },
                { id: 'yahei', name: '微软雅黑', family: '"Microsoft YaHei", sans-serif' },
                { id: 'hei', name: '黑体', family: '"SimHei", sans-serif' },
                { id: 'song', name: '宋体', family: '"SimSun", serif' },
                { id: 'kai', name: '楷体', family: '"KaiTi", serif' }
            ];

        var html = '';
        fonts.forEach(function (font) {
            var selected = app.state.settings.fontFamily === font.id ? 'selected' : '';
            html += '<option value="' + font.id + '" ' + selected + '>' + font.name + '</option>';
        });

        select.innerHTML = html;
    }

    /**
     * 设置主题
     */
    function setTheme(themeId) {
        app.state.settings.theme = themeId;
        saveSettings();

        if (SZ.themes && SZ.themes.setTheme) {
            SZ.themes.setTheme(themeId);
        }

        // 更新主题网格选中状态
        var themeItems = document.querySelectorAll('#theme-grid .theme-item');
        themeItems.forEach(function (item) {
            if (item.dataset.theme === themeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新粒子主题
        if (SZ.particles && SZ.particles.setTheme) {
            SZ.particles.setTheme(themeId);
        }

        playSound('ui_switch');

        triggerEvent('theme:change', { theme: themeId });
    }

    /**
     * 绑定设置面板事件
     */
    function bindSettingsEvents() {
        var panel = app.dom.settingsPanel;
        if (!panel) return;

        // 关闭按钮
        panel.querySelector('#btn-close-settings').addEventListener('click', function () {
            closeSettingsPanel();
        });

        // 点击遮罩关闭
        panel.querySelector('#settings-overlay').addEventListener('click', function () {
            closeSettingsPanel();
        });

        // 字体大小
        var fontSizeControl = panel.querySelector('#font-size-control');
        if (fontSizeControl) {
            var sizeBtns = fontSizeControl.querySelectorAll('button');
            sizeBtns.forEach(function (btn) {
                if (btn.dataset.size === app.state.settings.fontSize) {
                    btn.classList.add('active');
                }

                btn.addEventListener('click', function () {
                    sizeBtns.forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');

                    var size = btn.dataset.size;
                    app.state.settings.fontSize = size;
                    saveSettings();

                    if (SZ.themes && SZ.themes.setFontSize) {
                        SZ.themes.setFontSize(size);
                    }

                    playSound('ui_select');
                });
            });
        }

        // 字体选择
        var fontFamilySelect = panel.querySelector('#font-family-select');
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', function () {
                var fontId = this.value;
                app.state.settings.fontFamily = fontId;
                saveSettings();

                if (SZ.themes && SZ.themes.setFont) {
                    SZ.themes.setFont(fontId);
                }

                playSound('ui_select');
            });
        }

        // 音效开关
        var soundToggle = panel.querySelector('#sound-enabled-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', function () {
                app.state.settings.soundEnabled = this.checked;
                saveSettings();

                if (SZ.sounds && SZ.sounds.setEnabled) {
                    SZ.sounds.setEnabled(this.checked);
                }

                if (this.checked) {
                    playSound('ui_switch');
                }
            });
        }

        // 音效音量
        var soundVolume = panel.querySelector('#sound-volume');
        if (soundVolume) {
            soundVolume.addEventListener('input', function () {
                var volume = parseInt(this.value, 10) / 100;
                app.state.settings.soundVolume = volume;
                setSoundVolume(volume);
            });

            soundVolume.addEventListener('change', function () {
                saveSettings();
            });
        }

        // 粒子特效开关
        var particlesToggle = panel.querySelector('#particles-enabled-toggle');
        if (particlesToggle) {
            particlesToggle.addEventListener('change', function () {
                app.state.settings.particlesEnabled = this.checked;
                saveSettings();

                if (SZ.particles) {
                    if (this.checked) {
                        if (SZ.particles.start) SZ.particles.start();
                    } else {
                        if (SZ.particles.stop) SZ.particles.stop();
                    }
                }

                playSound('ui_switch');
            });
        }

        // 背景模糊
        var bgBlur = panel.querySelector('#bg-blur');
        if (bgBlur) {
            bgBlur.addEventListener('input', function () {
                var blur = this.value + 'px';
                document.documentElement.style.setProperty('--bg-blur', blur);
            });
        }

        // 背景亮度
        var bgBrightness = panel.querySelector('#bg-brightness');
        if (bgBrightness) {
            bgBrightness.addEventListener('input', function () {
                var brightness = this.value + '%';
                document.documentElement.style.setProperty('--bg-brightness', brightness);
            });
        }

        // 自动下一题
        var autoNextToggle = panel.querySelector('#auto-next-toggle');
        if (autoNextToggle) {
            autoNextToggle.addEventListener('change', function () {
                app.state.settings.autoNext = this.checked;
                saveSettings();
                playSound('ui_switch');
            });
        }

        // 显示答案解析
        var showAnswerToggle = panel.querySelector('#show-answer-toggle');
        if (showAnswerToggle) {
            showAnswerToggle.addEventListener('change', function () {
                app.state.settings.showAnswer = this.checked;
                saveSettings();
                playSound('ui_switch');
            });
        }

        // 震动反馈
        var vibrateToggle = panel.querySelector('#vibrate-toggle');
        if (vibrateToggle) {
            vibrateToggle.addEventListener('change', function () {
                app.state.settings.vibrateEnabled = this.checked;
                saveSettings();
                if (this.checked) vibrate(20);
                playSound('ui_switch');
            });
        }

        // 夜间模式
        var nightModeControl = panel.querySelector('#night-mode-control');
        if (nightModeControl) {
            var nightBtns = nightModeControl.querySelectorAll('button');
            var manualItem = panel.querySelector('#night-mode-manual-item');
            var nightToggle = panel.querySelector('#night-mode-toggle');

            nightBtns.forEach(function (btn) {
                if (btn.dataset.mode === app.state.settings.nightMode) {
                    btn.classList.add('active');
                }
                if (btn.dataset.mode === 'manual' && app.state.settings.nightMode === 'manual' && manualItem) {
                    manualItem.style.display = 'flex';
                }

                btn.addEventListener('click', function () {
                    nightBtns.forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');

                    var mode = btn.dataset.mode;
                    app.state.settings.nightMode = mode;
                    saveSettings();

                    if (mode === 'manual' && manualItem) {
                        manualItem.style.display = 'flex';
                    } else if (manualItem) {
                        manualItem.style.display = 'none';
                    }

                    checkNightMode();
                    playSound('ui_select');
                });
            });

            if (nightToggle) {
                nightToggle.addEventListener('change', function () {
                    app.state.settings.nightModeManual = this.checked;
                    saveSettings();
                    checkNightMode();
                    playSound('ui_switch');
                });
            }
        }

        // 导出数据
        var btnExport = panel.querySelector('#btn-export-data');
        if (btnExport) {
            btnExport.addEventListener('click', function () {
                exportData();
            });
        }

        // 导入数据
        var btnImport = panel.querySelector('#btn-import-data');
        var fileInput = panel.querySelector('#import-file-input');
        if (btnImport && fileInput) {
            btnImport.addEventListener('click', function () {
                fileInput.click();
            });

            fileInput.addEventListener('change', function (e) {
                var file = e.target.files[0];
                if (file) {
                    importData(file);
                }
                // 重置input以便可以重复选择同一文件
                fileInput.value = '';
            });
        }

        // 清除数据
        var btnClear = panel.querySelector('#btn-clear-data');
        if (btnClear) {
            btnClear.addEventListener('click', function () {
                showConfirmDialog({
                    title: '清除所有数据',
                    message: '此操作将清除所有学习记录、统计数据和设置，且不可恢复。确定继续吗？',
                    confirmText: '确定清除',
                    confirmClass: 'btn-danger',
                    onConfirm: function () {
                        clearAllData();
                    }
                });
            });
        }
    }

    /**
     * 导出所有数据
     */
    function exportData() {
        var data = {
            version: '2.0.0',
            exportTime: new Date().toISOString(),
            settings: app.state.settings,
            stats: SZ.stats && SZ.stats.exportData ? SZ.stats.exportData() : {},
            easterEggs: {
                unlocked: app.state.easterEggs.unlocked
            }
        };

        var jsonStr = JSON.stringify(data, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'shuzhuo_backup_' + getTodayString() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('数据导出成功', 'success');
        playSound('achievement_unlock');
    }

    /**
     * 导入数据
     */
    function importData(file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);

                showConfirmDialog({
                    title: '确认导入',
                    message: '导入数据将覆盖现有数据，确定继续吗？',
                    confirmText: '确认导入',
                    onConfirm: function () {
                        // 导入设置
                        if (data.settings) {
                            app.state.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
                            saveSettings();
                        }

                        // 导入统计数据
                        if (data.stats && SZ.stats && SZ.stats.importData) {
                            SZ.stats.importData(data.stats);
                        }

                        // 导入彩蛋
                        if (data.easterEggs && data.easterEggs.unlocked) {
                            app.state.easterEggs.unlocked = data.easterEggs.unlocked;
                            setStorage(STORAGE_KEYS.EASTER_EGGS_UNLOCKED, data.easterEggs.unlocked);
                        }

                        showToast('数据导入成功', 'success');
                        playSound('achievement_unlock');

                        // 刷新UI
                        updateSidebarStats();
                        renderWelcome();

                        // 重新应用主题
                        initTheme();
                    }
                });
            } catch (err) {
                showToast('导入失败：文件格式不正确', 'error');
                console.error('[SZ.app] 数据导入失败:', err);
            }
        };

        reader.readAsText(file);
    }

    /**
     * 清除所有数据
     */
    function clearAllData() {
        try {
            localStorage.clear();
        } catch (e) {
            // 忽略
        }

        showToast('数据已清除，即将刷新...', 'success');

        setTimeout(function () {
            location.reload();
        }, 1500);
    }

    // ============================================================
    //  搜索功能
    // ============================================================

    /**
     * 打开搜索面板
     */
    function openSearchPanel() {
        if (app.dom.searchPanel) {
            app.dom.searchPanel.classList.add('open');
            app.state.searchPanelOpen = true;
            var input = app.dom.searchPanel.querySelector('#search-input');
            if (input) {
                setTimeout(function () { input.focus(); }, 300);
            }
            playSound('ui_open');
            return;
        }

        createSearchPanel();
        app.dom.searchPanel.classList.add('open');
        app.state.searchPanelOpen = true;

        var input = app.dom.searchPanel.querySelector('#search-input');
        if (input) {
            setTimeout(function () { input.focus(); }, 300);
        }

        playSound('ui_open');
    }

    /**
     * 关闭搜索面板
     */
    function closeSearchPanel() {
        if (!app.dom.searchPanel) return;

        app.dom.searchPanel.classList.remove('open');
        app.state.searchPanelOpen = false;
        playSound('ui_close');
    }

    /**
     * 创建搜索面板
     */
    function createSearchPanel() {
        var panel = document.createElement('div');
        panel.className = 'search-panel';
        panel.id = 'search-panel';
        panel.innerHTML =
            '<div class="search-overlay" id="search-overlay"></div>' +
            '<div class="search-content">' +
                '<div class="search-header">' +
                    '<div class="search-box">' +
                        '<svg class="icon"><use href="#icon-search"/></svg>' +
                        '<input type="text" id="search-input" placeholder="搜索题目、知识点..." autocomplete="off">' +
                        '<button class="btn-icon" id="btn-clear-search" aria-label="清除搜索">' +
                            '<svg class="icon"><use href="#icon-close"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="search-body">' +
                    '<div class="search-history" id="search-history">' +
                        '<div class="search-section-title">' +
                            '<span>搜索历史</span>' +
                            '<button class="btn-text" id="btn-clear-history">清空</button>' +
                        '</div>' +
                        '<div class="history-tags" id="history-tags"></div>' +
                    '</div>' +
                    '<div class="search-results" id="search-results">' +
                        '<div class="search-placeholder">' +
                            '<svg class="icon"><use href="#icon-search"/></svg>' +
                            '<p>输入关键词搜索题目</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(panel);
        app.dom.searchPanel = panel;

        bindSearchEvents();
        renderSearchHistory();
    }

    /**
     * 绑定搜索事件
     */
    function bindSearchEvents() {
        var panel = app.dom.searchPanel;
        if (!panel) return;

        // 点击遮罩关闭
        panel.querySelector('#search-overlay').addEventListener('click', function () {
            closeSearchPanel();
        });

        // 搜索输入
        var searchInput = panel.querySelector('#search-input');
        if (searchInput) {
            var debouncedSearch = debounce(function (keyword) {
                performSearch(keyword);
            }, 300);

            searchInput.addEventListener('input', function () {
                var keyword = this.value.trim();
                if (keyword.length > 0) {
                    debouncedSearch(keyword);
                    // 隐藏历史
                    panel.querySelector('#search-history').style.display = 'none';
                } else {
                    // 显示历史
                    panel.querySelector('#search-history').style.display = 'block';
                    panel.querySelector('#search-results').innerHTML =
                        '<div class="search-placeholder">' +
                            '<svg class="icon"><use href="#icon-search"/></svg>' +
                            '<p>输入关键词搜索题目</p>' +
                        '</div>';
                }
            });

            // 回车添加到历史并搜索
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && this.value.trim()) {
                    addSearchHistory(this.value.trim());
                }
            });
        }

        // 清除搜索
        panel.querySelector('#btn-clear-search').addEventListener('click', function () {
            var input = panel.querySelector('#search-input');
            if (input) {
                input.value = '';
                input.focus();
            }
            panel.querySelector('#search-history').style.display = 'block';
            panel.querySelector('#search-results').innerHTML =
                '<div class="search-placeholder">' +
                    '<svg class="icon"><use href="#icon-search"/></svg>' +
                    '<p>输入关键词搜索题目</p>' +
                '</div>';
        });

        // 清空历史
        panel.querySelector('#btn-clear-history').addEventListener('click', function () {
            setStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
            renderSearchHistory();
        });
    }

    /**
     * 执行搜索
     */
    function performSearch(keyword) {
        if (!keyword) return;

        var results = [];
        var questions = app.state.questions;
        var lowerKeyword = keyword.toLowerCase();

        // 搜索题干和选项
        for (var i = 0; i < questions.length && results.length < 50; i++) {
            var q = questions[i];
            var match = false;

            // 题干匹配
            if (q.question && q.question.toLowerCase().indexOf(lowerKeyword) > -1) {
                match = true;
            }

            // 选项匹配
            if (!match && q.options) {
                for (var j = 0; j < q.options.length; j++) {
                    if (q.options[j].toLowerCase().indexOf(lowerKeyword) > -1) {
                        match = true;
                        break;
                    }
                }
            }

            // 部门匹配
            if (!match && q.department && q.department.toLowerCase().indexOf(lowerKeyword) > -1) {
                match = true;
            }

            if (match) {
                results.push(q);
            }
        }

        renderSearchResults(results, keyword);
    }

    /**
     * 渲染搜索结果
     */
    function renderSearchResults(results, keyword) {
        var resultsEl = document.getElementById('search-results');
        if (!resultsEl) return;

        if (results.length === 0) {
            resultsEl.innerHTML =
                '<div class="search-placeholder">' +
                    '<svg class="icon"><use href="#icon-search"/></svg>' +
                    '<p>未找到相关题目</p>' +
                    '<p class="search-tip">试试其他关键词吧</p>' +
                '</div>';
            return;
        }

        var html =
            '<div class="search-section-title">' +
                '<span>找到 ' + results.length + ' 道相关题目</span>' +
            '</div>' +
            '<div class="search-result-list">';

        results.forEach(function (q) {
            // 高亮关键词
            var highlighted = highlightKeyword(q.question, keyword);
            html +=
                '<div class="search-result-item" data-qid="' + q.id + '">' +
                    '<div class="result-item-header">' +
                        '<span class="result-type">' + (q.type || '') + '</span>' +
                        '<span class="result-dept">' + (q.department || '') + '</span>' +
                    '</div>' +
                    '<div class="result-item-content">' + highlighted + '</div>' +
                '</div>';
        });

        html += '</div>';
        resultsEl.innerHTML = html;

        // 绑定点击事件
        var items = resultsEl.querySelectorAll('.search-result-item');
        items.forEach(function (item) {
            item.addEventListener('click', function () {
                var qid = parseInt(item.dataset.qid, 10);
                jumpToQuestionById(qid);
                closeSearchPanel();
            });
        });
    }

    /**
     * 高亮关键词
     */
    function highlightKeyword(text, keyword) {
        if (!text || !keyword) return escapeHtml(text || '');

        var escaped = escapeHtml(text);
        var escapedKeyword = escapeHtml(keyword);
        var regex = new RegExp('(' + escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

        return escaped.replace(regex, '<mark>$1</mark>');
    }

    /**
     * 获取搜索历史
     */
    function getSearchHistory() {
        return getStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
    }

    /**
     * 添加搜索历史
     */
    function addSearchHistory(keyword) {
        var history = getSearchHistory();

        // 移除已存在的相同关键词
        var index = history.indexOf(keyword);
        if (index > -1) {
            history.splice(index, 1);
        }

        // 添加到开头
        history.unshift(keyword);

        // 最多保留10条
        history = history.slice(0, 10);

        setStorage(STORAGE_KEYS.SEARCH_HISTORY, history);
        renderSearchHistory();
    }

    /**
     * 渲染搜索历史
     */
    function renderSearchHistory() {
        var tagsEl = document.getElementById('history-tags');
        if (!tagsEl) return;

        var history = getSearchHistory();

        if (history.length === 0) {
            tagsEl.innerHTML = '<p class="empty-history">暂无搜索历史</p>';
            return;
        }

        var html = '';
        history.forEach(function (item) {
            html += '<button class="history-tag">' + escapeHtml(item) + '</button>';
        });

        tagsEl.innerHTML = html;

        // 绑定点击事件
        var tags = tagsEl.querySelectorAll('.history-tag');
        tags.forEach(function (tag) {
            tag.addEventListener('click', function () {
                var keyword = tag.textContent;
                var input = document.getElementById('search-input');
                if (input) {
                    input.value = keyword;
                    performSearch(keyword);
                }
                var historySection = document.getElementById('search-history');
                if (historySection) {
                    historySection.style.display = 'none';
                }
            });
        });
    }

    /**
     * 根据题目ID跳转到题目
     */
    function jumpToQuestionById(questionId) {
        var index = app.state.questions.findIndex(function (q) {
            return q.id === questionId;
        });

        if (index === -1) {
            showToast('未找到该题目', 'error');
            return;
        }

        // 进入顺序练习模式并跳转到指定题
        app.enterMode(MODE_ENTRIES.ORDER);
        app.state.currentQuestionIndex = index;
        renderCurrentQuestion();
    }

    // ============================================================
    //  彩蛋系统
    // ============================================================

    /**
     * 初始化彩蛋监听
     */
    function initEasterEggs() {
        // Logo点击彩蛋
        if (app.dom.appLogo) {
            app.dom.appLogo.addEventListener('click', handleLogoClick);
        }

        // 科乐美秘籍
        document.addEventListener('keydown', handleKonamiCode);

        // 加载已解锁的彩蛋
        console.log('[SZ.app] 已解锁彩蛋:', app.state.easterEggs.unlocked);
    }

    /**
     * 处理Logo点击
     */
    function handleLogoClick() {
        app.state.logoClickCount++;

        // 重置定时器（3秒内连续点击）
        if (app.state.logoClickTimer) {
            clearTimeout(app.state.logoClickTimer);
        }

        app.state.logoClickTimer = setTimeout(function () {
            app.state.logoClickCount = 0;
        }, 3000);

        // 点击10次解锁
        if (app.state.logoClickCount === 10) {
            unlockEasterEgg('logo_click');
            app.state.logoClickCount = 0;
        }

        // 点击时的小特效
        if (SZ.particles && SZ.particles.trigger) {
            SZ.particles.trigger('logo_click', {
                element: app.dom.appLogo
            });
        }
    }

    /**
     * 处理科乐美秘籍
     */
    function handleKonamiCode(e) {
        // 避免在输入框中触发
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        app.state.konamiSequence.push(e.key);

        // 只保留最后10个按键
        if (app.state.konamiSequence.length > KONAMI_CODE.length) {
            app.state.konamiSequence.shift();
        }

        // 检查是否匹配
        var matches = true;
        for (var i = 0; i < KONAMI_CODE.length; i++) {
            if (app.state.konamiSequence[app.state.konamiSequence.length - KONAMI_CODE.length + i].toLowerCase()
                !== KONAMI_CODE[i].toLowerCase()) {
                matches = false;
                break;
            }
        }

        if (matches && app.state.konamiSequence.length >= KONAMI_CODE.length) {
            unlockEasterEgg('konami');
            app.state.konamiSequence = [];
        }
    }

    /**
     * 解锁彩蛋
     */
    function unlockEasterEgg(eggId) {
        if (app.state.easterEggs.unlocked.indexOf(eggId) > -1) {
            // 已解锁，触发彩蛋效果
            triggerEasterEgg(eggId);
            return;
        }

        app.state.easterEggs.unlocked.push(eggId);
        setStorage(STORAGE_KEYS.EASTER_EGGS_UNLOCKED, app.state.easterEggs.unlocked);

        // 显示解锁提示
        var eggNames = {
            'logo_click': 'Logo收藏家',
            'konami': '科乐美秘籍'
        };

        showToast('彩蛋解锁：' + (eggNames[eggId] || eggId), 'success');
        playSound('achievement_unlock');

        // 触发彩蛋效果
        triggerEasterEgg(eggId);

        triggerEvent('easterEgg:unlock', { eggId: eggId });

        console.log('[SZ.app] 彩蛋解锁:', eggId);
    }

    /**
     * 触发彩蛋效果
     */
    function triggerEasterEgg(eggId) {
        switch (eggId) {
            case 'konami':
                // 科乐美：彩虹粒子特效
                if (SZ.particles && SZ.particles.trigger) {
                    SZ.particles.trigger('rainbow_burst');
                }
                // 显示彩蛋模式入口
                toggleEasterEggModeEntry(true);
                break;

            case 'logo_click':
                // Logo点击：全屏烟花
                if (SZ.particles && SZ.particles.trigger) {
                    SZ.particles.trigger('fireworks');
                }
                break;
        }

        if (SZ.easterEggs && SZ.easterEggs.trigger) {
            SZ.easterEggs.trigger(eggId);
        }
    }

    /**
     * 切换彩蛋模式入口显示
     */
    function toggleEasterEggModeEntry(show) {
        // 在侧边栏添加彩蛋模式入口
        var modeList = document.querySelector('.mode-list');
        if (!modeList) return;

        var eggEntry = modeList.querySelector('.mode-item-easter');
        if (show && !eggEntry) {
            var eggHtml =
                '<button class="mode-item mode-item-easter" data-mode-entry="easter">' +
                    '<span class="mode-item-icon">' +
                        '<svg class="icon"><use href="#icon-star"/></svg>' +
                    '</span>' +
                    '<span class="mode-item-info">' +
                        '<span class="mode-item-name">彩蛋模式</span>' +
                        '<span class="mode-item-desc">发现更多惊喜</span>' +
                    '</span>' +
                    '<span class="mode-item-badge badge-new">NEW</span>' +
                '</button>';

            modeList.insertAdjacentHTML('beforeend', eggHtml);

            // 绑定事件
            var newItem = modeList.querySelector('.mode-item-easter');
            if (newItem) {
                newItem.addEventListener('click', function () {
                    handleModeEntryClick('easter');
                });
            }
        } else if (!show && eggEntry) {
            eggEntry.remove();
        }
    }

    // ============================================================
    //  响应式适配
    // ============================================================

    /**
     * 初始化响应式
     */
    function initResponsive() {
        updateViewport();

        // 窗口大小变化
        window.addEventListener('resize', debounce(function () {
            updateViewport();
            handleResize();
        }, 200));

        // 横竖屏切换
        window.addEventListener('orientationchange', function () {
            setTimeout(function () {
                updateViewport();
                handleOrientationChange();
            }, 100);
        });

        console.log('[SZ.app] 响应式初始化完成，当前视口: ' +
                    app.state.viewport.width + 'x' + app.state.viewport.height);
    }

    /**
     * 更新视口信息
     */
    function updateViewport() {
        app.state.viewport.width = window.innerWidth;
        app.state.viewport.height = window.innerHeight;
        app.state.viewport.isMobile = isMobile();
        app.state.viewport.isPortrait = isPortrait();

        // 添加CSS类
        var body = document.body;
        if (app.state.viewport.isMobile) {
            body.classList.add('is-mobile');
        } else {
            body.classList.remove('is-mobile');
        }

        if (app.state.viewport.isPortrait) {
            body.classList.add('is-portrait');
            body.classList.remove('is-landscape');
        } else {
            body.classList.add('is-landscape');
            body.classList.remove('is-portrait');
        }
    }

    /**
     * 处理窗口大小变化
     */
    function handleResize() {
        // 调整粒子画布大小
        if (SZ.particles && SZ.particles.resize) {
            SZ.particles.resize();
        }

        // 桌面端自动关闭侧边栏
        if (!app.state.viewport.isMobile && app.state.sidebarOpen) {
            // 桌面端侧边栏默认展开，不关闭
        }

        triggerEvent('viewport:resize', {
            width: app.state.viewport.width,
            height: app.state.viewport.height
        });
    }

    /**
     * 处理横竖屏切换
     */
    function handleOrientationChange() {
        console.log('[SZ.app] 屏幕方向切换:', app.state.viewport.isPortrait ? '竖屏' : '横屏');

        // 移动端横屏时收起侧边栏
        if (app.state.viewport.isMobile && !app.state.viewport.isPortrait && app.state.sidebarOpen) {
            closeSidebar();
        }

        triggerEvent('viewport:orientationchange', {
            isPortrait: app.state.viewport.isPortrait
        });
    }

    // ============================================================
    //  触摸滑动事件
    // ============================================================

    /**
     * 初始化触摸事件
     */
    function initTouchEvents() {
        var quizContainer = document.getElementById('question-container');
        if (!quizContainer) return;

        quizContainer.addEventListener('touchstart', function (e) {
            if (!app.state.settings.swipeEnabled) return;
            if (e.touches.length !== 1) return;

            app.state.touchStartX = e.touches[0].clientX;
            app.state.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        quizContainer.addEventListener('touchend', function (e) {
            if (!app.state.settings.swipeEnabled) return;
            if (e.changedTouches.length !== 1) return;

            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;

            var deltaX = endX - app.state.touchStartX;
            var deltaY = endY - app.state.touchStartY;

            var minSwipeDistance = 50;
            var maxSwipeVertical = 30;

            // 水平滑动
            if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxSwipeVertical) {
                if (deltaX > 0) {
                    // 右滑 -> 上一题
                    goToPrevQuestion();
                } else {
                    // 左滑 -> 下一题
                    goToNextQuestion();
                }
            }
        }, { passive: true });
    }

    // ============================================================
    //  键盘快捷键
    // ============================================================

    /**
     * 初始化键盘快捷键
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            if (!app.state.settings.keyboardShortcuts) return;

            // 输入框中不触发
            var target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
                target.isContentEditable) {
                return;
            }

            // 如果设置面板或搜索面板打开，处理Esc关闭
            if (e.key === 'Escape') {
                if (app.state.settingsPanelOpen) {
                    closeSettingsPanel();
                    e.preventDefault();
                    return;
                }
                if (app.state.searchPanelOpen) {
                    closeSearchPanel();
                    e.preventDefault();
                    return;
                }
                if (app.state.answerCardOpen) {
                    closeAnswerCard();
                    e.preventDefault();
                    return;
                }
                if (app.state.sidebarOpen) {
                    closeSidebar();
                    e.preventDefault();
                    return;
                }
            }

            // 答题面板快捷键
            if (app.state.currentPanel === PANELS.QUIZ) {
                handleQuizKeyboard(e);
            }
        });
    }

    /**
     * 处理答题页面键盘快捷键
     */
    function handleQuizKeyboard(e) {
        var key = e.key;

        // 选项选择 (1-6, A-F)
        var optionKeys = {
            '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F',
            'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
            'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F'
        };

        if (optionKeys[key]) {
            var option = optionKeys[key];
            var optionItem = document.querySelector('.option-item[data-option="' + option + '"]');
            if (optionItem && !app.state.answerSubmitted) {
                handleOptionClick(option, optionItem);
                e.preventDefault();
            }
            return;
        }

        // 上下左右箭头导航
        if (key === 'ArrowUp' || key === 'ArrowLeft') {
            goToPrevQuestion();
            e.preventDefault();
            return;
        }

        if (key === 'ArrowDown' || key === 'ArrowRight') {
            goToNextQuestion();
            e.preventDefault();
            return;
        }

        // Enter提交答案
        if (key === 'Enter') {
            if (!app.state.answerSubmitted) {
                submitAnswer();
            } else {
                goToNextQuestion();
            }
            e.preventDefault();
            return;
        }

        // 空格键打开答题卡
        if (key === ' ') {
            if (app.state.answerCardOpen) {
                closeAnswerCard();
            } else {
                openAnswerCard();
            }
            e.preventDefault();
            return;
        }
    }

    // ============================================================
    //  PWA 支持
    // ============================================================

    /**
     * 初始化PWA
     */
    function initPWA() {
        // 注册 service worker
        if ('serviceWorker' in navigator) {
            // 检查是否有 sw.js 文件
            fetch('sw.js', { method: 'HEAD' })
                .then(function (response) {
                    if (response.ok) {
                        navigator.serviceWorker.register('sw.js')
                            .then(function (registration) {
                                console.log('[SZ.app] Service Worker 注册成功:', registration.scope);
                            })
                            .catch(function (error) {
                                console.warn('[SZ.app] Service Worker 注册失败:', error);
                            });
                    }
                })
                .catch(function () {
                    console.log('[SZ.app] 未检测到 Service Worker 文件');
                });
        }

        // 安装提示
        var deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredPrompt = e;
            // 可以在这里显示安装按钮
            triggerEvent('pwa:installable');
        });

        console.log('[SZ.app] PWA 初始化完成');
    }

    // ============================================================
    //  夜间模式
    // ============================================================

    /**
     * 检查夜间模式
     */
    function checkNightMode() {
        var isNight = false;

        switch (app.state.settings.nightMode) {
            case 'auto':
                // 根据时间自动判断（18:00 - 6:00）
                var hour = new Date().getHours();
                isNight = hour >= 18 || hour < 6;
                break;
            case 'manual':
                isNight = app.state.settings.nightModeManual;
                break;
            default:
                isNight = false;
        }

        if (isNight) {
            document.body.classList.add('night-mode');
        } else {
            document.body.classList.remove('night-mode');
        }
    }

    // ============================================================
    //  每日提醒
    // ============================================================

    /**
     * 检查每日提醒
     */
    function checkDailyReminder() {
        if (!app.state.settings.dailyReminder) return;

        var lastVisit = getStorage(STORAGE_KEYS.LAST_VISIT, null);
        var today = getTodayString();

        // 如果今天还没访问过，检查是否需要提醒
        if (lastVisit !== today) {
            setStorage(STORAGE_KEYS.LAST_VISIT, today);

            // 请求通知权限
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    // ============================================================
    //  Toast 提示
    // ============================================================

    /**
     * 显示Toast提示
     */
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 2000;

        // 移除已有的toast
        var existing = document.querySelector('.sz-toast');
        if (existing) {
            existing.remove();
        }

        var toast = document.createElement('div');
        toast.className = 'sz-toast toast-' + type;
        toast.innerHTML =
            '<span class="toast-icon">' + getToastIcon(type) + '</span>' +
            '<span class="toast-message">' + escapeHtml(message) + '</span>';

        document.body.appendChild(toast);

        // 触发重绘
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * 获取Toast图标
     */
    function getToastIcon(type) {
        var icons = {
            success: '<svg class="icon"><use href="#icon-check"/></svg>',
            error: '<svg class="icon"><use href="#icon-close"/></svg>',
            warning: '<svg class="icon"><use href="#icon-hint"/></svg>',
            info: '<svg class="icon"><use href="#icon-hint"/></svg>'
        };
        return icons[type] || icons.info;
    }

    // ============================================================
    //  确认对话框
    // ============================================================

    /**
     * 显示确认对话框
     * @param {object} options - 配置选项
     */
    function showConfirmDialog(options) {
        options = options || {};

        var modal = document.createElement('div');
        modal.className = 'confirm-modal modal-overlay';
        modal.innerHTML =
            '<div class="modal-content confirm-content">' +
                '<div class="confirm-header">' +
                    '<h3>' + escapeHtml(options.title || '确认') + '</h3>' +
                '</div>' +
                '<div class="confirm-body">' +
                    '<p>' + escapeHtml(options.message || '') + '</p>' +
                '</div>' +
                '<div class="confirm-footer">' +
                    (options.showCancel !== false
                        ? '<button class="btn btn-secondary" id="confirm-cancel">' +
                            (options.cancelText || '取消') +
                          '</button>'
                        : '') +
                    '<button class="btn ' + (options.confirmClass || 'btn-primary') + '" id="confirm-ok">' +
                        (options.confirmText || '确定') +
                    '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        // 确认按钮
        modal.querySelector('#confirm-ok').addEventListener('click', function () {
            document.body.removeChild(modal);
            if (options.onConfirm) {
                options.onConfirm();
            }
        });

        // 取消按钮
        var cancelBtn = modal.querySelector('#confirm-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                document.body.removeChild(modal);
                if (options.onCancel) {
                    options.onCancel();
                }
            });
        }

        // 点击遮罩取消
        modal.addEventListener('click', function (e) {
            if (e.target === modal && options.showCancel !== false) {
                document.body.removeChild(modal);
                if (options.onCancel) {
                    options.onCancel();
                }
            }
        });

        playSound('ui_open');
    }

    // ============================================================
    //  模式配置弹窗
    // ============================================================

    /**
     * 显示模式配置弹窗
     * @param {string} modeEntry - 模式入口
     * @param {Function} callback - 确认回调
     */
    function showModeConfigDialog(modeEntry, callback) {
        var configTemplates = {
            'random': {
                title: '随机练习设置',
                fields: [
                    {
                        type: 'number',
                        label: '题目数量',
                        key: 'questionCount',
                        value: 50,
                        min: 1,
                        max: app.state.questions.length
                    },
                    {
                        type: 'select',
                        label: '题目类型',
                        key: 'questionType',
                        value: 'all',
                        options: [
                            { value: 'all', label: '全部题型' },
                            { value: '单选', label: '单选题' },
                            { value: '多选', label: '多选题' },
                            { value: '判断', label: '判断题' }
                        ]
                    }
                ]
            },
            'chapter': {
                title: '章节练习设置',
                fields: [
                    {
                        type: 'select',
                        label: '选择部门/章节',
                        key: 'department',
                        value: '',
                        options: [] // 动态填充
                    }
                ]
            },
            'daily': {
                title: '每日一练设置',
                fields: [
                    {
                        type: 'number',
                        label: '每日题数',
                        key: 'count',
                        value: 10,
                        min: 5,
                        max: 50
                    }
                ]
            },
            'exam': {
                title: '模拟考试设置',
                fields: [
                    {
                        type: 'number',
                        label: '题目数量',
                        key: 'questionCount',
                        value: 100,
                        min: 10,
                        max: 200,
                        step: 10
                    },
                    {
                        type: 'number',
                        label: '考试时长（分钟）',
                        key: 'timeLimit',
                        value: 90,
                        min: 10,
                        max: 300,
                        step: 10
                    }
                ]
            },
            'challenge': {
                title: '挑战模式设置',
                fields: [
                    {
                        type: 'number',
                        label: '题目数量',
                        key: 'questionCount',
                        value: 20,
                        min: 5,
                        max: 50
                    },
                    {
                        type: 'number',
                        label: '挑战时长（秒）',
                        key: 'timeLimit',
                        value: 300,
                        min: 60,
                        max: 600,
                        step: 30
                    }
                ]
            }
        };

        var template = configTemplates[modeEntry];
        if (!template) {
            // 无配置，直接进入
            if (callback) callback({});
            return;
        }

        // 动态填充章节选项
        if (modeEntry === 'chapter' && app.state.questionMeta.departments) {
            template.fields[0].options = app.state.questionMeta.departments.map(function (dept) {
                return { value: dept, label: dept };
            });
            if (template.fields[0].options.length > 0) {
                template.fields[0].value = template.fields[0].options[0].value;
            }
        }

        var modal = document.createElement('div');
        modal.className = 'config-modal modal-overlay';

        var fieldsHtml = '';
        template.fields.forEach(function (field, index) {
            fieldsHtml += '<div class="config-field" data-field="' + field.key + '">';
            fieldsHtml += '<label class="config-label">' + field.label + '</label>';

            if (field.type === 'number') {
                fieldsHtml +=
                    '<div class="config-number">' +
                        '<button class="btn-number" data-action="decrease">−</button>' +
                        '<input type="number" value="' + field.value + '" min="' + (field.min || 0) +
                        '" max="' + (field.max || 9999) + '" step="' + (field.step || 1) + '">' +
                        '<button class="btn-number" data-action="increase">+</button>' +
                    '</div>';
            } else if (field.type === 'select') {
                fieldsHtml += '<select class="config-select">';
                field.options.forEach(function (opt) {
                    fieldsHtml +=
                        '<option value="' + opt.value + '" ' +
                        (opt.value === field.value ? 'selected' : '') + '>' +
                        opt.label + '</option>';
                });
                fieldsHtml += '</select>';
            }

            fieldsHtml += '</div>';
        });

        modal.innerHTML =
            '<div class="modal-content config-content">' +
                '<div class="config-header">' +
                    '<h3>' + template.title + '</h3>' +
                    '<button class="btn-icon" id="config-close">' +
                        '<svg class="icon"><use href="#icon-close"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="config-body">' + fieldsHtml + '</div>' +
                '<div class="config-footer">' +
                    '<button class="btn btn-secondary" id="config-cancel">取消</button>' +
                    '<button class="btn btn-primary" id="config-confirm">开始练习</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        // 数字增减按钮
        var numberFields = modal.querySelectorAll('.config-number');
        numberFields.forEach(function (field) {
            var input = field.querySelector('input');
            var decreaseBtn = field.querySelector('[data-action="decrease"]');
            var increaseBtn = field.querySelector('[data-action="increase"]');

            decreaseBtn.addEventListener('click', function () {
                var val = parseInt(input.value, 10);
                var min = parseInt(input.min, 10);
                var step = parseInt(input.step, 10) || 1;
                if (val > min) {
                    input.value = val - step;
                    playSound('ui_select');
                }
            });

            increaseBtn.addEventListener('click', function () {
                var val = parseInt(input.value, 10);
                var max = parseInt(input.max, 10);
                var step = parseInt(input.step, 10) || 1;
                if (val < max) {
                    input.value = val + step;
                    playSound('ui_select');
                }
            });
        });

        // 确认按钮
        modal.querySelector('#config-confirm').addEventListener('click', function () {
            var config = {};
            template.fields.forEach(function (field) {
                var fieldEl = modal.querySelector('[data-field="' + field.key + '"]');
                if (field.type === 'number') {
                    config[field.key] = parseInt(fieldEl.querySelector('input').value, 10);
                } else if (field.type === 'select') {
                    config[field.key] = fieldEl.querySelector('select').value;
                }
            });

            document.body.removeChild(modal);
            if (callback) callback(config);
            playSound('ui_confirm');
        });

        // 取消/关闭
        function cancelConfig() {
            document.body.removeChild(modal);
            playSound('ui_close');
        }

        modal.querySelector('#config-close').addEventListener('click', cancelConfig);
        modal.querySelector('#config-cancel').addEventListener('click', cancelConfig);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) cancelConfig();
        });

        playSound('ui_open');
    }

    /**
     * 处理模式入口点击
     */
    function handleModeEntryClick(modeEntry) {
        // 更新侧边栏激活状态
        var modeItems = document.querySelectorAll('.mode-item');
        modeItems.forEach(function (item) {
            item.classList.remove('active');
            if (item.dataset.modeEntry === modeEntry) {
                item.classList.add('active');
            }
        });

        // 关闭侧边栏（移动端）
        if (app.state.viewport.isMobile) {
            closeSidebar();
        }

        // 显示配置弹窗或直接进入
        var modesWithConfig = ['random', 'chapter', 'daily', 'exam', 'challenge'];

        if (modesWithConfig.indexOf(modeEntry) > -1) {
            showModeConfigDialog(modeEntry, function (config) {
                app.enterMode(modeEntry, config);
            });
        } else {
            app.enterMode(modeEntry, {});
        }
    }

    // ============================================================
    //  事件绑定
    // ============================================================

    /**
     * 绑定所有UI事件
     */
    function bindEvents() {
        console.log('[SZ.app] 绑定UI事件...');

        bindHeaderEvents();
        bindSidebarEvents();
        bindQuizEvents();
        bindWelcomeEvents();
        bindStatsEvents();
        bindAnswerCardEvents();
        initKeyboardShortcuts();
        initTouchEvents();

        console.log('[SZ.app] 事件绑定完成');
    }

    /**
     * 绑定顶部导航事件
     */
    function bindHeaderEvents() {
        // 菜单按钮
        if (app.dom.btnToggleSidebar) {
            app.dom.btnToggleSidebar.addEventListener('click', function () {
                toggleSidebar();
            });
        }

        // Logo点击
        if (app.dom.appLogo) {
            app.dom.appLogo.addEventListener('click', function () {
                // 返回首页
                if (app.state.currentPanel !== PANELS.WELCOME) {
                    app.switchPanel(PANELS.WELCOME);
                }
            });
        }

        // 搜索按钮
        if (app.dom.btnSearch) {
            app.dom.btnSearch.addEventListener('click', function () {
                openSearchPanel();
            });
        }

        // 快速换肤按钮
        if (app.dom.btnThemeQuick) {
            app.dom.btnThemeQuick.addEventListener('click', function () {
                // 快速切换到下一个主题
                cycleTheme();
            });
        }

        // 统计按钮
        if (app.dom.btnStats) {
            app.dom.btnStats.addEventListener('click', function () {
                if (app.state.currentPanel === PANELS.STATS) {
                    app.switchPanel(PANELS.WELCOME);
                } else {
                    app.switchPanel(PANELS.STATS);
                }
            });
        }

        // 设置按钮
        if (app.dom.btnSettings) {
            app.dom.btnSettings.addEventListener('click', function () {
                openSettingsPanel();
            });
        }

        // 顶部模式Tabs
        if (app.dom.modeTabs) {
            var tabs = app.dom.modeTabs.querySelectorAll('.mode-tab');
            tabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    var mode = tab.dataset.mode;
                    handleTopTabClick(mode);
                });
            });
        }
    }

    /**
     * 处理顶部Tab点击
     */
    function handleTopTabClick(mode) {
        switch (mode) {
            case 'practice':
                // 练习模式：进入顺序练习或继续上次
                if (app.state.currentPanel === PANELS.QUIZ) {
                    // 已在答题页，不做操作
                } else {
                    app.enterMode(MODE_ENTRIES.ORDER);
                }
                break;
            case 'exam':
                // 考试模式
                showModeConfigDialog('exam', function (config) {
                    app.enterMode(MODE_ENTRIES.EXAM, config);
                });
                break;
            case 'review':
                // 复习模式：错题本
                app.enterMode(MODE_ENTRIES.WRONG);
                break;
        }

        playSound('ui_switch');
    }

    /**
     * 快速切换主题
     */
    function cycleTheme() {
        var themes = SZ.themes && SZ.themes.getThemeList
            ? SZ.themes.getThemeList()
            : [{ id: 'default' }, { id: 'dark' }, { id: 'ocean' }, { id: 'sunset' }, { id: 'forest' }];

        var currentTheme = app.state.settings.theme;
        var currentIndex = themes.findIndex(function (t) { return t.id === currentTheme; });
        var nextIndex = (currentIndex + 1) % themes.length;

        setTheme(themes[nextIndex].id);
    }

    /**
     * 绑定侧边栏事件
     */
    function bindSidebarEvents() {
        // 关闭按钮
        if (app.dom.btnCloseSidebar) {
            app.dom.btnCloseSidebar.addEventListener('click', function () {
                closeSidebar();
            });
        }

        // 遮罩点击
        if (app.dom.sidebarOverlay) {
            app.dom.sidebarOverlay.addEventListener('click', function () {
                closeSidebar();
            });
        }

        // 模式列表项
        if (app.dom.modeItems) {
            app.dom.modeItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    var modeEntry = item.dataset.modeEntry;
                    handleModeEntryClick(modeEntry);
                });
            });
        }
    }

    /**
     * 绑定答题页事件
     */
    function bindQuizEvents() {
        // 上一题
        if (app.dom.btnPrevQuestion) {
            app.dom.btnPrevQuestion.addEventListener('click', function () {
                goToPrevQuestion();
            });
        }

        // 下一题
        if (app.dom.btnNextQuestion) {
            app.dom.btnNextQuestion.addEventListener('click', function () {
                if (!app.state.answerSubmitted) {
                    // 未提交答案时先提交
                    submitAnswer();
                } else {
                    goToNextQuestion();
                }
            });
        }

        // 收藏按钮
        if (app.dom.btnFavorite) {
            app.dom.btnFavorite.addEventListener('click', function () {
                toggleFavorite();
            });
        }

        // 提示按钮
        if (app.dom.btnHint) {
            app.dom.btnHint.addEventListener('click', function () {
                showHint();
            });
        }

        // 答题卡按钮
        if (app.dom.btnAnswerCard) {
            app.dom.btnAnswerCard.addEventListener('click', function () {
                if (app.state.answerCardOpen) {
                    closeAnswerCard();
                } else {
                    openAnswerCard();
                }
            });
        }

        // 笔记按钮
        if (app.dom.btnNote) {
            app.dom.btnNote.addEventListener('click', function () {
                showNoteEditor();
            });
        }
    }

    /**
     * 切换收藏
     */
    function toggleFavorite() {
        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        if (!SZ.stats) return;

        var isFav = SZ.stats.isFavorite && SZ.stats.isFavorite(question.id);

        if (isFav) {
            if (SZ.stats.removeFavorite) SZ.stats.removeFavorite(question.id);
            app.dom.btnFavorite.classList.remove('active');
            showToast('已取消收藏', 'info');
        } else {
            if (SZ.stats.addFavorite) {
                SZ.stats.addFavorite({
                    questionId: question.id,
                    timestamp: Date.now()
                });
            }
            app.dom.btnFavorite.classList.add('active');
            showToast('已收藏', 'success');
        }

        playSound('ui_select');
        updateSidebarStats();
    }

    /**
     * 显示提示
     */
    function showHint() {
        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        // 排除一个错误答案（单选/判断）
        if (question.type === QUESTION_TYPES.SINGLE || question.type === QUESTION_TYPES.JUDGE) {
            var correctAnswer = question.answer;
            var wrongOptions = [];
            var optionLabels = 'ABCDEF';

            question.options.forEach(function (opt, idx) {
                var label = optionLabels[idx];
                if (correctAnswer.indexOf(label) === -1) {
                    wrongOptions.push(label);
                }
            });

            if (wrongOptions.length > 0) {
                var randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                var wrongItem = document.querySelector('.option-item[data-option="' + randomWrong + '"]');
                if (wrongItem) {
                    wrongItem.classList.add('hint-eliminated');
                }
                showToast('已排除一个错误答案', 'info');
                playSound('ui_hint');
            }
        } else {
            showToast('多选题暂不支持提示功能', 'info');
        }
    }

    /**
     * 显示笔记编辑器
     */
    function showNoteEditor() {
        var question = app.state.currentQuestionList[app.state.currentQuestionIndex];
        if (!question) return;

        // 获取现有笔记
        var existingNote = '';
        if (SZ.stats && SZ.stats.getNote) {
            existingNote = SZ.stats.getNote(question.id) || '';
        }

        var modal = document.createElement('div');
        modal.className = 'note-modal modal-overlay';
        modal.innerHTML =
            '<div class="modal-content note-content">' +
                '<div class="note-header">' +
                    '<h3>我的笔记</h3>' +
                    '<button class="btn-icon" id="note-close">' +
                        '<svg class="icon"><use href="#icon-close"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="note-body">' +
                    '<textarea id="note-textarea" placeholder="在这里记录你的笔记...">' +
                    escapeHtml(existingNote) + '</textarea>' +
                '</div>' +
                '<div class="note-footer">' +
                    '<button class="btn btn-secondary" id="note-cancel">取消</button>' +
                    '<button class="btn btn-primary" id="note-save">保存笔记</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        var textarea = modal.querySelector('#note-textarea');
        setTimeout(function () { textarea.focus(); }, 100);

        // 保存
        modal.querySelector('#note-save').addEventListener('click', function () {
            var noteText = textarea.value.trim();
            if (SZ.stats && SZ.stats.saveNote) {
                SZ.stats.saveNote(question.id, noteText);
            }
            document.body.removeChild(modal);
            showToast('笔记已保存', 'success');
            playSound('ui_confirm');
        });

        // 取消/关闭
        function closeNote() {
            document.body.removeChild(modal);
            playSound('ui_close');
        }

        modal.querySelector('#note-close').addEventListener('click', closeNote);
        modal.querySelector('#note-cancel').addEventListener('click', closeNote);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeNote();
        });
    }

    /**
     * 绑定欢迎页事件
     */
    function bindWelcomeEvents() {
        // 继续练习按钮
        if (app.dom.btnContinuePractice) {
            app.dom.btnContinuePractice.addEventListener('click', function () {
                app.enterMode(MODE_ENTRIES.ORDER);
            });
        }

        // 快速操作按钮
        var quickBtns = document.querySelectorAll('[data-quick]');
        quickBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var quickMode = btn.dataset.quick;
                handleQuickAction(quickMode);
            });
        });

        // 查看详情
        var progressDetail = document.getElementById('progress-detail');
        if (progressDetail) {
            progressDetail.addEventListener('click', function () {
                app.switchPanel(PANELS.STATS);
            });
        }
    }

    /**
     * 处理快速操作
     */
    function handleQuickAction(action) {
        switch (action) {
            case 'random':
                showModeConfigDialog('random', function (config) {
                    app.enterMode(MODE_ENTRIES.RANDOM, config);
                });
                break;
            case 'wrong':
                app.enterMode(MODE_ENTRIES.WRONG);
                break;
            case 'exam':
                showModeConfigDialog('exam', function (config) {
                    app.enterMode(MODE_ENTRIES.EXAM, config);
                });
                break;
        }
    }

    /**
     * 绑定统计页事件
     */
    function bindStatsEvents() {
        // 周期切换
        var periodTabs = document.querySelectorAll('.period-tab');
        periodTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                periodTabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                playSound('ui_select');
                triggerEvent('stats:periodChange', { period: tab.dataset.period });
            });
        });
    }

    /**
     * 绑定答题卡事件
     */
    function bindAnswerCardEvents() {
        // 关闭按钮
        if (app.dom.btnCloseCard) {
            app.dom.btnCloseCard.addEventListener('click', function () {
                closeAnswerCard();
            });
        }

        // 提交按钮
        if (app.dom.btnSubmitExam) {
            app.dom.btnSubmitExam.addEventListener('click', function () {
                if (app.state.currentMode === MODE_ENTRIES.EXAM ||
                    app.state.currentMode === MODE_ENTRIES.CHALLENGE) {
                    showConfirmDialog({
                        title: '提交答卷',
                        message: '确定要提交答卷吗？提交后将无法修改。',
                        confirmText: '确认提交',
                        onConfirm: function () {
                            closeAnswerCard();
                            submitExam();
                        }
                    });
                } else {
                    closeAnswerCard();
                }
            });
        }
    }

    // ============================================================
    //  公共 API 方法
    // ============================================================

    /**
     * 获取当前状态
     */
    app.getState = function () {
        return {
            currentPanel: app.state.currentPanel,
            currentMode: app.state.currentMode,
            currentQuestionIndex: app.state.currentQuestionIndex,
            questionCount: app.state.currentQuestionList.length,
            combo: app.state.combo,
            settings: Object.assign({}, app.state.settings)
        };
    };

    /**
     * 获取设置
     */
    app.getSettings = function () {
        return Object.assign({}, app.state.settings);
    };

    /**
     * 更新设置
     */
    app.updateSettings = function (key, value) {
        app.state.settings[key] = value;
        saveSettings();
        triggerEvent('settings:change', { key: key, value: value });
    };

    /**
     * 获取当前题目
     */
    app.getCurrentQuestion = function () {
        return app.state.currentQuestionList[app.state.currentQuestionIndex] || null;
    };

    /**
     * 获取题目列表
     */
    app.getQuestionList = function () {
        return app.state.currentQuestionList.slice();
    };

    /**
     * 获取全部题库
     */
    app.getAllQuestions = function () {
        return app.state.questions.slice();
    };

    /**
     * 获取题库元数据
     */
    app.getQuestionMeta = function () {
        return Object.assign({}, app.state.questionMeta);
    };

    /**
     * 刷新数据
     */
    app.refresh = function () {
        updateSidebarStats();
        if (app.state.currentPanel === PANELS.WELCOME) {
            renderWelcome();
        } else if (app.state.currentPanel === PANELS.STATS) {
            renderStats();
        }
    };

    /**
     * 显示消息提示
     */
    app.showToast = function (message, type, duration) {
        showToast(message, type, duration);
    };

    /**
     * 显示确认对话框
     */
    app.showConfirm = function (options) {
        showConfirmDialog(options);
    };

    /**
     * 播放音效
     */
    app.playSound = function (soundName, options) {
        playSound(soundName, options);
    };

    /**
     * 触发粒子特效
     */
    app.triggerParticle = function (effectName, data) {
        if (SZ.particles && SZ.particles.trigger) {
            SZ.particles.trigger(effectName, data);
        }
    };

    // ============================================================
    //  数据备份与恢复（自动保存）
    // ============================================================

    /**
     * 自动保存答题进度
     */
    function autoSaveProgress() {
        // 每30秒自动保存一次答题记录
        setInterval(function () {
            if (app.state.currentPanel === PANELS.QUIZ &&
                Object.keys(app.state.answerRecords).length > 0) {
                // 保存当前会话进度
                setStorage(STORAGE_KEYS.ANSWER_RECORDS, {
                    mode: app.state.currentMode,
                    questionList: app.state.currentQuestionList.map(function (q) { return q.id; }),
                    currentIndex: app.state.currentQuestionIndex,
                    records: app.state.answerRecords,
                    timestamp: Date.now()
                });
            }
        }, 30000);
    }

    /**
     * 恢复答题进度
     */
    function restoreProgress() {
        var saved = getStorage(STORAGE_KEYS.ANSWER_RECORDS, null);
        if (!saved) return false;

        // 检查是否在有效期内（24小时）
        if (Date.now() - saved.timestamp > 24 * 60 * 60 * 1000) {
            setStorage(STORAGE_KEYS.ANSWER_RECORDS, null);
            return false;
        }

        return saved;
    }

    /**
     * 显示继续答题提示
     */
    function checkResumeProgress() {
        var saved = restoreProgress();
        if (!saved) return;

        // 只有在非考试模式下才提示恢复
        if (saved.mode === MODE_ENTRIES.EXAM || saved.mode === MODE_ENTRIES.CHALLENGE) {
            return;
        }

        setTimeout(function () {
            showConfirmDialog({
                title: '继续上次练习',
                message: '检测到您有未完成的练习，是否继续？',
                confirmText: '继续练习',
                cancelText: '重新开始',
                onConfirm: function () {
                    resumeSavedProgress(saved);
                },
                onCancel: function () {
                    setStorage(STORAGE_KEYS.ANSWER_RECORDS, null);
                }
            });
        }, 1000);
    }

    /**
     * 恢复保存的答题进度
     */
    function resumeSavedProgress(saved) {
        // 根据保存的题目ID列表重建题目列表
        var questionMap = {};
        app.state.questions.forEach(function (q) {
            questionMap[q.id] = q;
        });

        app.state.currentQuestionList = saved.questionList
            .map(function (id) { return questionMap[id]; })
            .filter(function (q) { return q; });

        app.state.currentQuestionIndex = Math.min(saved.currentIndex, app.state.currentQuestionList.length - 1);
        app.state.answerRecords = saved.records || {};
        app.state.currentMode = saved.mode;

        // 切换到答题面板
        app.switchPanel(PANELS.QUIZ, { force: true });
        updateModeBadge(saved.mode);
        renderCurrentQuestion();
        renderAnswerCard();
    }

    // ============================================================
    //  错误处理与降级
    // ============================================================

    /**
     * 全局错误处理
     */
    function initErrorHandling() {
        window.addEventListener('error', function (e) {
            console.error('[SZ.app] 全局错误:', e.error || e.message);
            // 静默处理，不影响用户使用
        });

        window.addEventListener('unhandledrejection', function (e) {
            console.warn('[SZ.app] 未处理的Promise rejection:', e.reason);
        });
    }

    // ============================================================
    //  页面可见性变化处理
    // ============================================================

    function initVisibilityChange() {
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // 页面隐藏：暂停计时器（考试模式除外）
                if (app.state.currentPanel === PANELS.QUIZ &&
                    app.state.currentMode !== MODE_ENTRIES.EXAM &&
                    app.state.timer.enabled) {
                    // 可以选择暂停
                }

                // 保存进度
                if (app.state.currentPanel === PANELS.QUIZ) {
                    setStorage(STORAGE_KEYS.ANSWER_RECORDS, {
                        mode: app.state.currentMode,
                        questionList: app.state.currentQuestionList.map(function (q) { return q.id; }),
                        currentIndex: app.state.currentQuestionIndex,
                        records: app.state.answerRecords,
                        timestamp: Date.now()
                    });
                }

                triggerEvent('app:pause');
            } else {
                // 页面重新可见
                triggerEvent('app:resume');
            }
        });
    }

    // ============================================================
    //  性能监控
    // ============================================================

    var perfStats = {
        initTime: 0,
        frameDrops: 0,
        lastFrameTime: 0
    };

    /**
     * 初始化性能监控
     */
    function initPerformanceMonitor() {
        if (app.state.settings.dataSaver) return;

        // 监控首屏时间
        if (performance && performance.timing) {
            perfStats.initTime = performance.now();
        }

        // FPS 监控（开发环境）
        var lastTime = performance.now();
        var frames = 0;

        function countFrames() {
            frames++;
            var now = performance.now();
            if (now - lastTime >= 1000) {
                var fps = frames;
                if (fps < 30) {
                    console.warn('[SZ.app] FPS较低: ' + fps + 'fps');
                }
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(countFrames);
        }

        // 仅在开发环境启用
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            requestAnimationFrame(countFrames);
        }
    }

    // ============================================================
    //  渲染增强功能
    // ============================================================

    /**
     * 渲染题目标签
     */
    function renderQuestionTags(question) {
        var tags = [];
        if (question.department) tags.push(question.department);
        if (question.type) tags.push(question.type);
        if (question.tags && question.tags.length) {
            tags = tags.concat(question.tags);
        }
        return tags;
    }

    /**
     * 渲染题目难度指示
     */
    function renderDifficultyIndicator(difficulty) {
        var levels = ['简单', '较易', '中等', '较难', '困难'];
        var level = difficulty || 2;
        var dots = '';
        for (var i = 0; i < 5; i++) {
            dots += '<span class="diff-dot ' + (i < level ? 'active' : '') + '"></span>';
        }
        return '<div class="difficulty">' + dots + '<span class="diff-label">' + levels[level - 1] + '</span></div>';
    }

    /**
     * 渲染掌握度指示
     */
    function renderMasteryIndicator(mastery) {
        var levels = ['未学习', '初识', '熟悉', '掌握', '精通', '完美'];
        var level = mastery || 0;
        var percent = (level / 5) * 100;
        return (
            '<div class="mastery-bar">' +
                '<div class="mastery-fill" style="width: ' + percent + '%"></div>' +
                '<span class="mastery-label">' + levels[level] + '</span>' +
            '</div>'
        );
    }

    // ============================================================
    //  动画工具
    // ============================================================

    /**
     * 元素淡入
     */
    function fadeIn(element, duration, callback) {
        duration = duration || 300;
        element.style.opacity = '0';
        element.style.display = '';
        element.offsetHeight; // 触发重绘
        element.style.transition = 'opacity ' + duration + 'ms ease';
        element.style.opacity = '1';

        setTimeout(function () {
            element.style.transition = '';
            if (callback) callback();
        }, duration);
    }

    /**
     * 元素淡出
     */
    function fadeOut(element, duration, callback) {
        duration = duration || 300;
        element.style.transition = 'opacity ' + duration + 'ms ease';
        element.style.opacity = '0';

        setTimeout(function () {
            element.style.display = 'none';
            element.style.transition = '';
            element.style.opacity = '';
            if (callback) callback();
        }, duration);
    }

    /**
     * 滑入动画
     */
    function slideIn(element, direction, duration, callback) {
        duration = duration || 300;
        direction = direction || 'up';

        var startTransform = '';
        switch (direction) {
            case 'up': startTransform = 'translateY(20px)'; break;
            case 'down': startTransform = 'translateY(-20px)'; break;
            case 'left': startTransform = 'translateX(20px)'; break;
            case 'right': startTransform = 'translateX(-20px)'; break;
        }

        element.style.opacity = '0';
        element.style.transform = startTransform;
        element.style.transition = 'all ' + duration + 'ms ease';
        element.offsetHeight;
        element.style.opacity = '1';
        element.style.transform = '';

        setTimeout(function () {
            element.style.transition = '';
            element.style.opacity = '';
            element.style.transform = '';
            if (callback) callback();
        }, duration);
    }

    /**
     * 抖动物体（错误提示效果）
     */
    function shakeElement(element, duration) {
        duration = duration || 400;
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'shake ' + duration + 'ms ease';

        setTimeout(function () {
            element.style.animation = '';
        }, duration);
    }

    // ============================================================
    //  数据格式转换工具
    // ============================================================

    /**
     * 将字母答案转换为数组
     */
    function answerToArray(answer) {
        if (!answer) return [];
        return answer.split('');
    }

    /**
     * 将数组转换为字母答案
     */
    function arrayToAnswer(arr) {
        if (!arr || !arr.length) return '';
        return arr.slice().sort().join('');
    }

    /**
     * 比较两个答案是否相同
     */
    function compareAnswers(a, b) {
        var arrA = answerToArray(a).sort().join('');
        var arrB = answerToArray(b).sort().join('');
        return arrA === arrB;
    }

    /**
     * 获取选项对应的文本
     */
    function getOptionText(question, optionLabel) {
        var labels = 'ABCDEF';
        var index = labels.indexOf(optionLabel);
        if (index >= 0 && index < question.options.length) {
            return question.options[index];
        }
        return '';
    }

    // ============================================================
    //  统计图表辅助
    // ============================================================

    /**
     * 获取最近N天的日期数组
     */
    function getRecentDays(days) {
        days = days || 7;
        var result = [];
        var today = new Date();
        for (var i = days - 1; i >= 0; i--) {
            var d = new Date(today);
            d.setDate(d.getDate() - i);
            result.push({
                date: d.getFullYear() + '-' +
                       ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1) + '-' +
                       (d.getDate() < 10 ? '0' : '') + d.getDate(),
                label: (d.getMonth() + 1) + '/' + d.getDate(),
                dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
            });
        }
        return result;
    }

    /**
     * 计算学习等级
     */
    function calculateLevel(exp) {
        var baseExp = 100;
        var level = 1;
        var required = baseExp;

        while (exp >= required && level < 100) {
            exp -= required;
            level++;
            required = Math.floor(baseExp * Math.pow(1.2, level - 1));
        }

        var nextLevelExp = Math.floor(baseExp * Math.pow(1.2, level - 1));

        return {
            level: level,
            currentExp: exp,
            nextLevelExp: nextLevelExp,
            progress: (exp / nextLevelExp) * 100
        };
    }

    // ============================================================
    //  每日学习提醒系统
    // ============================================================

    /**
     * 设置每日提醒
     */
    function setDailyReminder(enabled, time) {
        app.state.settings.dailyReminder = enabled;
        app.state.settings.reminderTime = time || '20:00';
        saveSettings();

        if (enabled && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission(function (permission) {
                    if (permission === 'granted') {
                        showToast('每日提醒已开启', 'success');
                    }
                });
            } else if (Notification.permission === 'granted') {
                showToast('每日提醒已开启', 'success');
            } else {
                showToast('通知权限被拒绝，请在浏览器设置中开启', 'warning');
            }
        }
    }

    /**
     * 显示学习提醒
     */
    function showStudyReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('书桌 - 每日提醒', {
                body: '今天的学习任务还没完成哦，快来刷题吧！',
                icon: '',
                tag: 'daily-reminder'
            });
        }
    }

    // ============================================================
    //  快捷键帮助
    // ============================================================

    /**
     * 显示快捷键帮助
     */
    function showShortcutHelp() {
        var shortcuts = [
            { keys: ['1', '2', '3', '4', '5', '6'], desc: '选择选项 A-F' },
            { keys: ['A', 'B', 'C', 'D', 'E', 'F'], desc: '选择选项 A-F' },
            { keys: ['↑', '←'], desc: '上一题' },
            { keys: ['↓', '→'], desc: '下一题' },
            { keys: ['Enter'], desc: '提交答案 / 下一题' },
            { keys: ['Space'], desc: '打开/关闭答题卡' },
            { keys: ['Esc'], desc: '关闭面板/弹窗' },
            { keys: ['F'], desc: '收藏/取消收藏' },
            { keys: ['H'], desc: '显示提示' },
            { keys: ['N'], desc: '添加笔记' }
        ];

        var modal = document.createElement('div');
        modal.className = 'shortcut-modal modal-overlay';

        var shortcutsHtml = '';
        shortcuts.forEach(function (item) {
            var keysHtml = item.keys.map(function (k) {
                return '<kbd>' + k + '</kbd>';
            }).join('');

            shortcutsHtml +=
                '<div class="shortcut-item">' +
                    '<div class="shortcut-keys">' + keysHtml + '</div>' +
                    '<span class="shortcut-desc">' + item.desc + '</span>' +
                '</div>';
        });

        modal.innerHTML =
            '<div class="modal-content shortcut-content">' +
                '<div class="shortcut-header">' +
                    '<h3>键盘快捷键</h3>' +
                    '<button class="btn-icon" id="shortcut-close">' +
                        '<svg class="icon"><use href="#icon-close"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="shortcut-body">' + shortcutsHtml + '</div>' +
                '<div class="shortcut-footer">' +
                    '<p class="shortcut-tip">提示：可在设置中关闭键盘快捷键</p>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        function closeShortcut() {
            document.body.removeChild(modal);
        }

        modal.querySelector('#shortcut-close').addEventListener('click', closeShortcut);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeShortcut();
        });
    }

    // ============================================================
    //  分享功能
    // ============================================================

    /**
     * 分享学习成绩
     */
    function shareResult(result) {
        var shareText = '我在书桌刷题应用中获得了 ' + result.score + ' 分！快来一起学习吧～';

        if (navigator.share) {
            navigator.share({
                title: '书桌 - 刷题成绩',
                text: shareText,
                url: window.location.href
            }).catch(function () {
                // 用户取消分享
            });
        } else {
            // 复制到剪贴板
            copyToClipboard(shareText);
            showToast('成绩已复制到剪贴板', 'success');
        }
    }

    /**
     * 复制文本到剪贴板
     */
    function copyToClipboard(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
        } catch (e) {
            console.warn('[SZ.app] 复制失败:', e);
        }

        document.body.removeChild(textarea);
    }

    // ============================================================
    //  打印功能（错题导出）
    // ============================================================

    /**
     * 打印错题集
     */
    function printWrongBook() {
        if (!SZ.stats || !SZ.stats.getWrongBook) return;

        var wrongBook = SZ.stats.getWrongBook();
        if (wrongBook.length === 0) {
            showToast('暂无错题', 'info');
            return;
        }

        var questionMap = {};
        app.state.questions.forEach(function (q) {
            questionMap[q.id] = q;
        });

        var printContent = '<html><head><title>错题集 - 书桌</title>';
        printContent += '<style>body{font-family:sans-serif;padding:20px;}.question{margin-bottom:20px;padding:15px;border:1px solid #ddd;}.q-title{font-weight:bold;margin-bottom:10px;}.options{margin-left:20px;}.option{margin:5px 0;}.answer{color:green;margin-top:10px;}.wrong-answer{color:red;}</style>';
        printContent += '</head><body>';
        printContent += '<h1>错题集（共 ' + wrongBook.length + ' 题）</h1>';

        wrongBook.forEach(function (item, idx) {
            var q = questionMap[item.questionId];
            if (!q) return;

            printContent += '<div class="question">';
            printContent += '<div class="q-title">' + (idx + 1) + '. [' + q.type + '] ' + q.question + '</div>';
            printContent += '<div class="options">';
            var labels = 'ABCDEF';
            q.options.forEach(function (opt, i) {
                printContent += '<div class="option">' + labels[i] + '. ' + opt + '</div>';
            });
            printContent += '</div>';
            printContent += '<div class="answer">正确答案：' + q.answer + '</div>';
            if (item.wrongAnswer) {
                printContent += '<div class="wrong-answer">你的答案：' + item.wrongAnswer + '</div>';
            }
            printContent += '</div>';
        });

        printContent += '</body></html>';

        var printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        } else {
            showToast('请允许弹出窗口以使用打印功能', 'warning');
        }
    }

    // ============================================================
    //  题目导出功能
    // ============================================================

    /**
     * 导出错题为Word格式（HTML）
     */
    function exportWrongBook() {
        if (!SZ.stats || !SZ.stats.getWrongBook) return;

        var wrongBook = SZ.stats.getWrongBook();
        if (wrongBook.length === 0) {
            showToast('暂无错题', 'info');
            return;
        }

        var questionMap = {};
        app.state.questions.forEach(function (q) {
            questionMap[q.id] = q;
        });

        var html = '<html><head><meta charset="utf-8"><title>错题集</title>';
        html += '<style>body{font-family:"Microsoft YaHei",sans-serif;line-height:1.8;}h1{color:#333;}.question{margin:15px 0;padding:10px;border-bottom:1px solid #eee;}.q-stem{font-weight:bold;}.options{margin:10px 0;}.option{margin:5px 0;}.answer{color:#2ecc71;}.explanation{color:#666;background:#f9f9f9;padding:10px;margin-top:10px;}</style>';
        html += '</head><body>';
        html += '<h1>书桌 - 错题集导出</h1>';
        html += '<p>导出时间：' + new Date().toLocaleString() + '</p>';
        html += '<p>总题数：' + wrongBook.length + ' 题</p>';
        html += '<hr>';

        wrongBook.forEach(function (item, idx) {
            var q = questionMap[item.questionId];
            if (!q) return;

            html += '<div class="question">';
            html += '<div class="q-stem">' + (idx + 1) + '. 【' + q.type + '】' + q.question + '</div>';
            html += '<div class="options">';
            var labels = 'ABCDEF';
            q.options.forEach(function (opt, i) {
                html += '<div class="option">' + labels[i] + '. ' + opt + '</div>';
            });
            html += '</div>';
            html += '<div class="answer">答案：' + q.answer + '</div>';
            if (q.explanation) {
                html += '<div class="explanation">解析：' + q.explanation + '</div>';
            }
            html += '</div>';
        });

        html += '</body></html>';

        var blob = new Blob([html], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '错题集_' + getTodayString() + '.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('错题集已导出', 'success');
    }

    // ============================================================
    //  屏幕截图分享（Canvas合成）
    // ============================================================

    /**
     * 生成学习报告图片
     */
    function generateReportImage(callback) {
        if (!SZ.stats) return;

        var overall = SZ.stats.getOverallStats ? SZ.stats.getOverallStats() : {};
        var streak = overall.streak || 0;
        var totalAnswered = overall.totalAnswered || 0;
        var accuracy = overall.totalAnswered > 0
            ? Math.round(overall.correctCount / overall.totalAnswered * 100)
            : 0;

        var canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        var ctx = canvas.getContext('2d');

        // 背景渐变
        var gradient = ctx.createLinearGradient(0, 0, 600, 800);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('书桌学习报告', 300, 80);

        ctx.font = '20px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(getTodayString(), 300, 120);

        // 统计卡片
        var cardY = 180;
        var cardHeight = 100;
        var cardWidth = 250;

        // 累计刷题
        drawStatCard(ctx, 50, cardY, cardWidth, cardHeight, '累计刷题', formatNumber(totalAnswered) + ' 题');
        drawStatCard(ctx, 300, cardY, cardWidth, cardHeight, '正确率', accuracy + '%');
        drawStatCard(ctx, 50, cardY + 130, cardWidth, cardHeight, '连续学习', streak + ' 天');
        drawStatCard(ctx, 300, cardY + 130, cardWidth, cardHeight, '掌握题目', formatNumber(Math.floor(totalAnswered * accuracy / 100)) + ' 题');

        // 底部标语
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.fillText('高效备考，轻松通关', 300, 720);
        ctx.fillText('书桌 ShuZhuo', 300, 750);

        if (callback) {
            callback(canvas.toDataURL('image/png'));
        }
    }

    /**
     * 绘制统计卡片
     */
    function drawStatCard(ctx, x, y, w, h, label, value) {
        // 卡片背景
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();

        // 数值
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + w / 2, y + 45);

        // 标签
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '14px "Microsoft YaHei", sans-serif';
        ctx.fillText(label, x + w / 2, y + 75);
    }

    // ============================================================
    //  离线状态检测
    // ============================================================

    function initOfflineDetection() {
        function updateOnlineStatus() {
            if (navigator.onLine) {
                document.body.classList.remove('offline');
                triggerEvent('app:online');
            } else {
                document.body.classList.add('offline');
                showToast('网络已断开，进入离线模式', 'info');
                triggerEvent('app:offline');
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // 初始状态
        updateOnlineStatus();
    }

    // ============================================================
    //  页面卸载前保存
    // ============================================================

    function initBeforeUnload() {
        window.addEventListener('beforeunload', function (e) {
            // 保存当前答题进度
            if (app.state.currentPanel === PANELS.QUIZ &&
                Object.keys(app.state.answerRecords).length > 0) {
                setStorage(STORAGE_KEYS.ANSWER_RECORDS, {
                    mode: app.state.currentMode,
                    questionList: app.state.currentQuestionList.map(function (q) { return q.id; }),
                    currentIndex: app.state.currentQuestionIndex,
                    records: app.state.answerRecords,
                    timestamp: Date.now()
                });

                // 考试模式提示确认离开
                if (app.state.currentMode === MODE_ENTRIES.EXAM && app.state.examState.started) {
                    e.preventDefault();
                    e.returnValue = '考试尚未结束，确定离开吗？';
                    return e.returnValue;
                }
            }

            // 保存设置
            saveSettings();
        });
    }

    // ============================================================
    //  应用启动器
    // ============================================================

    /**
     * 启动应用
     */
    function bootstrap() {
        // 错误处理
        initErrorHandling();

        // 离线检测
        initOfflineDetection();

        // 页面可见性
        initVisibilityChange();

        // 页面卸载保存
        initBeforeUnload();

        // 自动保存
        autoSaveProgress();

        // 性能监控
        initPerformanceMonitor();

        // 初始化应用
        app.init();

        // 检查是否恢复进度（延迟到首屏渲染后）
        setTimeout(function () {
            checkResumeProgress();
        }, 2000);
    }

    // ============================================================
    //  DOM Ready 启动
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // ============================================================
    //  模块导出
    // ============================================================

    // 将内部函数暴露给 app 命名空间（供扩展和调试）
    // ============================================================
    //  考试回顾模式
    // ============================================================

    /**
     * 考试回顾模式 - 考完后逐题查看解析
     */
    var examReviewMode = {
        enabled: false,
        examResult: null,
        filter: 'all' // all/wrong/correct/unanswered
    };

    /**
     * 进入考试回顾模式
     */
    function enterExamReview(result) {
        examReviewMode.enabled = true;
        examReviewMode.examResult = result;
        examReviewMode.filter = 'all';

        // 重新渲染所有题目，始终显示答案
        app.state.currentQuestionIndex = 0;
        app.state.answerSubmitted = true;

        // 标记所有题目为已查看
        app.state.currentQuestionList.forEach(function (q) {
            if (!app.state.answerRecords[q.id]) {
                app.state.answerRecords[q.id] = {
                    questionId: q.id,
                    userAnswer: '',
                    correctAnswer: q.answer,
                    status: ANSWER_STATUS.UNANSWERED,
                    timeSpent: 0,
                    timestamp: Date.now()
                };
            }
        });

        renderCurrentQuestion();
        renderAnswerCard();

        showToast('进入考试回顾模式', 'info');
    }

    /**
     * 退出考试回顾模式
     */
    function exitExamReview() {
        examReviewMode.enabled = false;
        examReviewMode.examResult = null;
    }

    /**
     * 按条件筛选回顾题目
     */
    function filterReviewQuestions(filter) {
        examReviewMode.filter = filter;

        var filtered = [];
        app.state.currentQuestionList.forEach(function (q) {
            var record = app.state.answerRecords[q.id];
            if (!record) return;

            switch (filter) {
                case 'wrong':
                    if (record.status === ANSWER_STATUS.WRONG) filtered.push(q);
                    break;
                case 'correct':
                    if (record.status === ANSWER_STATUS.CORRECT) filtered.push(q);
                    break;
                case 'unanswered':
                    if (record.status === ANSWER_STATUS.UNANSWERED) filtered.push(q);
                    break;
                default:
                    filtered.push(q);
            }
        });

        // 保存原列表
        if (!examReviewMode.originalList) {
            examReviewMode.originalList = app.state.currentQuestionList;
        }

        app.state.currentQuestionList = filtered;
        app.state.currentQuestionIndex = 0;

        if (filtered.length > 0) {
            renderCurrentQuestion();
            renderAnswerCard();
        } else {
            showToast('该分类下暂无题目', 'info');
        }
    }

    // ============================================================
    //  学习日历系统
    // ============================================================

    /**
     * 学习日历数据
     */
    var studyCalendar = {
        /**
         * 获取指定月份的学习数据
         */
        getMonthData: function (year, month) {
            if (!SZ.stats || !SZ.stats.getDailyStats) return [];

            var daysInMonth = new Date(year, month, 0).getDate();
            var result = [];

            for (var day = 1; day <= daysInMonth; day++) {
                var dateStr = year + '-' +
                    (month < 10 ? '0' + month : month) + '-' +
                    (day < 10 ? '0' + day : day);
                var daily = SZ.stats.getDailyStats(dateStr);
                result.push({
                    date: dateStr,
                    day: day,
                    weekday: new Date(year, month - 1, day).getDay(),
                    totalQuestions: daily.totalQuestions || 0,
                    correctCount: daily.correctCount || 0,
                    studyTime: daily.studyTime || 0,
                    isToday: dateStr === getTodayString(),
                    hasStudy: (daily.totalQuestions || 0) > 0,
                    level: this.getActivityLevel(daily.totalQuestions || 0)
                });
            }

            return result;
        },

        /**
         * 根据做题数量计算活跃等级（0-4）
         */
        getActivityLevel: function (count) {
            if (count === 0) return 0;
            if (count < 10) return 1;
            if (count < 30) return 2;
            if (count < 50) return 3;
            return 4;
        },

        /**
         * 获取学习热力图数据（最近N天）
         */
        getHeatmapData: function (days) {
            days = days || 365;
            var result = [];
            var today = new Date();

            for (var i = days - 1; i >= 0; i--) {
                var d = new Date(today);
                d.setDate(d.getDate() - i);
                var dateStr = d.getFullYear() + '-' +
                    ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1) + '-' +
                    (d.getDate() < 10 ? '0' : '') + d.getDate();

                var daily = SZ.stats && SZ.stats.getDailyStats
                    ? SZ.stats.getDailyStats(dateStr)
                    : {};

                result.push({
                    date: dateStr,
                    count: daily.totalQuestions || 0,
                    level: this.getActivityLevel(daily.totalQuestions || 0),
                    weekday: d.getDay(),
                    week: Math.ceil((i + 1) / 7)
                });
            }

            return result;
        },

        /**
         * 计算月度学习统计
         */
        getMonthSummary: function (year, month) {
            var monthData = this.getMonthData(year, month);
            var totalDays = 0;
            var totalQuestions = 0;
            var totalCorrect = 0;
            var totalTime = 0;
            var currentStreak = 0;
            var maxStreak = 0;

            for (var i = monthData.length - 1; i >= 0; i--) {
                var day = monthData[i];
                if (day.totalQuestions > 0) {
                    totalDays++;
                    totalQuestions += day.totalQuestions;
                    totalCorrect += day.correctCount;
                    totalTime += day.studyTime;
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }

            return {
                year: year,
                month: month,
                studyDays: totalDays,
                totalQuestions: totalQuestions,
                totalCorrect: totalCorrect,
                accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : 0,
                totalTime: totalTime,
                avgPerDay: totalDays > 0 ? Math.round(totalQuestions / totalDays) : 0,
                maxStreak: maxStreak
            };
        }
    };

    // ============================================================
    //  艾宾浩斯复习系统
    // ============================================================

    /**
     * 艾宾浩斯遗忘曲线复习间隔（天数）
     */
    var EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30, 60, 90, 180];

    /**
     * 复习系统
     */
    var reviewSystem = {
        /**
         * 获取今日需要复习的题目
         */
        getTodayReviewQuestions: function () {
            if (!SZ.stats || !SZ.stats.getWrongBook) return [];

            var wrongBook = SZ.stats.getWrongBook();
            var today = new Date();
            today.setHours(0, 0, 0, 0);

            var reviewList = [];

            wrongBook.forEach(function (item) {
                var nextReviewDate = this.calculateNextReview(item);
                if (nextReviewDate && nextReviewDate <= today) {
                    reviewList.push({
                        questionId: item.questionId,
                        priority: this.getReviewPriority(item),
                        nextReview: nextReviewDate,
                        reviewCount: item.reviewCount || 0
                    });
                }
            }, this);

            // 按优先级排序（高优先级在前）
            reviewList.sort(function (a, b) {
                return b.priority - a.priority;
            });

            return reviewList;
        },

        /**
         * 计算下次复习时间
         */
        calculateNextReview: function (item) {
            var wrongDate = new Date(item.timestamp || item.wrongTime || Date.now());
            var reviewCount = item.reviewCount || 0;
            var masteryLevel = item.masteryLevel || 0;

            // 基础间隔
            var intervalIndex = Math.min(reviewCount + masteryLevel, EBBINGHAUS_INTERVALS.length - 1);
            var interval = EBBINGHAUS_INTERVALS[intervalIndex];

            var nextDate = new Date(wrongDate);
            nextDate.setDate(nextDate.getDate() + interval);
            nextDate.setHours(0, 0, 0, 0);

            return nextDate;
        },

        /**
         * 获取复习优先级
         */
        getReviewPriority: function (item) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var nextReview = this.calculateNextReview(item);
            var daysOverdue = Math.floor((today - nextReview) / (1000 * 60 * 60 * 24));

            // 逾期越久优先级越高
            return Math.max(0, daysOverdue) + (item.importance || 0) * 10;
        },

        /**
         * 记录复习结果
         */
        recordReviewResult: function (questionId, isCorrect) {
            if (!SZ.stats || !SZ.stats.updateWrongBook) return;

            var wrongBook = SZ.stats.getWrongBook();
            var item = wrongBook.find(function (w) { return w.questionId === questionId; });

            if (item) {
                item.reviewCount = (item.reviewCount || 0) + 1;
                item.lastReviewTime = Date.now();

                if (isCorrect) {
                    item.masteryLevel = Math.min((item.masteryLevel || 0) + 1, 5);
                    // 如果掌握度达到最高且答对多次，可以移出错题本
                    if (item.masteryLevel >= 5 && item.reviewCount >= 5) {
                        if (SZ.stats.removeFromWrongBook) {
                            SZ.stats.removeFromWrongBook(questionId);
                        }
                    }
                } else {
                    item.masteryLevel = Math.max((item.masteryLevel || 0) - 1, 0);
                    item.wrongCount = (item.wrongCount || 1) + 1;
                }

                SZ.stats.updateWrongBook(wrongBook);
            }
        }
    };

    // ============================================================
    //  学习目标系统
    // ============================================================

    var goalSystem = {
        /**
         * 获取今日目标完成情况
         */
        getDailyGoalProgress: function () {
            var settings = app.state.settings;
            var goalQuestions = settings.dailyGoal || 30;
            var goalTime = settings.dailyTimeGoal || 1800;

            var todayStats = getTodayStats();

            return {
                questionsGoal: goalQuestions,
                questionsDone: todayStats.doneCount,
                questionsPercent: Math.min(100, Math.round(todayStats.doneCount / goalQuestions * 100)),
                timeGoal: goalTime,
                timeDone: todayStats.studyTime,
                timePercent: Math.min(100, Math.round(todayStats.studyTime / goalTime * 100)),
                accuracyGoal: settings.dailyAccuracyGoal || 70,
                accuracy: todayStats.accuracy,
                completed: todayStats.doneCount >= goalQuestions
            };
        },

        /**
         * 检查目标是否完成
         */
        checkDailyGoalComplete: function () {
            var progress = this.getDailyGoalProgress();
            if (progress.completed) {
                var today = getTodayString();
                var key = 'sz_goal_complete_' + today;
                var alreadyNotified = getStorage(key, false);

                if (!alreadyNotified) {
                    setStorage(key, true);
                    showToast('恭喜！今日学习目标已达成！', 'success');
                    playSound('achievement_unlock');

                    if (SZ.particles && SZ.particles.trigger) {
                        SZ.particles.trigger('goal_complete');
                    }

                    // 添加额外经验
                    if (SZ.stats && SZ.stats.addExp) {
                        SZ.stats.addExp(50);
                    }
                }
            }
        },

        /**
         * 设置每日目标
         */
        setDailyGoal: function (questionCount) {
            app.state.settings.dailyGoal = questionCount;
            saveSettings();
            renderWelcome();
        }
    };

    // ============================================================
    //  题目收藏夹管理
    // ============================================================

    /**
     * 收藏夹功能
     */
    var favoriteManager = {
        /**
         * 获取收藏列表
         */
        getList: function () {
            if (SZ.stats && SZ.stats.getFavorites) {
                return SZ.stats.getFavorites();
            }
            return [];
        },

        /**
         * 添加收藏
         */
        add: function (questionId, tags) {
            if (SZ.stats && SZ.stats.addFavorite) {
                SZ.stats.addFavorite({
                    questionId: questionId,
                    tags: tags || [],
                    timestamp: Date.now()
                });
                updateSidebarStats();
                return true;
            }
            return false;
        },

        /**
         * 移除收藏
         */
        remove: function (questionId) {
            if (SZ.stats && SZ.stats.removeFavorite) {
                SZ.stats.removeFavorite(questionId);
                updateSidebarStats();
                return true;
            }
            return false;
        },

        /**
         * 是否收藏
         */
        has: function (questionId) {
            if (SZ.stats && SZ.stats.isFavorite) {
                return SZ.stats.isFavorite(questionId);
            }
            return false;
        },

        /**
         * 按标签筛选
         */
        filterByTag: function (tag) {
            var list = this.getList();
            if (!tag) return list;
            return list.filter(function (item) {
                return item.tags && item.tags.indexOf(tag) > -1;
            });
        },

        /**
         * 获取所有标签
         */
        getAllTags: function () {
            var list = this.getList();
            var tags = {};
            list.forEach(function (item) {
                if (item.tags) {
                    item.tags.forEach(function (tag) {
                        tags[tag] = (tags[tag] || 0) + 1;
                    });
                }
            });
            return Object.keys(tags).map(function (tag) {
                return { name: tag, count: tags[tag] };
            });
        },

        /**
         * 批量导出错题
         */
        exportFavorites: function (format) {
            var list = this.getList();
            if (list.length === 0) {
                showToast('收藏夹为空', 'info');
                return;
            }

            var questionMap = {};
            app.state.questions.forEach(function (q) {
                questionMap[q.id] = q;
            });

            var favoriteQuestions = list
                .map(function (item) { return questionMap[item.questionId]; })
                .filter(function (q) { return q; });

            if (format === 'json') {
                var data = JSON.stringify(favoriteQuestions, null, 2);
                downloadFile(data, '收藏题目_' + getTodayString() + '.json', 'application/json');
            } else {
                // 默认导出为文本
                var text = '';
                favoriteQuestions.forEach(function (q, idx) {
                    text += (idx + 1) + '. [' + q.type + '] ' + q.question + '\n';
                    var labels = 'ABCDEF';
                    q.options.forEach(function (opt, i) {
                        text += '   ' + labels[i] + '. ' + opt + '\n';
                    });
                    text += '   答案：' + q.answer + '\n\n';
                });
                downloadFile(text, '收藏题目_' + getTodayString() + '.txt', 'text/plain');
            }

            showToast('收藏夹已导出', 'success');
        }
    };

    /**
     * 下载文件工具函数
     */
    function downloadFile(content, filename, mimeType) {
        var blob = new Blob([content], { type: mimeType || 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ============================================================
    //  题目搜索高级功能
    // ============================================================

    /**
     * 高级搜索功能
     */
    var advancedSearch = {
        /**
         * 多条件搜索
         */
        search: function (criteria) {
            var results = app.state.questions.slice();

            // 关键词搜索
            if (criteria.keyword) {
                var keyword = criteria.keyword.toLowerCase();
                results = results.filter(function (q) {
                    // 题干
                    if (q.question && q.question.toLowerCase().indexOf(keyword) > -1) return true;
                    // 选项
                    if (q.options) {
                        for (var i = 0; i < q.options.length; i++) {
                            if (q.options[i].toLowerCase().indexOf(keyword) > -1) return true;
                        }
                    }
                    return false;
                });
            }

            // 题型筛选
            if (criteria.types && criteria.types.length > 0) {
                results = results.filter(function (q) {
                    return criteria.types.indexOf(q.type) > -1;
                });
            }

            // 部门筛选
            if (criteria.departments && criteria.departments.length > 0) {
                results = results.filter(function (q) {
                    return criteria.departments.indexOf(q.department) > -1;
                });
            }

            // 难度筛选
            if (criteria.difficulty) {
                results = results.filter(function (q) {
                    return q.difficulty === criteria.difficulty;
                });
            }

            // 状态筛选（需要统计系统支持）
            if (criteria.status && SZ.stats) {
                results = results.filter(function (q) {
                    var record = SZ.stats.getQuestionRecord
                        ? SZ.stats.getQuestionRecord(q.id)
                        : null;
                    if (criteria.status === 'wrong') {
                        return record && record.wrongCount > 0;
                    } else if (criteria.status === 'correct') {
                        return record && record.correctCount > 0;
                    } else if (criteria.status === 'unattempted') {
                        return !record || record.totalCount === 0;
                    }
                    return true;
                });
            }

            // 排序
            if (criteria.sortBy) {
                switch (criteria.sortBy) {
                    case 'id':
                        results.sort(function (a, b) { return a.id - b.id; });
                        break;
                    case 'id_desc':
                        results.sort(function (a, b) { return b.id - a.id; });
                        break;
                    case 'department':
                        results.sort(function (a, b) {
                            return (a.department || '').localeCompare(b.department || '');
                        });
                        break;
                    case 'type':
                        results.sort(function (a, b) {
                            return (a.type || '').localeCompare(b.type || '');
                        });
                        break;
                }
            }

            return results;
        },

        /**
         * 搜索建议
         */
        getSuggestions: function (keyword, limit) {
            limit = limit || 10;
            if (!keyword) return [];

            var suggestions = [];
            var lowerKeyword = keyword.toLowerCase();

            // 从题干中提取匹配的短语
            for (var i = 0; i < app.state.questions.length && suggestions.length < limit; i++) {
                var q = app.state.questions[i];
                if (q.question && q.question.toLowerCase().indexOf(lowerKeyword) > -1) {
                    // 提取包含关键词的句子片段
                    var sentences = q.question.split(/[，。；;]/);
                    for (var j = 0; j < sentences.length; j++) {
                        if (sentences[j].toLowerCase().indexOf(lowerKeyword) > -1) {
                            var suggestion = sentences[j].trim();
                            if (suggestion.length > 10 && suggestions.indexOf(suggestion) === -1) {
                                suggestions.push(suggestion);
                                if (suggestions.length >= limit) break;
                            }
                        }
                    }
                }
            }

            return suggestions;
        }
    };

    // ============================================================
    //  批量操作工具
    // ============================================================

    /**
     * 批量操作功能
     */
    var batchOperations = {
        /**
         * 批量删除错题
         */
        batchRemoveWrong: function (questionIds) {
            if (!SZ.stats || !SZ.stats.removeFromWrongBook) return;

            questionIds.forEach(function (id) {
                SZ.stats.removeFromWrongBook(id);
            });

            updateSidebarStats();
            showToast('已删除 ' + questionIds.length + ' 道错题', 'success');
        },

        /**
         * 批量添加到收藏
         */
        batchAddToFavorites: function (questionIds) {
            questionIds.forEach(function (id) {
                favoriteManager.add(id);
            });

            showToast('已收藏 ' + questionIds.length + ' 道题目', 'success');
        },

        /**
         * 批量移除收藏
         */
        batchRemoveFavorites: function (questionIds) {
            questionIds.forEach(function (id) {
                favoriteManager.remove(id);
            });

            showToast('已取消收藏 ' + questionIds.length + ' 道题目', 'success');
        },

        /**
         * 重置某章节的答题记录
         */
        resetChapterProgress: function (department) {
            if (!SZ.stats) return;

            var count = 0;
            app.state.questions.forEach(function (q) {
                if (q.department === department) {
                    if (SZ.stats.resetQuestionRecord) {
                        SZ.stats.resetQuestionRecord(q.id);
                        count++;
                    }
                }
            });

            updateSidebarStats();
            renderWelcome();
            showToast('已重置 ' + count + ' 道题目的记录', 'info');
        },

        /**
         * 重置所有进度
         */
        resetAllProgress: function () {
            showConfirmDialog({
                title: '重置学习进度',
                message: '此操作将清除所有答题记录和学习进度，但保留收藏和笔记。确定继续吗？',
                confirmText: '确认重置',
                confirmClass: 'btn-danger',
                onConfirm: function () {
                    if (SZ.stats && SZ.stats.resetProgress) {
                        SZ.stats.resetProgress();
                    }
                    updateSidebarStats();
                    renderWelcome();
                    showToast('学习进度已重置', 'success');
                }
            });
        }
    };

    // ============================================================
    //  主题增强功能
    // ============================================================

    /**
     * 主题快捷切换面板
     */
    var themeQuickPanel = {
        /**
         * 显示快速换肤面板
         */
        show: function () {
            var existing = document.getElementById('quick-theme-panel');
            if (existing) {
                existing.classList.toggle('show');
                return;
            }

            var themes = SZ.themes && SZ.themes.getThemeList
                ? SZ.themes.getThemeList().slice(0, 8)
                : [
                    { id: 'default', name: '默认', colors: ['#667eea', '#764ba2'] },
                    { id: 'dark', name: '暗夜', colors: ['#2d3748', '#1a202c'] },
                    { id: 'ocean', name: '海洋', colors: ['#2193b0', '#6dd5ed'] },
                    { id: 'sunset', name: '日落', colors: ['#ff6b6b', '#feca57'] },
                    { id: 'forest', name: '森林', colors: ['#11998e', '#38ef7d'] },
                    { id: 'rose', name: '玫瑰', colors: ['#ee0979', '#ff6a00'] }
                ];

            var panel = document.createElement('div');
            panel.className = 'quick-theme-panel';
            panel.id = 'quick-theme-panel';

            var html = '<div class="quick-theme-header">快速换肤</div>';
            html += '<div class="quick-theme-grid">';

            themes.forEach(function (theme) {
                var isActive = app.state.settings.theme === theme.id;
                var gradient = theme.colors && theme.colors.length >= 2
                    ? 'linear-gradient(135deg, ' + theme.colors[0] + ', ' + theme.colors[1] + ')'
                    : '#667eea';

                html +=
                    '<button class="quick-theme-item ' + (isActive ? 'active' : '') +
                    '" data-theme="' + theme.id + '" title="' + theme.name + '">' +
                        '<span class="theme-preview" style="background: ' + gradient + '"></span>' +
                    '</button>';
            });

            html += '</div>';
            html += '<div class="quick-theme-footer">';
            html += '<button class="btn-text" onclick="SZ.app._internal.openSettingsPanel()">更多主题 →</button>';
            html += '</div>';

            panel.innerHTML = html;
            document.body.appendChild(panel);

            // 定位到换肤按钮下方
            var themeBtn = document.getElementById('btn-theme-quick');
            if (themeBtn) {
                var rect = themeBtn.getBoundingClientRect();
                panel.style.top = (rect.bottom + 10) + 'px';
                panel.style.right = (window.innerWidth - rect.right) + 'px';
            }

            // 绑定事件
            var items = panel.querySelectorAll('.quick-theme-item');
            items.forEach(function (item) {
                item.addEventListener('click', function () {
                    setTheme(item.dataset.theme);
                    items.forEach(function (i) { i.classList.remove('active'); });
                    item.classList.add('active');
                });
            });

            // 点击外部关闭
            setTimeout(function () {
                document.addEventListener('click', function closePanel(e) {
                    if (!panel.contains(e.target) && e.target.id !== 'btn-theme-quick') {
                        panel.classList.remove('show');
                        document.removeEventListener('click', closePanel);
                    }
                });
            }, 100);

            // 显示动画
            requestAnimationFrame(function () {
                panel.classList.add('show');
            });

            playSound('ui_open');
        }
    };

    // ============================================================
    //  数据统计图表工具
    // ============================================================

    var chartUtils = {
        /**
         * 绘制柱状图
         */
        drawBarChart: function (canvas, data, options) {
            if (!canvas || !data || !data.length) return;

            var ctx = canvas.getContext('2d');
            var width = canvas.width;
            var height = canvas.height;
            options = options || {};

            var padding = options.padding || { top: 20, right: 20, bottom: 30, left: 40 };
            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }));
            maxValue = maxValue * 1.1 || 1;

            var barWidth = chartWidth / data.length * 0.6;
            var barGap = chartWidth / data.length * 0.4;

            // 清空画布
            ctx.clearRect(0, 0, width, height);

            // 绘制网格线
            ctx.strokeStyle = options.gridColor || 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            var gridLines = 5;
            for (var i = 0; i <= gridLines; i++) {
                var y = padding.top + (chartHeight / gridLines) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            // 绘制柱状
            data.forEach(function (item, index) {
                var barHeight = (item.value / maxValue) * chartHeight;
                var x = padding.left + barGap / 2 + index * (barWidth + barGap);
                var y = padding.top + chartHeight - barHeight;

                // 渐变填充
                var gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
                gradient.addColorStop(0, item.color || options.barColor || '#667eea');
                gradient.addColorStop(1, item.color2 || options.barColor2 || '#764ba2');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, 4);
                ctx.fill();

                // 标签
                if (item.label) {
                    ctx.fillStyle = options.labelColor || '#666';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.label, x + barWidth / 2, height - 10);
                }

                // 数值
                if (options.showValues) {
                    ctx.fillStyle = options.valueColor || '#333';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillText(item.value, x + barWidth / 2, y - 5);
                }
            });
        },

        /**
         * 绘制环形进度图
         */
        drawDonutChart: function (canvas, percent, options) {
            if (!canvas) return;

            var ctx = canvas.getContext('2d');
            var width = canvas.width;
            var height = canvas.height;
            var centerX = width / 2;
            var centerY = height / 2;
            var radius = Math.min(width, height) / 2 - 10;
            var lineWidth = options && options.lineWidth || 12;

            options = options || {};
            percent = Math.min(100, Math.max(0, percent));

            ctx.clearRect(0, 0, width, height);

            // 背景环
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = options.bgColor || 'rgba(0,0,0,0.1)';
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // 进度环
            var startAngle = -Math.PI / 2;
            var endAngle = startAngle + (Math.PI * 2 * percent / 100);

            var gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, options.color1 || '#667eea');
            gradient.addColorStop(1, options.color2 || '#764ba2');

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 中心文字
            if (options.showText) {
                ctx.fillStyle = options.textColor || '#333';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(percent + '%', centerX, centerY);

                if (options.subText) {
                    ctx.font = '12px sans-serif';
                    ctx.fillStyle = options.subTextColor || '#999';
                    ctx.fillText(options.subText, centerX, centerY + 20);
                }
            }
        },

        /**
         * 绘制折线图
         */
        drawLineChart: function (canvas, data, options) {
            if (!canvas || !data || !data.length) return;

            var ctx = canvas.getContext('2d');
            var width = canvas.width;
            var height = canvas.height;
            options = options || {};

            var padding = options.padding || { top: 20, right: 20, bottom: 30, left: 40 };
            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }));
            maxValue = maxValue * 1.1 || 1;

            var stepX = chartWidth / (data.length - 1 || 1);

            ctx.clearRect(0, 0, width, height);

            // 网格线
            ctx.strokeStyle = options.gridColor || 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            var gridLines = 5;
            for (var i = 0; i <= gridLines; i++) {
                var y = padding.top + (chartHeight / gridLines) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            // 绘制折线
            ctx.beginPath();
            data.forEach(function (item, index) {
                var x = padding.left + index * stepX;
                var y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.strokeStyle = options.lineColor || '#667eea';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 填充区域
            if (options.fillArea) {
                ctx.lineTo(padding.left + (data.length - 1) * stepX, padding.top + chartHeight);
                ctx.lineTo(padding.left, padding.top + chartHeight);
                ctx.closePath();

                var fillGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
                fillGradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
                fillGradient.addColorStop(1, 'rgba(102, 126, 234, 0.02)');
                ctx.fillStyle = fillGradient;
                ctx.fill();
            }

            // 数据点
            data.forEach(function (item, index) {
                var x = padding.left + index * stepX;
                var y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = options.dotColor || '#fff';
                ctx.fill();
                ctx.strokeStyle = options.lineColor || '#667eea';
                ctx.lineWidth = 2;
                ctx.stroke();

                // 标签
                if (item.label && index % Math.ceil(data.length / 7) === 0) {
                    ctx.fillStyle = options.labelColor || '#666';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.label, x, height - 10);
                }
            });
        }
    };

    // ============================================================
    //  Canvas roundRect polyfill
    // ============================================================
    if (typeof CanvasRenderingContext2D !== 'undefined' &&
        !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }

    app._internal = {
        renderQuestion: renderQuestion,
        renderOptions: renderOptions,
        renderAnswerCard: renderAnswerCard,
        renderProgress: renderProgress,
        renderWelcome: renderWelcome,
        renderStats: renderStats,
        renderWrongBook: renderWrongBook,
        submitAnswer: submitAnswer,
        goToPrevQuestion: goToPrevQuestion,
        goToNextQuestion: goToNextQuestion,
        goToQuestion: goToQuestion,
        openSidebar: openSidebar,
        closeSidebar: closeSidebar,
        toggleSidebar: toggleSidebar,
        openSettingsPanel: openSettingsPanel,
        closeSettingsPanel: closeSettingsPanel,
        openSearchPanel: openSearchPanel,
        closeSearchPanel: closeSearchPanel,
        openAnswerCard: openAnswerCard,
        closeAnswerCard: closeAnswerCard,
        showToast: showToast,
        showConfirmDialog: showConfirmDialog,
        setTheme: setTheme,
        exportData: exportData,
        importData: importData,
        formatTime: formatTime,
        formatNumber: formatNumber,
        debounce: debounce,
        throttle: throttle,
        escapeHtml: escapeHtml,
        playSound: playSound,
        vibrate: vibrate,
        PANELS: PANELS,
        MODE_ENTRIES: MODE_ENTRIES,
        QUESTION_TYPES: QUESTION_TYPES,
        ANSWER_STATUS: ANSWER_STATUS,
        STORAGE_KEYS: STORAGE_KEYS
    };

    console.log('[SZ.app] 模块定义完成，等待DOM就绪...');

})(window);