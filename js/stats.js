/**
 * 刷题应用 - 学习统计与进度可视化系统
 * 
 * 命名空间: SZ.stats
 * 功能: 学习数据统计、进度可视化、成就系统、图表渲染
 * 存储: localStorage
 * 图表: 原生Canvas实现，无第三方依赖
 * 
 * @module SZ.stats
 * @version 1.0.0
 */

(function (global) {
    'use strict';

    // ============================================================
    //  命名空间初始化
    // ============================================================
    global.SZ = global.SZ || {};
    var stats = {};
    global.SZ.stats = stats;

    // ============================================================
    //  常量定义
    // ============================================================
    var STORAGE_KEYS = {
        QUESTION_RECORDS: 'sz_question_records',      // 题目答题记录
        DAILY_DATA: 'sz_daily_data',                   // 每日学习数据
        OVERALL_STATS: 'sz_overall_stats',             // 整体统计
        WRONG_BOOK: 'sz_wrong_book',                   // 错题本
        FAVORITES: 'sz_favorites',                     // 收藏题目
        NOTES: 'sz_notes',                             // 笔记
        ACHIEVEMENTS: 'sz_achievements',               // 成就
        USER_LEVEL: 'sz_user_level',                   // 用户等级
        SETTINGS: 'sz_stats_settings',                 // 设置
        SKIN_USAGE: 'sz_skin_usage',                   // 皮肤使用记录
        GAME_MODE_STATS: 'sz_game_mode_stats'          // 游戏模式统计
    };

    var MASTERY_LEVELS = 5; // 掌握程度最高5级
    var MAX_COMBO = 100;     // 最大连击记录

    // 艾宾浩斯遗忘曲线复习间隔（天数）
    var EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30];

    // 等级经验表（每级所需经验）
    var LEVEL_EXP = [
        0, 50, 120, 220, 350, 520, 730, 980, 1280, 1630,
        2030, 2480, 2980, 3530, 4130, 4780, 5480, 6230, 7030, 7880,
        8780, 9730, 10730, 11780, 12880, 14030, 15230, 16480, 17780, 19130,
        20530, 21980, 23480, 25030, 26630, 28280, 29980, 31730, 33530, 35380,
        37280, 39230, 41230, 43280, 45380, 47530, 49730, 51980, 54280, 56630,
        59030, 61480, 63980, 66530, 69130, 71780, 74480, 77230, 80030, 82880,
        85780, 88730, 91730, 94780, 97880, 101030, 104230, 107480, 110780, 114130,
        117530, 120980, 124480, 128030, 131630, 135280, 138980, 142730, 146530, 150380,
        154280, 158230, 162230, 166280, 170380, 174530, 178730, 182980, 187280, 191630,
        196030, 200480, 204980, 209530, 214130, 218780, 223480, 228230, 233030, 237880
    ];
    var MAX_LEVEL = LEVEL_EXP.length - 1;

    // 经验值配置
    var EXP_CONFIG = {
        CORRECT_ANSWER: 10,       // 答对一题
        WRONG_ANSWER: 2,          // 答错一题
        PERFECT_BONUS: 50,        // 全对奖励
        DAILY_STREAK_BONUS: 20,   // 连续学习每日奖励
        ACHIEVEMENT_BONUS: 100,   // 成就奖励
        REVIEW_WRONG: 15          // 复习错题
    };

    // 每日学习目标
    var DEFAULT_DAILY_GOAL = {
        questionCount: 30,    // 每日做题数
        correctRate: 0.7,     // 正确率目标
        studyTime: 1800       // 学习时长（秒）
    };

    // ============================================================
    //  工具函数
    // ============================================================
    var Utils = {
        /**
         * 从localStorage读取数据
         * @param {string} key - 存储键
         * @param {*} defaultValue - 默认值
         * @returns {*} 解析后的数据
         */
        getStorage: function (key, defaultValue) {
            try {
                var data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.warn('读取localStorage失败:', key, e);
                return defaultValue;
            }
        },

        /**
         * 保存数据到localStorage
         * @param {string} key - 存储键
         * @param {*} data - 要保存的数据
         */
        setStorage: function (key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('保存localStorage失败:', key, e);
            }
        },

        /**
         * 生成唯一ID
         * @returns {string} 唯一ID
         */
        generateId: function () {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 格式化日期为 YYYY-MM-DD
         * @param {Date|string|number} date - 日期
         * @returns {string} 格式化后的日期字符串
         */
        formatDate: function (date) {
            var d = new Date(date);
            var year = d.getFullYear();
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        },

        /**
         * 获取今天的日期字符串
         * @returns {string} 今天的日期
         */
        getToday: function () {
            return this.formatDate(new Date());
        },

        /**
         * 格式化时间为 HH:MM:SS
         * @param {number} seconds - 秒数
         * @returns {string} 格式化后的时间
         */
        formatTime: function (seconds) {
            var h = Math.floor(seconds / 3600);
            var m = Math.floor((seconds % 3600) / 60);
            var s = seconds % 60;
            return String(h).padStart(2, '0') + ':' +
                   String(m).padStart(2, '0') + ':' +
                   String(s).padStart(2, '0');
        },

        /**
         * 格式化时长为易读形式
         * @param {number} seconds - 秒数
         * @returns {string} 易读时长
         */
        formatDuration: function (seconds) {
            if (seconds < 60) return seconds + '秒';
            if (seconds < 3600) return Math.floor(seconds / 60) + '分钟';
            var h = Math.floor(seconds / 3600);
            var m = Math.floor((seconds % 3600) / 60);
            return h + '小时' + (m > 0 ? m + '分' : '');
        },

        /**
         * 计算两个日期之间的天数差
         * @param {string} date1 - 日期1
         * @param {string} date2 - 日期2
         * @returns {number} 天数差
         */
        daysBetween: function (date1, date2) {
            var d1 = new Date(date1);
            var d2 = new Date(date2);
            d1.setHours(0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);
            return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        },

        /**
         * 获取指定日期前N天的日期
         * @param {string|Date} date - 基准日期
         * @param {number} n - 天数
         * @returns {string} 日期字符串
         */
        daysAgo: function (date, n) {
            var d = new Date(date);
            d.setDate(d.getDate() - n);
            return this.formatDate(d);
        },

        /**
         * 获取本周的开始日期
         * @returns {string} 周一日期
         */
        getWeekStart: function () {
            var d = new Date();
            var day = d.getDay();
            var diff = day === 0 ? 6 : day - 1;
            d.setDate(d.getDate() - diff);
            return this.formatDate(d);
        },

        /**
         * 获取本月的开始日期
         * @returns {string} 月初日期
         */
        getMonthStart: function () {
            var d = new Date();
            d.setDate(1);
            return this.formatDate(d);
        },

        /**
         * 获取月份中的天数
         * @param {number} year - 年
         * @param {number} month - 月 (0-11)
         * @returns {number} 天数
         */
        getDaysInMonth: function (year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        /**
         * 限制数值在范围内
         * @param {number} value - 值
         * @param {number} min - 最小值
         * @param {number} max - 最大值
         * @returns {number} 限制后的值
         */
        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        /**
         * 深拷贝对象
         * @param {*} obj - 要拷贝的对象
         * @returns {*} 拷贝后的对象
         */
        deepClone: function (obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) {
                return obj.map(function (item) { return Utils.deepClone(item); });
            }
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = Utils.deepClone(obj[key]);
                }
            }
            return result;
        },

        /**
         * 计算百分率
         * @param {number} part - 部分
         * @param {number} total - 总数
         * @param {number} decimals - 小数位数
         * @returns {number} 百分率
         */
        percentage: function (part, total, decimals) {
            if (total === 0) return 0;
            decimals = decimals === undefined ? 1 : decimals;
            var factor = Math.pow(10, decimals);
            return Math.round((part / total) * 100 * factor) / factor;
        },

        /**
         * 生成随机颜色
         * @returns {string} 十六进制颜色
         */
        randomColor: function () {
            return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        },

        /**
         * 调整颜色透明度
         * @param {string} color - 十六进制颜色
         * @param {number} alpha - 透明度 (0-1)
         * @returns {string} rgba颜色
         */
        hexToRgba: function (hex, alpha) {
            var r = parseInt(hex.slice(1, 3), 16);
            var g = parseInt(hex.slice(3, 5), 16);
            var b = parseInt(hex.slice(5, 7), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        },

        /**
         * 线性插值
         * @param {number} a - 起始值
         * @param {number} b - 结束值
         * @param {number} t - 插值因子 0-1
         * @returns {number} 插值结果
         */
        lerp: function (a, b, t) {
            return a + (b - a) * t;
        },

        /**
         * 计算数组平均值
         * @param {number[]} arr - 数组
         * @returns {number} 平均值
         */
        average: function (arr) {
            if (arr.length === 0) return 0;
            var sum = arr.reduce(function (s, v) { return s + v; }, 0);
            return sum / arr.length;
        },

        /**
         * 计算数组最大值
         * @param {number[]} arr - 数组
         * @returns {number} 最大值
         */
        max: function (arr) {
            if (arr.length === 0) return 0;
            return Math.max.apply(null, arr);
        },

        /**
         * 计算数组最小值
         * @param {number[]} arr - 数组
         * @returns {number} 最小值
         */
        min: function (arr) {
            if (arr.length === 0) return 0;
            return Math.min.apply(null, arr);
        },

        /**
         * 检查是否为有效的Canvas元素
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @returns {HTMLCanvasElement|null} Canvas元素
         */
        getCanvas: function (canvas) {
            if (typeof canvas === 'string') {
                return document.getElementById(canvas);
            }
            return canvas && canvas.getContext ? canvas : null;
        },

        /**
         * 获取Canvas的2D上下文，处理高DPI
         * @param {HTMLCanvasElement} canvas - Canvas元素
         * @param {number} width - 逻辑宽度
         * @param {number} height - 逻辑高度
         * @returns {CanvasRenderingContext2D} 上下文
         */
        getContext: function (canvas, width, height) {
            var ctx = canvas.getContext('2d');
            var dpr = window.devicePixelRatio || 1;
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            
            ctx.scale(dpr, dpr);
            return ctx;
        },

        /**
         * 绘制圆角矩形
         * @param {CanvasRenderingContext2D} ctx - 上下文
         * @param {number} x - x坐标
         * @param {number} y - y坐标
         * @param {number} w - 宽度
         * @param {number} h - 高度
         * @param {number} r - 圆角半径
         */
        roundRect: function (ctx, x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        },

        /**
         * 文字换行绘制
         * @param {CanvasRenderingContext2D} ctx - 上下文
         * @param {string} text - 文本
         * @param {number} x - x坐标
         * @param {number} y - y坐标
         * @param {number} maxWidth - 最大宽度
         * @param {number} lineHeight - 行高
         */
        wrapText: function (ctx, text, x, y, maxWidth, lineHeight) {
            var chars = text.split('');
            var line = '';
            var lines = [];
            
            for (var i = 0; i < chars.length; i++) {
                var testLine = line + chars[i];
                var testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && i > 0) {
                    lines.push(line);
                    line = chars[i];
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            
            for (var j = 0; j < lines.length; j++) {
                ctx.fillText(lines[j], x, y + j * lineHeight);
            }
        }
    };

    // 暴露工具函数（内部使用）
    stats._utils = Utils;

    // ============================================================
    //  数据模型定义
    // ============================================================

    /**
     * 创建题目答题记录
     * @param {string} questionId - 题目ID
     * @returns {Object} 答题记录对象
     */
    function createQuestionRecord(questionId) {
        return {
            questionId: questionId,
            correctCount: 0,        // 答对次数
            wrongCount: 0,          // 答错次数
            totalTime: 0,           // 总答题用时（秒）
            answerCount: 0,         // 答题总次数
            lastAnswerTime: null,   // 最后答题时间
            masteryLevel: 0,        // 掌握程度 0-5
            firstAnswerTime: null,  // 首次答题时间
            streakCorrect: 0,       // 当前连续答对次数
            maxStreak: 0,           // 最大连续答对次数
            reviewHistory: [],      // 复习历史 [{date, result}]
            nextReviewDate: null,   // 下次复习日期（艾宾浩斯）
            department: '',         // 所属部门/章节
            questionType: ''        // 题型
        };
    }

    /**
     * 创建每日学习数据
     * @param {string} date - 日期
     * @returns {Object} 每日数据对象
     */
    function createDailyData(date) {
        return {
            date: date,
            questionCount: 0,       // 做题数
            correctCount: 0,        // 正确数
            wrongCount: 0,          // 错误数
            studyTime: 0,           // 学习时长（秒）
            knowledgePoints: [],    // 涉及知识点
            departments: {},        // 各部门做题数 {deptId: count}
            questionTypes: {        // 各题型统计
                judge: { total: 0, correct: 0 },
                single: { total: 0, correct: 0 },
                multiple: { total: 0, correct: 0 }
            },
            sessions: 0,            // 学习会话数
            firstStudyTime: null,   // 首次学习时间
            lastStudyTime: null,    // 最后学习时间
            expGained: 0,           // 今日获得经验
            achievements: [],       // 今日解锁的成就
            reviewedWrong: 0        // 复习错题数
        };
    }

    /**
     * 创建整体统计数据
     * @returns {Object} 整体统计对象
     */
    function createOverallStats() {
        return {
            totalQuestions: 0,      // 总做题数
            totalCorrect: 0,        // 总正确数
            totalWrong: 0,          // 总错误数
            totalTime: 0,           // 总学习时长（秒）
            streakDays: 0,          // 连续学习天数
            maxStreakDays: 0,       // 最大连续学习天数
            totalStudyDays: 0,      // 累计学习天数
            firstStudyDate: null,   // 首次学习日期
            lastStudyDate: null,    // 最后学习日期
            maxCombo: 0,            // 历史最大连击
            currentCombo: 0,        // 当前连击
            totalExp: 0,            // 总经验值
            level: 1,               // 当前等级
            masteredQuestions: 0,   // 掌握的题目数
            reviewWrongCount: 0     // 复习错题总数
        };
    }

    /**
     * 创建错题记录
     * @param {string} questionId - 题目ID
     * @returns {Object} 错题记录
     */
    function createWrongRecord(questionId) {
        return {
            questionId: questionId,
            addedDate: Utils.getToday(),
            wrongCount: 1,
            reviewCount: 0,
            lastReviewDate: null,
            mastered: false,
            department: '',
            questionType: '',
            note: ''
        };
    }

    /**
     * 创建收藏记录
     * @param {string} questionId - 题目ID
     * @returns {Object} 收藏记录
     */
    function createFavoriteRecord(questionId) {
        return {
            questionId: questionId,
            addedDate: Utils.getToday(),
            folder: 'default',
            tags: [],
            note: ''
        };
    }

    /**
     * 创建笔记
     * @param {string} questionId - 题目ID
     * @param {string} content - 笔记内容
     * @returns {Object} 笔记对象
     */
    function createNote(questionId, content) {
        return {
            id: Utils.generateId(),
            questionId: questionId,
            content: content,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            tags: [],
            isImportant: false
        };
    }

    // ============================================================
    //  StatsManager - 统计数据管理核心
    // ============================================================
    var StatsManager = {
        _questionRecords: null,
        _dailyData: null,
        _overallStats: null,
        _wrongBook: null,
        _favorites: null,
        _notes: null,
        _listeners: {},

        /**
         * 初始化统计管理器
         */
        init: function () {
            this._loadAllData();
            this._ensureTodayData();
        },

        /**
         * 加载所有数据
         */
        _loadAllData: function () {
            this._questionRecords = Utils.getStorage(STORAGE_KEYS.QUESTION_RECORDS, {});
            this._dailyData = Utils.getStorage(STORAGE_KEYS.DAILY_DATA, {});
            this._overallStats = Utils.getStorage(STORAGE_KEYS.OVERALL_STATS, createOverallStats());
            this._wrongBook = Utils.getStorage(STORAGE_KEYS.WRONG_BOOK, {});
            this._favorites = Utils.getStorage(STORAGE_KEYS.FAVORITES, {});
            this._notes = Utils.getStorage(STORAGE_KEYS.NOTES, []);
            
            // 兼容旧数据
            if (!this._overallStats.level) {
                this._overallStats.level = 1;
                this._overallStats.totalExp = 0;
            }
        },

        /**
         * 保存所有数据
         */
        _saveAllData: function () {
            Utils.setStorage(STORAGE_KEYS.QUESTION_RECORDS, this._questionRecords);
            Utils.setStorage(STORAGE_KEYS.DAILY_DATA, this._dailyData);
            Utils.setStorage(STORAGE_KEYS.OVERALL_STATS, this._overallStats);
            Utils.setStorage(STORAGE_KEYS.WRONG_BOOK, this._wrongBook);
            Utils.setStorage(STORAGE_KEYS.FAVORITES, this._favorites);
            Utils.setStorage(STORAGE_KEYS.NOTES, this._notes);
        },

        /**
         * 确保今日数据存在
         */
        _ensureTodayData: function () {
            var today = Utils.getToday();
            if (!this._dailyData[today]) {
                this._dailyData[today] = createDailyData(today);
                this._updateStreakDays();
                this._saveAllData();
            }
        },

        /**
         * 更新连续学习天数
         */
        _updateStreakDays: function () {
            var today = Utils.getToday();
            var lastDate = this._overallStats.lastStudyDate;
            
            if (lastDate === today) {
                return; // 今天已经计算过
            }
            
            if (!lastDate) {
                this._overallStats.streakDays = 1;
            } else {
                var diff = Utils.daysBetween(lastDate, today);
                if (diff === 1) {
                    this._overallStats.streakDays++;
                } else if (diff > 1) {
                    this._overallStats.streakDays = 1;
                }
            }
            
            this._overallStats.maxStreakDays = Math.max(
                this._overallStats.maxStreakDays,
                this._overallStats.streakDays
            );
            this._overallStats.totalStudyDays++;
            this._overallStats.lastStudyDate = today;
            
            if (!this._overallStats.firstStudyDate) {
                this._overallStats.firstStudyDate = today;
            }
        },

        /**
         * 记录答题结果
         * @param {Object} params - 参数
         * @param {string} params.questionId - 题目ID
         * @param {boolean} params.isCorrect - 是否正确
         * @param {number} params.timeSpent - 用时（秒）
         * @param {string} params.department - 部门/章节
         * @param {string} params.questionType - 题型 (judge/single/multiple)
         * @param {string[]} params.knowledgePoints - 知识点
         * @param {string} params.mode - 模式 (normal/review/game/flashcard)
         */
        recordAnswer: function (params) {
            this._ensureTodayData();
            var today = Utils.getToday();
            var todayData = this._dailyData[today];
            var qId = params.questionId;
            
            // 获取或创建题目记录
            if (!this._questionRecords[qId]) {
                this._questionRecords[qId] = createQuestionRecord(qId);
            }
            var record = this._questionRecords[qId];
            
            // 更新题目记录
            record.answerCount++;
            record.totalTime += params.timeSpent;
            record.lastAnswerTime = new Date().toISOString();
            
            if (params.department) record.department = params.department;
            if (params.questionType) record.questionType = params.questionType;
            
            if (!record.firstAnswerTime) {
                record.firstAnswerTime = new Date().toISOString();
            }
            
            if (params.isCorrect) {
                record.correctCount++;
                record.streakCorrect++;
                record.maxStreak = Math.max(record.maxStreak, record.streakCorrect);
                
                // 更新整体连击
                this._overallStats.currentCombo++;
                this._overallStats.maxCombo = Math.max(
                    this._overallStats.maxCombo,
                    this._overallStats.currentCombo
                );
                
                // 增加经验
                this._addExp(EXP_CONFIG.CORRECT_ANSWER);
                todayData.expGained += EXP_CONFIG.CORRECT_ANSWER;
            } else {
                record.wrongCount++;
                record.streakCorrect = 0;
                
                // 重置整体连击
                this._overallStats.currentCombo = 0;
                
                // 少量经验
                this._addExp(EXP_CONFIG.WRONG_ANSWER);
                todayData.expGained += EXP_CONFIG.WRONG_ANSWER;
                
                // 添加到错题本
                this._addToWrongBook(qId, params.department, params.questionType);
            }
            
            // 计算掌握度
            record.masteryLevel = ProgressCalculator.calculateMastery(record);
            
            // 计算下次复习日期
            record.nextReviewDate = ProgressCalculator.calculateNextReview(record);
            
            // 记录复习历史
            record.reviewHistory.push({
                date: today,
                result: params.isCorrect ? 'correct' : 'wrong',
                time: params.timeSpent
            });
            if (record.reviewHistory.length > 100) {
                record.reviewHistory.shift();
            }
            
            // 更新今日数据
            todayData.questionCount++;
            if (params.isCorrect) {
                todayData.correctCount++;
            } else {
                todayData.wrongCount++;
            }
            todayData.studyTime += params.timeSpent;
            
            if (!todayData.firstStudyTime) {
                todayData.firstStudyTime = new Date().toISOString();
            }
            todayData.lastStudyTime = new Date().toISOString();
            
            // 更新部门统计
            if (params.department) {
                if (!todayData.departments[params.department]) {
                    todayData.departments[params.department] = { total: 0, correct: 0 };
                }
                todayData.departments[params.department].total++;
                if (params.isCorrect) {
                    todayData.departments[params.department].correct++;
                }
            }
            
            // 更新题型统计
            if (params.questionType && todayData.questionTypes[params.questionType]) {
                todayData.questionTypes[params.questionType].total++;
                if (params.isCorrect) {
                    todayData.questionTypes[params.questionType].correct++;
                }
            }
            
            // 更新知识点
            if (params.knowledgePoints && params.knowledgePoints.length) {
                params.knowledgePoints.forEach(function (kp) {
                    if (todayData.knowledgePoints.indexOf(kp) === -1) {
                        todayData.knowledgePoints.push(kp);
                    }
                });
            }
            
            // 复习模式统计
            if (params.mode === 'review') {
                todayData.reviewedWrong++;
                this._overallStats.reviewWrongCount++;
                if (params.isCorrect) {
                    this._addExp(EXP_CONFIG.REVIEW_WRONG);
                    todayData.expGained += EXP_CONFIG.REVIEW_WRONG;
                }
            }
            
            // 更新整体统计
            this._overallStats.totalQuestions++;
            if (params.isCorrect) {
                this._overallStats.totalCorrect++;
            } else {
                this._overallStats.totalWrong++;
            }
            this._overallStats.totalTime += params.timeSpent;
            
            // 重新计算掌握题目数
            this._recalculateMasteredCount();
            
            // 保存数据
            this._saveAllData();
            
            // 触发事件
            this._emit('answerRecorded', {
                questionId: qId,
                isCorrect: params.isCorrect,
                record: record,
                todayData: todayData
            });
            
            // 检查成就
            AchievementManager.checkAll();
            
            return record;
        },

        /**
         * 添加经验值
         * @param {number} exp - 经验值
         */
        _addExp: function (exp) {
            this._overallStats.totalExp += exp;
            
            // 计算等级
            var newLevel = 1;
            for (var i = LEVEL_EXP.length - 1; i >= 0; i--) {
                if (this._overallStats.totalExp >= LEVEL_EXP[i]) {
                    newLevel = i + 1;
                    break;
                }
            }
            
            if (newLevel > this._overallStats.level) {
                var oldLevel = this._overallStats.level;
                this._overallStats.level = newLevel;
                this._emit('levelUp', {
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    exp: this._overallStats.totalExp
                });
            }
        },

        /**
         * 添加到错题本
         */
        _addToWrongBook: function (questionId, department, questionType) {
            if (!this._wrongBook[questionId]) {
                this._wrongBook[questionId] = createWrongRecord(questionId);
                if (department) this._wrongBook[questionId].department = department;
                if (questionType) this._wrongBook[questionId].questionType = questionType;
            } else {
                this._wrongBook[questionId].wrongCount++;
                this._wrongBook[questionId].mastered = false;
            }
        },

        /**
         * 重新计算掌握题目数
         */
        _recalculateMasteredCount: function () {
            var count = 0;
            for (var id in this._questionRecords) {
                if (this._questionRecords.hasOwnProperty(id)) {
                    if (this._questionRecords[id].masteryLevel >= MASTERY_LEVELS) {
                        count++;
                    }
                }
            }
            this._overallStats.masteredQuestions = count;
        },

        /**
         * 增加学习时长
         * @param {number} seconds - 秒数
         */
        addStudyTime: function (seconds) {
            this._ensureTodayData();
            var today = Utils.getToday();
            this._dailyData[today].studyTime += seconds;
            this._overallStats.totalTime += seconds;
            this._saveAllData();
        },

        /**
         * 开始新的学习会话
         */
        startSession: function () {
            this._ensureTodayData();
            var today = Utils.getToday();
            this._dailyData[today].sessions++;
            this._saveAllData();
        },

        // ---------- 错题本管理 ----------

        /**
         * 获取错题本列表
         * @param {Object} options - 选项
         * @returns {Array} 错题列表
         */
        getWrongBook: function (options) {
            options = options || {};
            var list = [];
            for (var id in this._wrongBook) {
                if (this._wrongBook.hasOwnProperty(id)) {
                    var item = Utils.deepClone(this._wrongBook[id]);
                    
                    // 筛选
                    if (options.department && item.department !== options.department) continue;
                    if (options.mastered !== undefined && item.mastered !== options.mastered) continue;
                    
                    list.push(item);
                }
            }
            
            // 排序
            if (options.sortBy === 'wrongCount') {
                list.sort(function (a, b) { return b.wrongCount - a.wrongCount; });
            } else if (options.sortBy === 'date') {
                list.sort(function (a, b) { return new Date(b.addedDate) - new Date(a.addedDate); });
            }
            
            return list;
        },

        /**
         * 从错题本移除
         * @param {string} questionId - 题目ID
         */
        removeFromWrongBook: function (questionId) {
            if (this._wrongBook[questionId]) {
                delete this._wrongBook[questionId];
                this._saveAllData();
                this._emit('wrongBookUpdated');
            }
        },

        /**
         * 标记错题为已掌握
         * @param {string} questionId - 题目ID
         */
        markWrongMastered: function (questionId) {
            if (this._wrongBook[questionId]) {
                this._wrongBook[questionId].mastered = true;
                this._saveAllData();
                this._emit('wrongBookUpdated');
            }
        },

        /**
         * 更新错题复习记录
         * @param {string} questionId - 题目ID
         * @param {boolean} isCorrect - 是否正确
         */
        updateWrongReview: function (questionId, isCorrect) {
            if (this._wrongBook[questionId]) {
                var item = this._wrongBook[questionId];
                item.reviewCount++;
                item.lastReviewDate = Utils.getToday();
                if (isCorrect && item.reviewCount >= 3) {
                    item.mastered = true;
                }
                this._saveAllData();
            }
        },

        /**
         * 获取待复习的错题
         * @param {number} limit - 数量限制
         * @returns {Array} 待复习错题列表
         */
        getWrongToReview: function (limit) {
            limit = limit || 20;
            var list = [];
            for (var id in this._wrongBook) {
                if (this._wrongBook.hasOwnProperty(id) && !this._wrongBook[id].mastered) {
                    list.push(Utils.deepClone(this._wrongBook[id]));
                }
            }
            // 按错误次数排序
            list.sort(function (a, b) { return b.wrongCount - a.wrongCount; });
            return list.slice(0, limit);
        },

        // ---------- 收藏管理 ----------

        /**
         * 添加收藏
         * @param {string} questionId - 题目ID
         * @param {Object} meta - 元信息
         */
        addFavorite: function (questionId, meta) {
            if (!this._favorites[questionId]) {
                this._favorites[questionId] = createFavoriteRecord(questionId);
                if (meta) {
                    if (meta.folder) this._favorites[questionId].folder = meta.folder;
                    if (meta.tags) this._favorites[questionId].tags = meta.tags;
                }
                this._saveAllData();
                this._emit('favoritesUpdated');
                return true;
            }
            return false;
        },

        /**
         * 取消收藏
         * @param {string} questionId - 题目ID
         */
        removeFavorite: function (questionId) {
            if (this._favorites[questionId]) {
                delete this._favorites[questionId];
                this._saveAllData();
                this._emit('favoritesUpdated');
                return true;
            }
            return false;
        },

        /**
         * 检查是否已收藏
         * @param {string} questionId - 题目ID
         * @returns {boolean} 是否已收藏
         */
        isFavorite: function (questionId) {
            return !!this._favorites[questionId];
        },

        /**
         * 获取收藏列表
         * @param {Object} options - 选项
         * @returns {Array} 收藏列表
         */
        getFavorites: function (options) {
            options = options || {};
            var list = [];
            for (var id in this._favorites) {
                if (this._favorites.hasOwnProperty(id)) {
                    var item = Utils.deepClone(this._favorites[id]);
                    if (options.folder && item.folder !== options.folder) continue;
                    list.push(item);
                }
            }
            list.sort(function (a, b) {
                return new Date(b.addedDate) - new Date(a.addedDate);
            });
            return list;
        },

        /**
         * 获取收藏数量
         * @returns {number} 收藏数
         */
        getFavoriteCount: function () {
            return Object.keys(this._favorites).length;
        },

        // ---------- 笔记管理 ----------

        /**
         * 添加笔记
         * @param {string} questionId - 题目ID
         * @param {string} content - 笔记内容
         * @param {Object} options - 选项
         * @returns {Object} 笔记对象
         */
        addNote: function (questionId, content, options) {
            var note = createNote(questionId, content);
            if (options) {
                if (options.tags) note.tags = options.tags;
                if (options.isImportant) note.isImportant = options.isImportant;
            }
            this._notes.push(note);
            this._saveAllData();
            this._emit('notesUpdated');
            return note;
        },

        /**
         * 更新笔记
         * @param {string} noteId - 笔记ID
         * @param {Object} updates - 更新内容
         * @returns {boolean} 是否成功
         */
        updateNote: function (noteId, updates) {
            for (var i = 0; i < this._notes.length; i++) {
                if (this._notes[i].id === noteId) {
                    if (updates.content !== undefined) this._notes[i].content = updates.content;
                    if (updates.tags !== undefined) this._notes[i].tags = updates.tags;
                    if (updates.isImportant !== undefined) this._notes[i].isImportant = updates.isImportant;
                    this._notes[i].updatedDate = new Date().toISOString();
                    this._saveAllData();
                    this._emit('notesUpdated');
                    return true;
                }
            }
            return false;
        },

        /**
         * 删除笔记
         * @param {string} noteId - 笔记ID
         * @returns {boolean} 是否成功
         */
        deleteNote: function (noteId) {
            for (var i = 0; i < this._notes.length; i++) {
                if (this._notes[i].id === noteId) {
                    this._notes.splice(i, 1);
                    this._saveAllData();
                    this._emit('notesUpdated');
                    return true;
                }
            }
            return false;
        },

        /**
         * 获取笔记列表
         * @param {Object} options - 选项
         * @returns {Array} 笔记列表
         */
        getNotes: function (options) {
            options = options || {};
            var list = Utils.deepClone(this._notes);
            
            if (options.questionId) {
                list = list.filter(function (n) { return n.questionId === options.questionId; });
            }
            if (options.isImportant) {
                list = list.filter(function (n) { return n.isImportant; });
            }
            if (options.tag) {
                list = list.filter(function (n) { return n.tags.indexOf(options.tag) !== -1; });
            }
            
            list.sort(function (a, b) {
                return new Date(b.updatedDate) - new Date(a.updatedDate);
            });
            
            return list;
        },

        /**
         * 获取笔记数量
         * @returns {number} 笔记数
         */
        getNoteCount: function () {
            return this._notes.length;
        },

        // ---------- 数据获取 ----------

        /**
         * 获取题目答题记录
         * @param {string} questionId - 题目ID
         * @returns {Object|null} 答题记录
         */
        getQuestionRecord: function (questionId) {
            return this._questionRecords[questionId]
                ? Utils.deepClone(this._questionRecords[questionId])
                : null;
        },

        /**
         * 获取所有题目记录
         * @returns {Object} 所有题目记录
         */
        getAllQuestionRecords: function () {
            return Utils.deepClone(this._questionRecords);
        },

        /**
         * 获取今日数据
         * @returns {Object} 今日学习数据
         */
        getTodayData: function () {
            this._ensureTodayData();
            return Utils.deepClone(this._dailyData[Utils.getToday()]);
        },

        /**
         * 获取指定日期数据
         * @param {string} date - 日期
         * @returns {Object|null} 当日数据
         */
        getDailyData: function (date) {
            return this._dailyData[date]
                ? Utils.deepClone(this._dailyData[date])
                : null;
        },

        /**
         * 获取日期范围的每日数据
         * @param {string} startDate - 开始日期
         * @param {string} endDate - 结束日期
         * @returns {Array} 数据数组
         */
        getDailyDataRange: function (startDate, endDate) {
            var result = [];
            var current = new Date(startDate);
            var end = new Date(endDate);
            
            while (current <= end) {
                var dateStr = Utils.formatDate(current);
                result.push(this._dailyData[dateStr] || createDailyData(dateStr));
                current.setDate(current.getDate() + 1);
            }
            
            return result;
        },

        /**
         * 获取整体统计
         * @returns {Object} 整体统计数据
         */
        getOverallStats: function () {
            return Utils.deepClone(this._overallStats);
        },

        /**
         * 获取部门掌握度统计
         * @returns {Object} 各部门统计
         */
        getDepartmentStats: function () {
            var deptStats = {};
            
            for (var id in this._questionRecords) {
                if (this._questionRecords.hasOwnProperty(id)) {
                    var record = this._questionRecords[id];
                    var dept = record.department || 'unknown';
                    
                    if (!deptStats[dept]) {
                        deptStats[dept] = {
                            total: 0,
                            answered: 0,
                            correct: 0,
                            mastered: 0,
                            avgMastery: 0,
                            totalMastery: 0
                        };
                    }
                    
                    deptStats[dept].total++;
                    if (record.answerCount > 0) {
                        deptStats[dept].answered++;
                        deptStats[dept].correct += record.correctCount;
                        deptStats[dept].totalMastery += record.masteryLevel;
                        if (record.masteryLevel >= MASTERY_LEVELS) {
                            deptStats[dept].mastered++;
                        }
                    }
                }
            }
            
            // 计算平均掌握度
            for (var dept in deptStats) {
                if (deptStats.hasOwnProperty(dept)) {
                    if (deptStats[dept].answered > 0) {
                        deptStats[dept].avgMastery = deptStats[dept].totalMastery / deptStats[dept].answered;
                    }
                }
            }
            
            return deptStats;
        },

        /**
         * 获取题型统计
         * @returns {Object} 各题型统计
         */
        getQuestionTypeStats: function () {
            var typeStats = {
                judge: { total: 0, correct: 0, name: '判断题' },
                single: { total: 0, correct: 0, name: '单选题' },
                multiple: { total: 0, correct: 0, name: '多选题' }
            };
            
            for (var id in this._questionRecords) {
                if (this._questionRecords.hasOwnProperty(id)) {
                    var record = this._questionRecords[id];
                    var type = record.questionType;
                    if (type && typeStats[type]) {
                        typeStats[type].total += record.answerCount;
                        typeStats[type].correct += record.correctCount;
                    }
                }
            }
            
            return typeStats;
        },

        /**
         * 获取等级信息
         * @returns {Object} 等级信息
         */
        getLevelInfo: function () {
            var level = this._overallStats.level;
            var currentExp = this._overallStats.totalExp;
            var currentLevelExp = LEVEL_EXP[level - 1] || 0;
            var nextLevelExp = LEVEL_EXP[level] || currentExp;
            var expInLevel = currentExp - currentLevelExp;
            var expNeeded = nextLevelExp - currentLevelExp;
            var progress = expNeeded > 0 ? expInLevel / expNeeded : 1;
            
            return {
                level: level,
                currentExp: currentExp,
                currentLevelExp: currentLevelExp,
                nextLevelExp: nextLevelExp,
                expInLevel: expInLevel,
                expNeeded: expNeeded,
                progress: progress,
                isMaxLevel: level >= MAX_LEVEL
            };
        },

        /**
         * 获取每日目标完成情况
         * @param {string} date - 日期
         * @returns {Object} 完成情况
         */
        getDailyGoalProgress: function (date) {
            date = date || Utils.getToday();
            var data = this._dailyData[date] || createDailyData(date);
            var goal = DEFAULT_DAILY_GOAL;
            
            var questionProgress = data.questionCount / goal.questionCount;
            var correctRate = data.questionCount > 0 ? data.correctCount / data.questionCount : 0;
            var timeProgress = data.studyTime / goal.studyTime;
            
            var overall = (questionProgress + correctRate / goal.correctRate + timeProgress) / 3;
            
            return {
                goal: Utils.deepClone(goal),
                actual: {
                    questionCount: data.questionCount,
                    correctRate: correctRate,
                    studyTime: data.studyTime
                },
                progress: {
                    questionCount: Math.min(1, questionProgress),
                    correctRate: Math.min(1, correctRate / goal.correctRate),
                    studyTime: Math.min(1, timeProgress),
                    overall: Math.min(1, overall)
                },
                completed: overall >= 1
            };
        },

        // ---------- 事件系统 ----------

        /**
         * 监听事件
         * @param {string} event - 事件名
         * @param {Function} callback - 回调
         */
        on: function (event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
        },

        /**
         * 触发事件
         */
        _emit: function (event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(function (cb) {
                    try { cb(data); } catch (e) { console.error(e); }
                });
            }
        },

        // ---------- 数据导入导出 ----------

        /**
         * 导出所有数据
         * @returns {string} JSON字符串
         */
        exportData: function () {
            var data = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                questionRecords: this._questionRecords,
                dailyData: this._dailyData,
                overallStats: this._overallStats,
                wrongBook: this._wrongBook,
                favorites: this._favorites,
                notes: this._notes,
                achievements: AchievementManager._achievements || {},
                settings: Utils.getStorage(STORAGE_KEYS.SETTINGS, {})
            };
            return JSON.stringify(data, null, 2);
        },

        /**
         * 导入数据
         * @param {string} jsonData - JSON字符串
         * @param {Object} options - 选项 {merge: boolean}
         * @returns {boolean} 是否成功
         */
        importData: function (jsonData, options) {
            try {
                var data = JSON.parse(jsonData);
                options = options || { merge: false };
                
                if (!options.merge) {
                    // 完全替换
                    this._questionRecords = data.questionRecords || {};
                    this._dailyData = data.dailyData || {};
                    this._overallStats = data.overallStats || createOverallStats();
                    this._wrongBook = data.wrongBook || {};
                    this._favorites = data.favorites || {};
                    this._notes = data.notes || [];
                    if (data.achievements) {
                        AchievementManager._achievements = data.achievements;
                    }
                } else {
                    // 合并数据
                    for (var key in data.questionRecords) {
                        if (data.questionRecords.hasOwnProperty(key)) {
                            this._questionRecords[key] = data.questionRecords[key];
                        }
                    }
                    for (var d in data.dailyData) {
                        if (data.dailyData.hasOwnProperty(d)) {
                            this._dailyData[d] = data.dailyData[d];
                        }
                    }
                    // 整体统计取较大值
                    if (data.overallStats) {
                        this._overallStats.totalQuestions = Math.max(
                            this._overallStats.totalQuestions, data.overallStats.totalQuestions || 0
                        );
                        this._overallStats.totalTime = Math.max(
                            this._overallStats.totalTime, data.overallStats.totalTime || 0
                        );
                        this._overallStats.streakDays = Math.max(
                            this._overallStats.streakDays, data.overallStats.streakDays || 0
                        );
                        this._overallStats.maxStreakDays = Math.max(
                            this._overallStats.maxStreakDays, data.overallStats.maxStreakDays || 0
                        );
                        this._overallStats.totalExp = Math.max(
                            this._overallStats.totalExp, data.overallStats.totalExp || 0
                        );
                    }
                    for (var w in data.wrongBook) {
                        if (data.wrongBook.hasOwnProperty(w)) {
                            this._wrongBook[w] = data.wrongBook[w];
                        }
                    }
                    for (var f in data.favorites) {
                        if (data.favorites.hasOwnProperty(f)) {
                            this._favorites[f] = data.favorites[f];
                        }
                    }
                    if (data.notes && data.notes.length) {
                        this._notes = this._notes.concat(data.notes);
                    }
                }
                
                this._saveAllData();
                Utils.setStorage(STORAGE_KEYS.ACHIEVEMENTS, AchievementManager._achievements);
                
                this._emit('dataImported');
                return true;
            } catch (e) {
                console.error('导入数据失败:', e);
                return false;
            }
        },

        /**
         * 重置所有数据
         * @param {Object} options - 重置选项
         */
        resetData: function (options) {
            options = options || { all: true };
            
            if (options.all || options.questions) {
                this._questionRecords = {};
            }
            if (options.all || options.daily) {
                this._dailyData = {};
            }
            if (options.all || options.overall) {
                this._overallStats = createOverallStats();
            }
            if (options.all || options.wrongBook) {
                this._wrongBook = {};
            }
            if (options.all || options.favorites) {
                this._favorites = {};
            }
            if (options.all || options.notes) {
                this._notes = [];
            }
            if (options.all || options.achievements) {
                AchievementManager.reset();
            }
            
            this._saveAllData();
            this._emit('dataReset', options);
        }
    };

    // 暴露StatsManager
    stats.StatsManager = StatsManager;

} (window));

// ============================================================
//  ProgressCalculator - 进度/掌握度计算
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    var ProgressCalculator = {
        /**
         * 计算题目掌握程度（基于艾宾浩斯遗忘曲线和答题表现）
         * 掌握度 0-5 级
         * @param {Object} record - 题目答题记录
         * @returns {number} 掌握等级 (0-5)
         */
        calculateMastery: function (record) {
            if (!record || record.answerCount === 0) return 0;

            var correctRate = record.correctCount / record.answerCount;
            var answerCount = record.answerCount;
            var streakBonus = Math.min(record.maxStreak / 10, 1);
            var timeFactor = 1;

            // 考虑时间衰减（遗忘曲线）
            if (record.lastAnswerTime) {
                var daysSinceLast = Utils.daysBetween(
                    new Date(record.lastAnswerTime),
                    new Date()
                );
                // 艾宾浩斯遗忘曲线: R = e^(-t/S)
                // S 是记忆强度，与复习次数正相关
                var memoryStrength = 1 + answerCount * 0.5;
                var retention = Math.exp(-daysSinceLast / memoryStrength);
                timeFactor = retention;
            }

            // 综合评分 0-1
            var score = (
                correctRate * 0.4 +
                Math.min(answerCount / 10, 1) * 0.25 +
                streakBonus * 0.2 +
                timeFactor * 0.15
            );

            // 映射到 0-5 级
            var level = Math.floor(score * 6);
            return Math.max(0, Math.min(5, level));
        },

        /**
         * 计算下次复习日期（基于艾宾浩斯遗忘曲线）
         * @param {Object} record - 答题记录
         * @returns {string} 下次复习日期
         */
        calculateNextReview: function (record) {
            if (!record || record.correctCount === 0) {
                return Utils.formatDate(new Date());
            }

            // 根据掌握等级确定复习间隔
            var level = record.masteryLevel || 0;
            var intervals = [1, 2, 4, 7, 15, 30]; // 对应0-5级
            var interval = intervals[Math.min(level, intervals.length - 1)];

            // 如果最近答错了，缩短间隔
            if (record.streakCorrect === 0 && record.wrongCount > 0) {
                interval = Math.max(1, Math.floor(interval / 2));
            }

            var nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + interval);
            return Utils.formatDate(nextDate);
        },

        /**
         * 获取需要复习的题目列表
         * @param {Object} questionRecords - 所有题目记录
         * @param {number} limit - 数量限制
         * @returns {Array} 待复习题目ID列表
         */
        getQuestionsToReview: function (questionRecords, limit) {
            limit = limit || 50;
            var today = new Date();
            var dueList = [];

            for (var id in questionRecords) {
                if (questionRecords.hasOwnProperty(id)) {
                    var record = questionRecords[id];
                    if (record.nextReviewDate) {
                        var nextReview = new Date(record.nextReviewDate);
                        if (nextReview <= today) {
                            var urgency = Math.ceil(
                                (today - nextReview) / (1000 * 60 * 60 * 24)
                            );
                            dueList.push({
                                questionId: id,
                                urgency: urgency,
                                masteryLevel: record.masteryLevel || 0,
                                wrongCount: record.wrongCount || 0
                            });
                        }
                    }
                }
            }

            // 按紧急程度和错误次数排序
            dueList.sort(function (a, b) {
                if (b.urgency !== a.urgency) return b.urgency - a.urgency;
                if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
                return a.masteryLevel - b.masteryLevel;
            });

            return dueList.slice(0, limit);
        },

        /**
         * 计算学习进度百分比
         * @param {number} answered - 已答题数
         * @param {number} total - 总题数
         * @returns {number} 进度百分比 0-100
         */
        calculateProgress: function (answered, total) {
            if (total === 0) return 0;
            return Math.round((answered / total) * 1000) / 10;
        },

        /**
         * 计算预计完成时间
         * @param {number} remaining - 剩余题数
         * @param {number} dailyAvg - 每日平均做题数
         * @returns {number} 预计天数
         */
        estimateDaysToComplete: function (remaining, dailyAvg) {
            if (dailyAvg <= 0) return Infinity;
            return Math.ceil(remaining / dailyAvg);
        },

        /**
         * 计算每日平均做题数
         * @param {Object} dailyData - 每日数据
         * @param {number} days - 统计天数
         * @returns {number} 每日平均
         */
        calculateDailyAverage: function (dailyData, days) {
            days = days || 7;
            var today = new Date();
            var total = 0;
            var count = 0;

            for (var i = 0; i < days; i++) {
                var date = new Date(today);
                date.setDate(date.getDate() - i);
                var dateStr = Utils.formatDate(date);
                if (dailyData[dateStr]) {
                    total += dailyData[dateStr].questionCount;
                }
                count++;
            }

            return count > 0 ? total / count : 0;
        },

        /**
         * 计算周学习数据汇总
         * @param {Object} dailyData - 每日数据
         * @returns {Object} 周汇总
         */
        calculateWeekSummary: function (dailyData) {
            var weekStart = Utils.getWeekStart();
            var today = Utils.getToday();
            var days = Utils.daysBetween(weekStart, today) + 1;
            var totalQuestions = 0;
            var totalCorrect = 0;
            var totalTime = 0;
            var studyDays = 0;

            for (var i = 0; i < days; i++) {
                var date = Utils.daysAgo(today, (days - 1 - i));
                if (dailyData[date]) {
                    totalQuestions += dailyData[date].questionCount;
                    totalCorrect += dailyData[date].correctCount;
                    totalTime += dailyData[date].studyTime;
                    if (dailyData[date].questionCount > 0) studyDays++;
                }
            }

            return {
                days: days,
                studyDays: studyDays,
                totalQuestions: totalQuestions,
                totalCorrect: totalCorrect,
                correctRate: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
                totalTime: totalTime,
                avgPerDay: days > 0 ? totalQuestions / days : 0
            };
        },

        /**
         * 计算月学习数据汇总
         * @param {Object} dailyData - 每日数据
         * @returns {Object} 月汇总
         */
        calculateMonthSummary: function (dailyData) {
            var monthStart = Utils.getMonthStart();
            var today = Utils.getToday();
            var days = Utils.daysBetween(monthStart, today) + 1;
            var totalQuestions = 0;
            var totalCorrect = 0;
            var totalTime = 0;
            var studyDays = 0;

            for (var i = 0; i < days; i++) {
                var date = Utils.daysAgo(today, (days - 1 - i));
                if (dailyData[date]) {
                    totalQuestions += dailyData[date].questionCount;
                    totalCorrect += dailyData[date].correctCount;
                    totalTime += dailyData[date].studyTime;
                    if (dailyData[date].questionCount > 0) studyDays++;
                }
            }

            return {
                days: days,
                studyDays: studyDays,
                totalQuestions: totalQuestions,
                totalCorrect: totalCorrect,
                correctRate: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
                totalTime: totalTime,
                avgPerDay: studyDays > 0 ? totalQuestions / studyDays : 0,
                avgPerCalendarDay: totalQuestions / days
            };
        },

        /**
         * 计算能力维度评分（雷达图用）
         * @param {Object} deptStats - 部门统计
         * @returns {Array} 能力维度数组
         */
        calculateAbilityDimensions: function (deptStats) {
            var dimensions = [];
            var deptNames = Object.keys(deptStats);

            // 取前6个部门作为维度
            var topDepts = deptNames.slice(0, 6);

            topDepts.forEach(function (dept) {
                var stats = deptStats[dept];
                var score = 0;
                if (stats.total > 0) {
                    var completionRate = stats.answered / stats.total;
                    var avgMastery = stats.avgMastery / 5;
                    score = (completionRate * 0.4 + avgMastery * 0.6) * 100;
                }
                dimensions.push({
                    name: dept,
                    score: Math.round(score),
                    fullMark: 100
                });
            });

            return dimensions;
        },

        /**
         * 计算学习热力图数据
         * @param {Object} dailyData - 每日数据
         * @param {number} months - 统计月数
         * @returns {Object} 热力图数据
         */
        calculateHeatmapData: function (dailyData, months) {
            months = months || 12;
            var data = {};
            var today = new Date();
            var maxCount = 0;

            for (var i = 0; i < months * 31; i++) {
                var date = new Date(today);
                date.setDate(date.getDate() - i);
                var dateStr = Utils.formatDate(date);

                if (dailyData[dateStr]) {
                    var count = dailyData[dateStr].questionCount;
                    data[dateStr] = count;
                    if (count > maxCount) maxCount = count;
                } else {
                    data[dateStr] = 0;
                }
            }

            return {
                data: data,
                maxCount: maxCount,
                levels: 5
            };
        },

        /**
         * 计算学习趋势数据
         * @param {Object} dailyData - 每日数据
         * @param {number} days - 天数
         * @returns {Array} 趋势数据
         */
        calculateTrendData: function (dailyData, days) {
            days = days || 30;
            var trend = [];
            var today = new Date();

            for (var i = days - 1; i >= 0; i--) {
                var date = new Date(today);
                date.setDate(date.getDate() - i);
                var dateStr = Utils.formatDate(date);
                var dayData = dailyData[dateStr] || {
                    questionCount: 0,
                    correctCount: 0,
                    studyTime: 0
                };
                trend.push({
                    date: dateStr,
                    questions: dayData.questionCount,
                    correct: dayData.correctCount,
                    wrong: (dayData.questionCount || 0) - (dayData.correctCount || 0),
                    correctRate: dayData.questionCount > 0
                        ? dayData.correctCount / dayData.questionCount
                        : 0,
                    time: dayData.studyTime || 0
                });
            }

            return trend;
        },

        /**
         * 计算掌握度分布
         * @param {Object} questionRecords - 题目记录
         * @returns {Object} 各掌握等级的题目数
         */
        calculateMasteryDistribution: function (questionRecords) {
            var distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

            for (var id in questionRecords) {
                if (questionRecords.hasOwnProperty(id)) {
                    var level = questionRecords[id].masteryLevel || 0;
                    distribution[level]++;
                }
            }

            return distribution;
        },

        /**
         * 计算学习效率
         * @param {Object} dailyData - 每日数据
         * @param {number} days - 天数
         * @returns {Object} 效率数据
         */
        calculateEfficiency: function (dailyData, days) {
            days = days || 7;
            var totalQuestions = 0;
            var totalTime = 0;
            var totalCorrect = 0;
            var today = new Date();

            for (var i = 0; i < days; i++) {
                var date = new Date(today);
                date.setDate(date.getDate() - i);
                var dateStr = Utils.formatDate(date);
                if (dailyData[dateStr]) {
                    totalQuestions += dailyData[dateStr].questionCount;
                    totalTime += dailyData[dateStr].studyTime;
                    totalCorrect += dailyData[dateStr].correctCount;
                }
            }

            var avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
            var correctRate = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

            // 效率评分（综合速度和正确率）
            var speedScore = avgTimePerQuestion > 0 ? Math.min(1, 60 / avgTimePerQuestion) : 0;
            var efficiencyScore = (speedScore * 0.4 + correctRate * 0.6) * 100;

            return {
                avgTimePerQuestion: avgTimePerQuestion,
                correctRate: correctRate,
                efficiencyScore: Math.round(efficiencyScore),
                questionsPerHour: totalTime > 0 ? (totalQuestions / (totalTime / 3600)) : 0,
                totalQuestions: totalQuestions,
                totalTime: totalTime
            };
        },

        /**
         * 计算最佳学习时间段
         * @param {Object} dailyData - 每日数据
         * @returns {Object} 各时段表现
         */
        calculateBestTimeSlots: function (dailyData) {
            // 简化版：基于学习时段分布
            // 实际应用中需要更细粒度的时间数据
            var slots = {
                morning: { count: 0, label: '早晨 6-9' },
                forenoon: { count: 0, label: '上午 9-12' },
                afternoon: { count: 0, label: '下午 12-18' },
                evening: { count: 0, label: '傍晚 18-22' },
                night: { count: 0, label: '深夜 22-6' }
            };

            // 基于firstStudyTime和lastStudyTime估算
            for (var date in dailyData) {
                if (dailyData.hasOwnProperty(date) && dailyData[date].firstStudyTime) {
                    var hour = new Date(dailyData[date].firstStudyTime).getHours();
                    if (hour >= 6 && hour < 9) slots.morning.count++;
                    else if (hour >= 9 && hour < 12) slots.forenoon.count++;
                    else if (hour >= 12 && hour < 18) slots.afternoon.count++;
                    else if (hour >= 18 && hour < 22) slots.evening.count++;
                    else slots.night.count++;
                }
            }

            return slots;
        }
    };

    stats.ProgressCalculator = ProgressCalculator;

} (window.SZ.stats));

// ============================================================
//  ChartRenderer - 图表渲染引擎（原生Canvas实现）
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    // 默认主题色
    var DEFAULT_COLORS = [
        '#4F8EF7', '#52C41A', '#FAAD14', '#F5222D',
        '#722ED1', '#13C2C2', '#EB2F96', '#FA8C16'
    ];

    var ChartRenderer = {
        _defaultColors: DEFAULT_COLORS,

        /**
         * 绘制折线图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         * @param {Array} options.data - 数据数组 [{label, value}]
         * @param {number} options.width - 宽度
         * @param {number} options.height - 高度
         * @param {Object} options.style - 样式配置
         */
        LineChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 400;
            var height = options.height || cvs.clientHeight || 250;
            var ctx = Utils.getContext(cvs, width, height);
            var data = options.data || [];
            var style = options.style || {};

            // 样式配置
            var padding = style.padding || { top: 30, right: 20, bottom: 40, left: 50 };
            var lineColor = style.lineColor || DEFAULT_COLORS[0];
            var fillColor = style.fillColor || Utils.hexToRgba(lineColor, 0.1);
            var dotColor = style.dotColor || lineColor;
            var gridColor = style.gridColor || '#eee';
            var textColor = style.textColor || '#666';
            var axisColor = style.axisColor || '#ddd';
            var showDots = style.showDots !== false;
            var showGrid = style.showGrid !== false;
            var smooth = style.smooth !== false;
            var yAxisLines = style.yAxisLines || 5;

            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            if (data.length === 0) {
                // 空数据提示
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', width / 2, height / 2);
                return;
            }

            // 计算Y轴范围
            var values = data.map(function (d) { return d.value; });
            var maxVal = Utils.max(values);
            var minVal = 0;
            if (maxVal === 0) maxVal = 1;
            // 向上取整到合适的刻度
            var range = maxVal - minVal;
            var step = Math.ceil(range / yAxisLines);
            step = Math.max(1, step);
            maxVal = step * yAxisLines;

            // 绘制网格线
            if (showGrid) {
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 1;
                for (var i = 0; i <= yAxisLines; i++) {
                    var y = padding.top + (chartHeight / yAxisLines) * i;
                    ctx.beginPath();
                    ctx.moveTo(padding.left, y);
                    ctx.lineTo(width - padding.right, y);
                    ctx.stroke();

                    // Y轴刻度文字
                    var label = maxVal - step * i;
                    ctx.fillStyle = textColor;
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, padding.left - 8, y);
                }
            }

            // 绘制X轴
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.stroke();

            // 绘制Y轴
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, height - padding.bottom);
            ctx.stroke();

            // 计算点坐标
            var points = [];
            var stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

            for (var j = 0; j < data.length; j++) {
                var x = padding.left + stepX * j;
                var y = padding.top + chartHeight - (data[j].value - minVal) / (maxVal - minVal) * chartHeight;
                points.push({ x: x, y: y, data: data[j] });
            }

            // 绘制填充区域
            if (fillColor) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, height - padding.bottom);
                for (var k = 0; k < points.length; k++) {
                    if (smooth && k > 0) {
                        var prev = points[k - 1];
                        var curr = points[k];
                        var cpx = (prev.x + curr.x) / 2;
                        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
                        if (k === points.length - 1) {
                            ctx.lineTo(curr.x, curr.y);
                        }
                    } else {
                        ctx.lineTo(points[k].x, points[k].y);
                    }
                }
                ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
                ctx.closePath();
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            // 绘制折线
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            for (var l = 0; l < points.length; l++) {
                if (l === 0) {
                    ctx.moveTo(points[l].x, points[l].y);
                } else if (smooth) {
                    var prevP = points[l - 1];
                    var currP = points[l];
                    var cpx = (prevP.x + currP.x) / 2;
                    ctx.quadraticCurveTo(prevP.x, prevP.y, cpx, (prevP.y + currP.y) / 2);
                    if (l === points.length - 1) {
                        ctx.lineTo(currP.x, currP.y);
                    }
                } else {
                    ctx.lineTo(points[l].x, points[l].y);
                }
            }
            ctx.stroke();

            // 绘制数据点
            if (showDots) {
                for (var m = 0; m < points.length; m++) {
                    ctx.beginPath();
                    ctx.arc(points[m].x, points[m].y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.strokeStyle = dotColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // 绘制X轴标签
            ctx.fillStyle = textColor;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            var labelStep = Math.ceil(data.length / 8); // 最多显示8个标签
            for (var n = 0; n < data.length; n += labelStep) {
                if (data[n].label) {
                    ctx.fillText(data[n].label, points[n].x, height - padding.bottom + 8);
                }
            }

            return {
                points: points,
                getPointAt: function (x) {
                    for (var p = 0; p < points.length; p++) {
                        if (Math.abs(points[p].x - x) < stepX / 2) {
                            return points[p];
                        }
                    }
                    return null;
                }
            };
        },

        /**
         * 绘制柱状图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         */
        BarChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 400;
            var height = options.height || cvs.clientHeight || 250;
            var ctx = Utils.getContext(cvs, width, height);
            var data = options.data || [];
            var style = options.style || {};

            var padding = style.padding || { top: 30, right: 20, bottom: 50, left: 50 };
            var barColor = style.barColor || DEFAULT_COLORS[0];
            var barRadius = style.barRadius || 4;
            var gridColor = style.gridColor || '#eee';
            var textColor = style.textColor || '#666';
            var axisColor = style.axisColor || '#ddd';
            var showGrid = style.showGrid !== false;
            var showValue = style.showValue !== false;
            var yAxisLines = style.yAxisLines || 5;
            var colors = style.colors || null;

            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            if (data.length === 0) {
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', width / 2, height / 2);
                return;
            }

            // 计算Y轴范围
            var values = data.map(function (d) { return d.value; });
            var maxVal = Utils.max(values);
            if (maxVal === 0) maxVal = 1;
            var step = Math.ceil(maxVal / yAxisLines);
            step = Math.max(1, step);
            maxVal = step * yAxisLines;

            // 绘制网格线
            if (showGrid) {
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 1;
                for (var i = 0; i <= yAxisLines; i++) {
                    var y = padding.top + (chartHeight / yAxisLines) * i;
                    ctx.beginPath();
                    ctx.moveTo(padding.left, y);
                    ctx.lineTo(width - padding.right, y);
                    ctx.stroke();

                    var label = maxVal - step * i;
                    ctx.fillStyle = textColor;
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, padding.left - 8, y);
                }
            }

            // 绘制坐标轴
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, height - padding.bottom);
            ctx.stroke();

            // 计算柱子位置
            var barWidth = Math.min(40, chartWidth / data.length * 0.6);
            var barGap = chartWidth / data.length;

            for (var j = 0; j < data.length; j++) {
                var barH = (data[j].value / maxVal) * chartHeight;
                var x = padding.left + barGap * j + (barGap - barWidth) / 2;
                var y = height - padding.bottom - barH;

                var color = colors ? (colors[j % colors.length]) : (data[j].color || barColor);

                // 绘制柱子
                ctx.fillStyle = color;
                Utils.roundRect(ctx, x, y, barWidth, barH, barRadius);
                ctx.fill();

                // 显示数值
                if (showValue) {
                    ctx.fillStyle = textColor;
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(data[j].value, x + barWidth / 2, y - 4);
                }

                // X轴标签
                ctx.fillStyle = textColor;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                var label = data[j].label || '';
                if (label.length > 6) {
                    label = label.slice(0, 5) + '...';
                }
                ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 8);
            }

            return { bars: data };
        },

        /**
         * 绘制饼图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         */
        PieChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 300;
            var height = options.height || cvs.clientHeight || 300;
            var ctx = Utils.getContext(cvs, width, height);
            var data = options.data || [];
            var style = options.style || {};

            var centerX = width / 2;
            var centerY = height / 2;
            var radius = Math.min(width, height) / 2 - 20;
            var doughnutHole = style.doughnut ? radius * 0.6 : 0;
            var colors = style.colors || DEFAULT_COLORS;
            var textColor = style.textColor || '#666';
            var showLabel = style.showLabel !== false;
            var showPercent = style.showPercent !== false;
            var labelLine = style.labelLine !== false;

            var total = data.reduce(function (sum, d) { return sum + d.value; }, 0);

            if (total === 0) {
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', centerX, centerY);
                return;
            }

            var startAngle = -Math.PI / 2; // 从顶部开始
            var segments = [];

            for (var i = 0; i < data.length; i++) {
                var sliceAngle = (data[i].value / total) * Math.PI * 2;
                var endAngle = startAngle + sliceAngle;
                var midAngle = startAngle + sliceAngle / 2;

                segments.push({
                    startAngle: startAngle,
                    endAngle: endAngle,
                    midAngle: midAngle,
                    data: data[i],
                    color: data[i].color || colors[i % colors.length],
                    percent: data[i].value / total
                });

                // 绘制扇形
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = data[i].color || colors[i % colors.length];
                ctx.fill();

                // 描边
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                startAngle = endAngle;
            }

            // 环形图挖空
            if (doughnutHole > 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, doughnutHole, 0, Math.PI * 2);
                ctx.fillStyle = style.holeColor || '#fff';
                ctx.fill();

                // 中心文字
                if (style.centerText) {
                    ctx.fillStyle = textColor;
                    ctx.font = 'bold 24px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(style.centerText.value || total, centerX, centerY - 8);
                    ctx.font = '12px sans-serif';
                    ctx.fillText(style.centerText.label || '总计', centerX, centerY + 14);
                }
            }

            // 绘制标签和引导线
            if (showLabel && labelLine) {
                ctx.font = '11px sans-serif';
                ctx.textBaseline = 'middle';

                for (var j = 0; j < segments.length; j++) {
                    var seg = segments[j];
                    // 标签位置
                    var labelRadius = radius + 10;
                    var lineEndRadius = radius + 25;
                    var labelX = centerX + Math.cos(seg.midAngle) * lineEndRadius;
                    var labelY = centerY + Math.sin(seg.midAngle) * lineEndRadius;
                    var isRight = seg.midAngle > -Math.PI / 2 && seg.midAngle < Math.PI / 2;

                    // 引导线
                    ctx.beginPath();
                    ctx.strokeStyle = seg.color;
                    ctx.lineWidth = 1;
                    var startX = centerX + Math.cos(seg.midAngle) * radius;
                    var startY = centerY + Math.sin(seg.midAngle) * radius;
                    var midX = centerX + Math.cos(seg.midAngle) * labelRadius;
                    var midY = centerY + Math.sin(seg.midAngle) * labelRadius;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(midX, midY);
                    ctx.lineTo(labelX, labelY);
                    ctx.stroke();

                    // 标签文字
                    ctx.fillStyle = textColor;
                    ctx.textAlign = isRight ? 'left' : 'right';
                    var labelText = seg.data.label || '';
                    if (showPercent) {
                        labelText += ' ' + (seg.percent * 100).toFixed(1) + '%';
                    }
                    ctx.fillText(labelText, labelX + (isRight ? 4 : -4), labelY);
                }
            }

            return { segments: segments, total: total };
        },

        /**
         * 绘制环形图（饼图的变体）
         */
        DoughnutChart: function (canvas, options) {
            options = options || {};
            options.style = options.style || {};
            options.style.doughnut = true;
            return this.PieChart(canvas, options);
        },

        /**
         * 绘制雷达图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         */
        RadarChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 300;
            var height = options.height || cvs.clientHeight || 300;
            var ctx = Utils.getContext(cvs, width, height);
            var data = options.data || [];
            var style = options.style || {};

            var centerX = width / 2;
            var centerY = height / 2;
            var radius = Math.min(width, height) / 2 - 50;
            var levels = style.levels || 5;
            var lineColor = style.lineColor || DEFAULT_COLORS[0];
            var fillColor = style.fillColor || Utils.hexToRgba(lineColor, 0.2);
            var gridColor = style.gridColor || '#ddd';
            var textColor = style.textColor || '#666';
            var showDots = style.showDots !== false;

            var count = data.length;
            if (count < 3) {
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('至少需要3个维度', centerX, centerY);
                return;
            }

            var angleStep = (Math.PI * 2) / count;
            var fullMark = data[0].fullMark || 100;

            // 绘制网格（多层多边形）
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            for (var l = 1; l <= levels; l++) {
                var r = (radius / levels) * l;
                ctx.beginPath();
                for (var i = 0; i < count; i++) {
                    var angle = -Math.PI / 2 + angleStep * i;
                    var x = centerX + Math.cos(angle) * r;
                    var y = centerY + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // 绘制轴线
            for (var a = 0; a < count; a++) {
                var angleA = -Math.PI / 2 + angleStep * a;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angleA) * radius,
                    centerY + Math.sin(angleA) * radius
                );
                ctx.strokeStyle = gridColor;
                ctx.stroke();
            }

            // 绘制数据区域
            ctx.beginPath();
            var points = [];
            for (var d = 0; d < count; d++) {
                var angleD = -Math.PI / 2 + angleStep * d;
                var value = data[d].score || data[d].value || 0;
                var r = (value / fullMark) * radius;
                var x = centerX + Math.cos(angleD) * r;
                var y = centerY + Math.sin(angleD) * r;
                points.push({ x: x, y: y, data: data[d] });
                if (d === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制数据点
            if (showDots) {
                for (var p = 0; p < points.length; p++) {
                    ctx.beginPath();
                    ctx.arc(points[p].x, points[p].y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // 绘制维度标签
            ctx.fillStyle = textColor;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (var t = 0; t < count; t++) {
                var angleT = -Math.PI / 2 + angleStep * t;
                var labelR = radius + 20;
                var lx = centerX + Math.cos(angleT) * labelR;
                var ly = centerY + Math.sin(angleT) * labelR;
                ctx.fillText(data[t].name || '', lx, ly);
            }

            return { points: points };
        },

        /**
         * 绘制热力图（类似GitHub贡献图）
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         * @param {Object} options.data - 日期数据 {date: count}
         * @param {number} options.days - 显示天数
         */
        HeatmapChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 600;
            var height = options.height || cvs.clientHeight || 150;
            var ctx = Utils.getContext(cvs, width, height);
            var data = options.data || {};
            var style = options.style || {};

            var cellSize = style.cellSize || 12;
            var cellGap = style.cellGap || 3;
            var levels = style.levels || 5;
            var baseColor = style.baseColor || '#EBEDF0';
            var activeColor = style.activeColor || '#4F8EF7';
            var textColor = style.textColor || '#666';
            var showMonthLabels = style.showMonthLabels !== false;
            var showDayLabels = style.showDayLabels !== false;

            // 计算颜色阶梯
            var colors = [baseColor];
            for (var i = 1; i <= levels; i++) {
                colors.push(Utils.hexToRgba(activeColor, 0.2 + (i / levels) * 0.8));
            }

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            // 计算周数和起始位置
            var totalWeeks = Math.ceil((options.days || 365) / 7);
            var startX = showDayLabels ? 25 : 10;
            var startY = showMonthLabels ? 25 : 10;

            // 找到起始日期（从左到右，从上到下按周排列）
            var startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (totalWeeks * 7 - 1));
            // 调整到周日开始
            var dayOfWeek = startDate.getDay();
            startDate.setDate(startDate.getDate() - dayOfWeek);

            // 绘制热力格子
            var weekIdx = 0;
            var currentDate = new Date(startDate);
            var monthLabels = [];

            while (currentDate <= today && weekIdx < totalWeeks) {
                for (var day = 0; day < 7; day++) {
                    if (currentDate > today) break;

                    var dateStr = Utils.formatDate(currentDate);
                    var count = data[dateStr] || 0;
                    var x = startX + weekIdx * (cellSize + cellGap);
                    var y = startY + day * (cellSize + cellGap);

                    // 确定颜色等级
                    var level = 0;
                    if (count > 0) {
                        var maxCount = options.maxCount || 50;
                        level = Math.min(levels, Math.ceil((count / maxCount) * levels));
                    }

                    ctx.fillStyle = colors[level];
                    Utils.roundRect(ctx, x, y, cellSize, cellSize, 2);
                    ctx.fill();

                    // 记录月份标签位置
                    if (showMonthLabels && currentDate.getDate() <= 7 && day === 0) {
                        monthLabels.push({
                            x: x,
                            month: currentDate.getMonth() + 1 + '月'
                        });
                    }

                    currentDate.setDate(currentDate.getDate() + 1);
                }
                weekIdx++;
            }

            // 绘制月份标签
            if (showMonthLabels) {
                ctx.fillStyle = textColor;
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                var lastMonth = '';
                for (var m = 0; m < monthLabels.length; m++) {
                    if (monthLabels[m].month !== lastMonth) {
                        ctx.fillText(monthLabels[m].month, monthLabels[m].x, startY - 4);
                        lastMonth = monthLabels[m].month;
                    }
                }
            }

            // 绘制星期标签
            if (showDayLabels) {
                ctx.fillStyle = textColor;
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                var dayNames = ['日', '一', '二', '三', '四', '五', '六'];
                for (var d = 1; d < 7; d += 2) {
                    var dy = startY + d * (cellSize + cellGap) + cellSize / 2;
                    ctx.fillText(dayNames[d], startX - 4, dy);
                }
            }

            // 绘制图例
            if (style.showLegend !== false) {
                var legendX = width - 130;
                var legendY = height - 18;
                ctx.fillStyle = textColor;
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('少', legendX - 5, legendY + cellSize / 2);
                
                for (var lg = 0; lg <= levels; lg++) {
                    var lx = legendX + lg * (cellSize + 2);
                    ctx.fillStyle = colors[lg];
                    Utils.roundRect(ctx, lx, legendY, cellSize, cellSize, 2);
                    ctx.fill();
                }
                
                ctx.textAlign = 'left';
                ctx.fillText('多', legendX + (levels + 1) * (cellSize + 2), legendY + cellSize / 2);
            }

            return {
                getCellAt: function (x, y) {
                    // 简化实现
                    return null;
                }
            };
        },

        /**
         * 绘制进度环
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         * @param {number} options.progress - 进度 0-1
         * @param {number} options.size - 尺寸
         */
        ProgressRing: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var size = options.size || options.width || 120;
            var ctx = Utils.getContext(cvs, size, size);
            var progress = Utils.clamp(options.progress || 0, 0, 1);
            var style = options.style || {};

            var centerX = size / 2;
            var centerY = size / 2;
            var lineWidth = style.lineWidth || 10;
            var radius = (size - lineWidth) / 2;
            var trackColor = style.trackColor || '#f0f0f0';
            var progressColor = style.progressColor || DEFAULT_COLORS[0];
            var textColor = style.textColor || '#333';
            var bgColor = style.bgColor || null;
            var showText = style.showText !== false;
            var textFormat = style.textFormat || 'percent'; // percent, value, custom
            var textValue = style.textValue || '';
            var textLabel = style.textLabel || '';
            var startAngle = -Math.PI / 2;
            var counterClockwise = false;
            var animation = style.animation !== false;

            // 绘制背景
            if (bgColor) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + lineWidth / 2, 0, Math.PI * 2);
                ctx.fillStyle = bgColor;
                ctx.fill();
            }

            // 绘制轨道
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = trackColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 绘制进度
            var endAngle = startAngle + Math.PI * 2 * progress;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
            ctx.strokeStyle = progressColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 绘制文字
            if (showText) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                var mainText = '';
                if (textFormat === 'percent') {
                    mainText = Math.round(progress * 100) + '%';
                } else if (textFormat === 'value') {
                    mainText = textValue || progress;
                } else {
                    mainText = textValue;
                }

                if (textLabel) {
                    ctx.fillStyle = textColor;
                    ctx.font = 'bold 22px sans-serif';
                    ctx.fillText(mainText, centerX, centerY - 8);
                    ctx.font = '12px sans-serif';
                    ctx.fillStyle = style.subTextColor || '#999';
                    ctx.fillText(textLabel, centerX, centerY + 14);
                } else {
                    ctx.fillStyle = textColor;
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillText(mainText, centerX, centerY);
                }
            }

            return { progress: progress };
        },

        /**
         * 绘制仪表盘
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         * @param {number} options.value - 当前值
         * @param {number} options.max - 最大值
         */
        GaugeChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var size = options.size || options.width || 200;
            var height = options.height || size * 0.65;
            var ctx = Utils.getContext(cvs, size, height);
            var value = options.value || 0;
            var maxValue = options.max || 100;
            var minValue = options.min || 0;
            var style = options.style || {};

            var centerX = size / 2;
            var centerY = height - 20;
            var radius = Math.min(size, height * 1.5) / 2 - 20;
            var startAngle = Math.PI; // 从左边开始（半圆）
            var endAngle = Math.PI * 2;
            var arcAngle = endAngle - startAngle;

            var trackColor = style.trackColor || '#f0f0f0';
            var progressColor = style.progressColor || DEFAULT_COLORS[0];
            var needleColor = style.needleColor || '#333';
            var textColor = style.textColor || '#333';
            var lineWidth = style.lineWidth || 16;
            var showTicks = style.showTicks !== false;
            var showValue = style.showValue !== false;
            var valueLabel = style.valueLabel || '';
            var ranges = style.ranges || null; // [{min, max, color}]

            var percent = Utils.clamp((value - minValue) / (maxValue - minValue), 0, 1);

            // 绘制轨道
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = trackColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 绘制范围区间
            if (ranges) {
                for (var r = 0; r < ranges.length; r++) {
                    var range = ranges[r];
                    var rangeStart = (range.min - minValue) / (maxValue - minValue);
                    var rangeEnd = (range.max - minValue) / (maxValue - minValue);
                    var rangeStartAngle = startAngle + arcAngle * Utils.clamp(rangeStart, 0, 1);
                    var rangeEndAngle = startAngle + arcAngle * Utils.clamp(rangeEnd, 0, 1);
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, rangeStartAngle, rangeEndAngle);
                    ctx.strokeStyle = range.color;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
            } else {
                // 绘制进度弧
                var valueAngle = startAngle + arcAngle * percent;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
                ctx.strokeStyle = progressColor;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // 绘制刻度
            if (showTicks) {
                var tickCount = 5;
                ctx.fillStyle = '#999';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                for (var t = 0; t <= tickCount; t++) {
                    var tickPercent = t / tickCount;
                    var tickAngle = startAngle + arcAngle * tickPercent;
                    var tickRadius = radius + lineWidth / 2 + 8;
                    var tx = centerX + Math.cos(tickAngle) * tickRadius;
                    var ty = centerY + Math.sin(tickAngle) * tickRadius;
                    var tickValue = Math.round(minValue + (maxValue - minValue) * tickPercent);
                    ctx.fillText(tickValue, tx, ty);
                }
            }

            // 绘制指针
            var needleAngle = startAngle + arcAngle * percent;
            var needleLength = radius - lineWidth / 2 - 5;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(needleAngle);
            
            // 指针主体
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(needleLength, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fillStyle = needleColor;
            ctx.fill();
            
            // 指针中心圆点
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = needleColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            
            ctx.restore();

            // 显示数值
            if (showValue) {
                ctx.fillStyle = textColor;
                ctx.font = 'bold 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(value + valueLabel, centerX, centerY + 10);
                
                if (style.unit) {
                    ctx.font = '12px sans-serif';
                    ctx.fillStyle = '#999';
                    ctx.fillText(style.unit, centerX, centerY + 42);
                }
            }

            return { value: value, percent: percent };
        },

        /**
         * 绘制面积图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         * @param {Array} options.series - 数据系列 [{name, data, color}]
         */
        AreaChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 400;
            var height = options.height || cvs.clientHeight || 250;
            var ctx = Utils.getContext(cvs, width, height);
            var series = options.series || [];
            var labels = options.labels || [];
            var style = options.style || {};

            var padding = style.padding || { top: 30, right: 60, bottom: 40, left: 50 };
            var gridColor = style.gridColor || '#eee';
            var textColor = style.textColor || '#666';
            var axisColor = style.axisColor || '#ddd';
            var showLegend = style.showLegend !== false;
            var yAxisLines = style.yAxisLines || 5;
            var stacked = style.stacked === true;

            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            if (series.length === 0) {
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', width / 2, height / 2);
                return;
            }

            // 计算最大值
            var maxVal = 0;
            if (stacked) {
                for (var i = 0; i < labels.length; i++) {
                    var sum = 0;
                    for (var s = 0; s < series.length; s++) {
                        sum += series[s].data[i] || 0;
                    }
                    maxVal = Math.max(maxVal, sum);
                }
            } else {
                for (var s2 = 0; s2 < series.length; s2++) {
                    var seriesMax = Utils.max(series[s2].data);
                    maxVal = Math.max(maxVal, seriesMax);
                }
            }
            if (maxVal === 0) maxVal = 1;
            var step = Math.ceil(maxVal / yAxisLines);
            step = Math.max(1, step);
            maxVal = step * yAxisLines;

            // 绘制网格
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            for (var g = 0; g <= yAxisLines; g++) {
                var y = padding.top + (chartHeight / yAxisLines) * g;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();

                var label = maxVal - step * g;
                ctx.fillStyle = textColor;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, padding.left - 8, y);
            }

            // 绘制坐标轴
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, height - padding.bottom);
            ctx.stroke();

            var dataLen = labels.length || (series[0] && series[0].data.length) || 0;
            var stepX = dataLen > 1 ? chartWidth / (dataLen - 1) : chartWidth;

            // 堆叠模式下计算基线
            var baseLine = [];
            for (var bl = 0; bl < dataLen; bl++) baseLine.push(0);

            // 绘制各系列
            for (var s3 = 0; s3 < series.length; s3++) {
                var ser = series[s3];
                var color = ser.color || DEFAULT_COLORS[s3 % DEFAULT_COLORS.length];
                var points = [];

                for (var d = 0; d < dataLen; d++) {
                    var val = ser.data[d] || 0;
                    var x = padding.left + stepX * d;
                    var baseY = stacked ? baseLine[d] : 0;
                    var y = padding.top + chartHeight - (val + baseY) / maxVal * chartHeight;
                    points.push({ x: x, y: y });
                    if (stacked) baseLine[d] += val;
                }

                // 填充区域
                ctx.beginPath();
                ctx.moveTo(points[0].x, height - padding.bottom);
                for (var p = 0; p < points.length; p++) {
                    ctx.lineTo(points[p].x, points[p].y);
                }
                ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
                ctx.closePath();
                ctx.fillStyle = Utils.hexToRgba(color, 0.3);
                ctx.fill();

                // 绘制折线
                ctx.beginPath();
                for (var l = 0; l < points.length; l++) {
                    if (l === 0) ctx.moveTo(points[l].x, points[l].y);
                    else ctx.lineTo(points[l].x, points[l].y);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // 绘制X轴标签
            ctx.fillStyle = textColor;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            var labelStep = Math.ceil(dataLen / 8);
            for (var xl = 0; xl < dataLen; xl += labelStep) {
                if (labels[xl]) {
                    ctx.fillText(labels[xl], padding.left + stepX * xl, height - padding.bottom + 8);
                }
            }

            // 绘制图例
            if (showLegend) {
                var legendX = width - padding.right + 10;
                var legendY = padding.top;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                for (var sl = 0; sl < series.length; sl++) {
                    var ly = legendY + sl * 20;
                    var lcolor = series[sl].color || DEFAULT_COLORS[sl % DEFAULT_COLORS.length];
                    ctx.fillStyle = lcolor;
                    ctx.fillRect(legendX, ly - 5, 12, 10);
                    ctx.fillStyle = textColor;
                    ctx.fillText(series[sl].name || '系列' + (sl + 1), legendX + 18, ly);
                }
            }

            return { series: series };
        },

        /**
         * 绘制堆叠柱状图
         * @param {HTMLCanvasElement|string} canvas - Canvas元素或ID
         * @param {Object} options - 配置选项
         */
        StackedBarChart: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 400;
            var height = options.height || cvs.clientHeight || 250;
            var ctx = Utils.getContext(cvs, width, height);
            var series = options.series || [];
            var labels = options.labels || [];
            var style = options.style || {};

            var padding = style.padding || { top: 30, right: 60, bottom: 50, left: 50 };
            var gridColor = style.gridColor || '#eee';
            var textColor = style.textColor || '#666';
            var axisColor = style.axisColor || '#ddd';
            var barRadius = style.barRadius || 2;
            var showLegend = style.showLegend !== false;
            var showValue = style.showValue === true;
            var yAxisLines = style.yAxisLines || 5;

            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            if (series.length === 0 || labels.length === 0) {
                ctx.fillStyle = textColor;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', width / 2, height / 2);
                return;
            }

            // 计算每组总和的最大值
            var maxVal = 0;
            for (var i = 0; i < labels.length; i++) {
                var sum = 0;
                for (var s = 0; s < series.length; s++) {
                    sum += series[s].data[i] || 0;
                }
                maxVal = Math.max(maxVal, sum);
            }
            if (maxVal === 0) maxVal = 1;
            var step = Math.ceil(maxVal / yAxisLines);
            step = Math.max(1, step);
            maxVal = step * yAxisLines;

            // 绘制网格
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            for (var g = 0; g <= yAxisLines; g++) {
                var y = padding.top + (chartHeight / yAxisLines) * g;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();

                var label = maxVal - step * g;
                ctx.fillStyle = textColor;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, padding.left - 8, y);
            }

            // 坐标轴
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, height - padding.bottom);
            ctx.stroke();

            var barWidth = Math.min(50, chartWidth / labels.length * 0.6);
            var barGap = chartWidth / labels.length;

            // 绘制堆叠柱
            for (var i2 = 0; i2 < labels.length; i2++) {
                var x = padding.left + barGap * i2 + (barGap - barWidth) / 2;
                var currentY = height - padding.bottom;
                var totalForBar = 0;

                for (var s2 = 0; s2 < series.length; s2++) {
                    var val = series[s2].data[i2] || 0;
                    totalForBar += val;
                    var barH = (val / maxVal) * chartHeight;
                    var barY = currentY - barH;
                    var color = series[s2].color || DEFAULT_COLORS[s2 % DEFAULT_COLORS.length];

                    ctx.fillStyle = color;
                    
                    // 只有最上层的柱子有圆角顶部
                    var isTop = s2 === series.length - 1 || val > 0 && 
                        (s2 + 1 >= series.length || series[s2 + 1].data[i2] === 0);
                    
                    if (isTop && val > 0) {
                        Utils.roundRect(ctx, x, barY, barWidth, barH, barRadius);
                        ctx.fill();
                    } else if (val > 0) {
                        ctx.fillRect(x, barY, barWidth, barH);
                    }

                    currentY = barY;
                }

                // 显示总数
                if (showValue && totalForBar > 0) {
                    ctx.fillStyle = textColor;
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(totalForBar, x + barWidth / 2, currentY - 4);
                }

                // X轴标签
                ctx.fillStyle = textColor;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                var lbl = labels[i2] || '';
                if (lbl.length > 6) lbl = lbl.slice(0, 5) + '...';
                ctx.fillText(lbl, x + barWidth / 2, height - padding.bottom + 8);
            }

            // 图例
            if (showLegend) {
                var legendX = width - padding.right + 10;
                var legendY = padding.top;
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                for (var sl = 0; sl < series.length; sl++) {
                    var ly = legendY + sl * 20;
                    var lcolor = series[sl].color || DEFAULT_COLORS[sl % DEFAULT_COLORS.length];
                    ctx.fillStyle = lcolor;
                    ctx.fillRect(legendX, ly - 5, 12, 10);
                    ctx.fillStyle = textColor;
                    ctx.fillText(series[sl].name || '系列' + (sl + 1), legendX + 18, ly);
                }
            }

            return { series: series, labels: labels };
        }
    };

    stats.ChartRenderer = ChartRenderer;

} (window.SZ.stats));

// ============================================================
//  AchievementManager - 成就管理系统
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    var ACHIEVEMENT_STORAGE_KEY = 'sz_achievements';

    // 成就定义
    var ACHIEVEMENT_DEFS = [
        // ---- 做题数量 ----
        {
            id: 'first_question',
            name: '初来乍到',
            description: '完成第1道题目',
            icon: '🎯',
            category: 'progress',
            rarity: 'common',
            expReward: 50,
            check: function (stats) {
                return stats.overall.totalQuestions >= 1;
            }
        },
        {
            id: 'ten_questions',
            name: '小试牛刀',
            description: '累计完成10道题目',
            icon: '⚔️',
            category: 'progress',
            rarity: 'common',
            expReward: 80,
            check: function (stats) {
                return stats.overall.totalQuestions >= 10;
            }
        },
        {
            id: 'hundred_questions',
            name: '勤学苦练',
            description: '累计完成100道题目',
            icon: '📚',
            category: 'progress',
            rarity: 'rare',
            expReward: 150,
            check: function (stats) {
                return stats.overall.totalQuestions >= 100;
            }
        },
        {
            id: 'five_hundred_questions',
            name: '题霸',
            description: '累计完成500道题目',
            icon: '👑',
            category: 'progress',
            rarity: 'epic',
            expReward: 300,
            check: function (stats) {
                return stats.overall.totalQuestions >= 500;
            }
        },
        {
            id: 'thousand_questions',
            name: '千题斩',
            description: '累计完成1000道题目',
            icon: '🏆',
            category: 'progress',
            rarity: 'legendary',
            expReward: 500,
            check: function (stats) {
                return stats.overall.totalQuestions >= 1000;
            }
        },
        {
            id: 'all_questions',
            name: '题库征服者',
            description: '完成全部题目',
            icon: '🏅',
            category: 'progress',
            rarity: 'legendary',
            expReward: 1000,
            check: function (stats) {
                // 需要外部传入totalQuestionCount
                return stats.totalQuestionCount > 0 &&
                    stats.overall.totalQuestions >= stats.totalQuestionCount;
            }
        },

        // ---- 连续答对 ----
        {
            id: 'combo_10',
            name: '完美主义',
            description: '连续答对10道题',
            icon: '✨',
            category: 'combo',
            rarity: 'rare',
            expReward: 100,
            check: function (stats) {
                return stats.overall.maxCombo >= 10;
            }
        },
        {
            id: 'combo_20',
            name: '连击大师',
            description: '连续答对20道题',
            icon: '🔥',
            category: 'combo',
            rarity: 'epic',
            expReward: 200,
            check: function (stats) {
                return stats.overall.maxCombo >= 20;
            }
        },
        {
            id: 'combo_50',
            name: '不败传说',
            description: '连续答对50道题',
            icon: '💎',
            category: 'combo',
            rarity: 'legendary',
            expReward: 500,
            check: function (stats) {
                return stats.overall.maxCombo >= 50;
            }
        },
        {
            id: 'combo_100',
            name: '神话连击',
            description: '连续答对100道题',
            icon: '🌟',
            category: 'combo',
            rarity: 'mythic',
            expReward: 1000,
            check: function (stats) {
                return stats.overall.maxCombo >= 100;
            }
        },

        // ---- 错题相关 ----
        {
            id: 'wrong_review_10',
            name: '错题克星',
            description: '复习错题累计10道',
            icon: '📝',
            category: 'review',
            rarity: 'common',
            expReward: 80,
            check: function (stats) {
                return stats.overall.reviewWrongCount >= 10;
            }
        },
        {
            id: 'wrong_review_50',
            name: '查漏补缺',
            description: '复习错题累计50道',
            icon: '🔍',
            category: 'review',
            rarity: 'rare',
            expReward: 150,
            check: function (stats) {
                return stats.overall.reviewWrongCount >= 50;
            }
        },
        {
            id: 'wrong_review_100',
            name: '错题终结者',
            description: '复习错题累计100道',
            icon: '💪',
            category: 'review',
            rarity: 'epic',
            expReward: 300,
            check: function (stats) {
                return stats.overall.reviewWrongCount >= 100;
            }
        },

        // ---- 连续学习 ----
        {
            id: 'streak_3',
            name: '三日萌新',
            description: '连续学习3天',
            icon: '🌱',
            category: 'streak',
            rarity: 'common',
            expReward: 60,
            check: function (stats) {
                return stats.overall.streakDays >= 3;
            }
        },
        {
            id: 'streak_7',
            name: '七日坚持',
            description: '连续学习7天',
            icon: '🌿',
            category: 'streak',
            rarity: 'rare',
            expReward: 120,
            check: function (stats) {
                return stats.overall.streakDays >= 7;
            }
        },
        {
            id: 'streak_15',
            name: '半月坚守',
            description: '连续学习15天',
            icon: '🌳',
            category: 'streak',
            rarity: 'rare',
            expReward: 200,
            check: function (stats) {
                return stats.overall.streakDays >= 15;
            }
        },
        {
            id: 'streak_30',
            name: '月度达人',
            description: '连续学习30天',
            icon: '🏔️',
            category: 'streak',
            rarity: 'epic',
            expReward: 400,
            check: function (stats) {
                return stats.overall.streakDays >= 30;
            }
        },
        {
            id: 'streak_100',
            name: '百日学霸',
            description: '连续学习100天',
            icon: '🏛️',
            category: 'streak',
            rarity: 'legendary',
            expReward: 800,
            check: function (stats) {
                return stats.overall.streakDays >= 100;
            }
        },
        {
            id: 'streak_max_365',
            name: '年度传奇',
            description: '最大连续学习天数达到365天',
            icon: '🗿',
            category: 'streak',
            rarity: 'mythic',
            expReward: 2000,
            check: function (stats) {
                return stats.overall.maxStreakDays >= 365;
            }
        },

        // ---- 学习时段 ----
        {
            id: 'early_bird',
            name: '早起鸟',
            description: '在早上6-8点学习',
            icon: '🐦',
            category: 'time',
            rarity: 'rare',
            expReward: 80,
            check: function (stats) {
                return stats.timeSlotStats && stats.timeSlotStats.morning === true;
            }
        },
        {
            id: 'night_owl',
            name: '夜猫子',
            description: '在晚上10-12点学习',
            icon: '🦉',
            category: 'time',
            rarity: 'rare',
            expReward: 80,
            check: function (stats) {
                return stats.timeSlotStats && stats.timeSlotStats.night === true;
            }
        },

        // ---- 模式相关 ----
        {
            id: 'speed_star',
            name: '速度之星',
            description: '快答模式获得满分',
            icon: '⚡',
            category: 'mode',
            rarity: 'epic',
            expReward: 200,
            check: function (stats) {
                return stats.modeStats && stats.modeStats.speedPerfect === true;
            }
        },
        {
            id: 'memory_master',
            name: '记忆大师',
            description: '闪卡模式连续全对10次',
            icon: '🧠',
            category: 'mode',
            rarity: 'epic',
            expReward: 250,
            check: function (stats) {
                return stats.modeStats && stats.modeStats.flashcardPerfect >= 10;
            }
        },
        {
            id: 'game_master',
            name: '游戏高手',
            description: '游戏模式通关',
            icon: '🎮',
            category: 'mode',
            rarity: 'epic',
            expReward: 300,
            check: function (stats) {
                return stats.modeStats && stats.modeStats.gameClear === true;
            }
        },

        // ---- 掌握度 ----
        {
            id: 'dept_master',
            name: '部门精通',
            description: '某个部门全部掌握',
            icon: '🎓',
            category: 'mastery',
            rarity: 'epic',
            expReward: 300,
            check: function (stats) {
                if (!stats.deptStats) return false;
                for (var dept in stats.deptStats) {
                    if (stats.deptStats.hasOwnProperty(dept)) {
                        var d = stats.deptStats[dept];
                        if (d.total > 0 && d.mastered >= d.total) return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'all_dept_master',
            name: '全部门精通',
            description: '所有部门全部掌握',
            icon: '🏆',
            category: 'mastery',
            rarity: 'legendary',
            expReward: 800,
            check: function (stats) {
                if (!stats.deptStats) return false;
                var depts = Object.keys(stats.deptStats);
                if (depts.length === 0) return false;
                for (var i = 0; i < depts.length; i++) {
                    var d = stats.deptStats[depts[i]];
                    if (d.total === 0 || d.mastered < d.total) return false;
                }
                return true;
            }
        },

        // ---- 收藏/笔记 ----
        {
            id: 'collector_10',
            name: '收藏新手',
            description: '收藏10道题',
            icon: '⭐',
            category: 'collect',
            rarity: 'common',
            expReward: 50,
            check: function (stats) {
                return stats.favoriteCount >= 10;
            }
        },
        {
            id: 'collector_50',
            name: '收藏家',
            description: '收藏50道题',
            icon: '💫',
            category: 'collect',
            rarity: 'rare',
            expReward: 150,
            check: function (stats) {
                return stats.favoriteCount >= 50;
            }
        },
        {
            id: 'note_taker_10',
            name: '笔记初学者',
            description: '记录10条笔记',
            icon: '📒',
            category: 'collect',
            rarity: 'common',
            expReward: 50,
            check: function (stats) {
                return stats.noteCount >= 10;
            }
        },
        {
            id: 'note_master',
            name: '笔记达人',
            description: '记录20条笔记',
            icon: '📖',
            category: 'collect',
            rarity: 'rare',
            expReward: 150,
            check: function (stats) {
                return stats.noteCount >= 20;
            }
        },

        // ---- 等级/探索 ----
        {
            id: 'explorer',
            name: '探索者',
            description: '解锁彩蛋模式',
            icon: '🥚',
            category: 'special',
            rarity: 'epic',
            expReward: 200,
            check: function (stats) {
                return stats.specialStats && stats.specialStats.easterEgg === true;
            }
        },
        {
            id: 'skin_collector',
            name: '皮肤收藏家',
            description: '使用10种不同皮肤',
            icon: '🎨',
            category: 'special',
            rarity: 'rare',
            expReward: 150,
            check: function (stats) {
                return stats.skinCount >= 10;
            }
        },
        {
            id: 'level_max',
            name: '传说级玩家',
            description: '达到最高等级',
            icon: '👑',
            category: 'level',
            rarity: 'mythic',
            expReward: 2000,
            check: function (stats) {
                return stats.overall.level >= 100;
            }
        },
        {
            id: 'level_10',
            name: '初出茅庐',
            description: '达到10级',
            icon: '⭐',
            category: 'level',
            rarity: 'common',
            expReward: 100,
            check: function (stats) {
                return stats.overall.level >= 10;
            }
        },
        {
            id: 'level_30',
            name: '渐入佳境',
            description: '达到30级',
            icon: '🌟',
            category: 'level',
            rarity: 'rare',
            expReward: 200,
            check: function (stats) {
                return stats.overall.level >= 30;
            }
        },
        {
            id: 'level_50',
            name: '炉火纯青',
            description: '达到50级',
            icon: '💫',
            category: 'level',
            rarity: 'epic',
            expReward: 400,
            check: function (stats) {
                return stats.overall.level >= 50;
            }
        },
        {
            id: 'study_time_10h',
            name: '十小时',
            description: '累计学习10小时',
            icon: '⏰',
            category: 'time',
            rarity: 'common',
            expReward: 100,
            check: function (stats) {
                return stats.overall.totalTime >= 36000;
            }
        },
        {
            id: 'study_time_100h',
            name: '百小时',
            description: '累计学习100小时',
            icon: '⌛',
            category: 'time',
            rarity: 'epic',
            expReward: 500,
            check: function (stats) {
                return stats.overall.totalTime >= 360000;
            }
        }
    ];

    // 稀有度配置
    var RARITY_CONFIG = {
        common: { name: '普通', color: '#9CA3AF', order: 1 },
        rare: { name: '稀有', color: '#3B82F6', order: 2 },
        epic: { name: '史诗', color: '#8B5CF6', order: 3 },
        legendary: { name: '传说', color: '#F59E0B', order: 4 },
        mythic: { name: '神话', color: '#EF4444', order: 5 }
    };

    var AchievementManager = {
        _achievements: {},          // 已解锁成就 {id: {unlockedDate, ...}}
        _listeners: [],
        _definitions: ACHIEVEMENT_DEFS,

        /**
         * 初始化成就管理器
         */
        init: function () {
            this._achievements = Utils.getStorage(ACHIEVEMENT_STORAGE_KEY, {});
        },

        /**
         * 保存成就数据
         */
        _save: function () {
            Utils.setStorage(ACHIEVEMENT_STORAGE_KEY, this._achievements);
        },

        /**
         * 检查所有成就
         * @returns {Array} 新解锁的成就列表
         */
        checkAll: function () {
            var StatsManager = stats.StatsManager;
            var newlyUnlocked = [];

            // 收集统计数据
            var overallStats = StatsManager.getOverallStats();
            var deptStats = StatsManager.getDepartmentStats();
            var favoriteCount = StatsManager.getFavoriteCount();
            var noteCount = StatsManager.getNoteCount();
            var timeSlotStats = this._checkTimeSlots(StatsManager);
            var modeStats = this._getModeStats();
            var skinCount = this._getSkinCount();
            var specialStats = this._getSpecialStats();
            var totalQuestionCount = this._totalQuestionCount || 0;

            var checkStats = {
                overall: overallStats,
                deptStats: deptStats,
                favoriteCount: favoriteCount,
                noteCount: noteCount,
                timeSlotStats: timeSlotStats,
                modeStats: modeStats,
                skinCount: skinCount,
                specialStats: specialStats,
                totalQuestionCount: totalQuestionCount
            };

            for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                var def = ACHIEVEMENT_DEFS[i];
                if (!this._achievements[def.id]) {
                    try {
                        if (def.check(checkStats)) {
                            this._unlock(def);
                            newlyUnlocked.push(def);
                        }
                    } catch (e) {
                        console.warn('检查成就失败:', def.id, e);
                    }
                }
            }

            return newlyUnlocked;
        },

        /**
         * 检查特定成就
         * @param {string} achievementId - 成就ID
         * @returns {boolean} 是否满足条件
         */
        check: function (achievementId) {
            var def = this.getDefinition(achievementId);
            if (!def) return false;
            if (this._achievements[achievementId]) return true;

            var StatsManager = stats.StatsManager;
            var checkStats = {
                overall: StatsManager.getOverallStats(),
                deptStats: StatsManager.getDepartmentStats(),
                favoriteCount: StatsManager.getFavoriteCount(),
                noteCount: StatsManager.getNoteCount(),
                timeSlotStats: this._checkTimeSlots(StatsManager),
                modeStats: this._getModeStats(),
                skinCount: this._getSkinCount(),
                specialStats: this._getSpecialStats(),
                totalQuestionCount: this._totalQuestionCount || 0
            };

            try {
                if (def.check(checkStats)) {
                    this._unlock(def);
                    return true;
                }
            } catch (e) {
                console.warn('检查成就失败:', achievementId, e);
            }
            return false;
        },

        /**
         * 解锁成就
         */
        _unlock: function (def) {
            this._achievements[def.id] = {
                id: def.id,
                unlockedDate: new Date().toISOString(),
                expReward: def.expReward
            };
            this._save();

            // 奖励经验
            if (def.expReward && stats.StatsManager) {
                stats.StatsManager._addExp(def.expReward);
            }

            // 触发事件
            this._emit('achievementUnlocked', {
                achievement: def,
                unlockedDate: this._achievements[def.id].unlockedDate
            });
        },

        /**
         * 设置总题目数（用于"题库征服者"成就判断）
         * @param {number} count - 总题数
         */
        setTotalQuestionCount: function (count) {
            this._totalQuestionCount = count;
        },

        /**
         * 记录模式统计
         * @param {string} mode - 模式名
         * @param {Object} data - 数据
         */
        recordModeStat: function (mode, data) {
            var key = 'sz_mode_stats_' + mode;
            var stats = Utils.getStorage(key, {});
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    stats[prop] = data[prop];
                }
            }
            Utils.setStorage(key, stats);
        },

        /**
         * 记录皮肤使用
         * @param {string} skinId - 皮肤ID
         */
        recordSkinUsage: function (skinId) {
            var skins = Utils.getStorage('sz_skins_used', []);
            if (skins.indexOf(skinId) === -1) {
                skins.push(skinId);
                Utils.setStorage('sz_skins_used', skins);
            }
        },

        /**
         * 触发特殊成就
         * @param {string} flag - 特殊标记
         */
        triggerSpecial: function (flag) {
            var special = Utils.getStorage('sz_special_stats', {});
            special[flag] = true;
            Utils.setStorage('sz_special_stats', special);
            this.checkAll();
        },

        _getModeStats: function () {
            return {
                speedPerfect: Utils.getStorage('sz_mode_stats_speed', {}).perfect || false,
                flashcardPerfect: Utils.getStorage('sz_mode_stats_flashcard', {}).perfectCount || 0,
                gameClear: Utils.getStorage('sz_mode_stats_game', {}).cleared || false
            };
        },

        _getSkinCount: function () {
            return Utils.getStorage('sz_skins_used', []).length;
        },

        _getSpecialStats: function () {
            return Utils.getStorage('sz_special_stats', {});
        },

        _checkTimeSlots: function (StatsManager) {
            var todayData = StatsManager.getTodayData();
            var result = {
                morning: false,  // 6-8点
                night: false     // 22-24点
            };

            // 检查今日首次学习时间
            if (todayData.firstStudyTime) {
                var hour = new Date(todayData.firstStudyTime).getHours();
                if (hour >= 6 && hour < 8) result.morning = true;
            }
            if (todayData.lastStudyTime) {
                var lastHour = new Date(todayData.lastStudyTime).getHours();
                if (lastHour >= 22 || lastHour < 1) result.night = true;
            }

            // 如果历史上达成过，也算
            var history = Utils.getStorage('sz_timeslot_achievements', {});
            if (result.morning) history.morning = true;
            if (result.night) history.night = true;
            Utils.setStorage('sz_timeslot_achievements', history);

            return {
                morning: history.morning || result.morning,
                night: history.night || result.night
            };
        },

        /**
         * 获取所有成就定义
         * @returns {Array} 成就定义列表
         */
        getAllDefinitions: function () {
            return Utils.deepClone(ACHIEVEMENT_DEFS);
        },

        /**
         * 获取成就定义
         * @param {string} id - 成就ID
         * @returns {Object|null} 成就定义
         */
        getDefinition: function (id) {
            for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                if (ACHIEVEMENT_DEFS[i].id === id) {
                    return ACHIEVEMENT_DEFS[i];
                }
            }
            return null;
        },

        /**
         * 获取已解锁成就列表
         * @returns {Array} 已解锁成就
         */
        getUnlocked: function () {
            var unlocked = [];
            for (var id in this._achievements) {
                if (this._achievements.hasOwnProperty(id)) {
                    var def = this.getDefinition(id);
                    if (def) {
                        unlocked.push({
                            ...def,
                            unlockedDate: this._achievements[id].unlockedDate
                        });
                    }
                }
            }
            return unlocked;
        },

        /**
         * 获取成就进度（所有成就的解锁状态）
         * @returns {Object} 成就进度
         */
        getProgress: function () {
            var total = ACHIEVEMENT_DEFS.length;
            var unlocked = Object.keys(this._achievements).length;

            // 按分类统计
            var byCategory = {};
            var byRarity = {};

            for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                var def = ACHIEVEMENT_DEFS[i];
                var isUnlocked = !!this._achievements[def.id];

                if (!byCategory[def.category]) {
                    byCategory[def.category] = { total: 0, unlocked: 0 };
                }
                byCategory[def.category].total++;
                if (isUnlocked) byCategory[def.category].unlocked++;

                if (!byRarity[def.rarity]) {
                    byRarity[def.rarity] = { total: 0, unlocked: 0 };
                }
                byRarity[def.rarity].total++;
                if (isUnlocked) byRarity[def.rarity].unlocked++;
            }

            return {
                total: total,
                unlocked: unlocked,
                locked: total - unlocked,
                percent: total > 0 ? Math.round(unlocked / total * 1000) / 10 : 0,
                byCategory: byCategory,
                byRarity: byRarity,
                rarityConfig: RARITY_CONFIG
            };
        },

        /**
         * 检查是否已解锁某成就
         * @param {string} id - 成就ID
         * @returns {boolean} 是否已解锁
         */
        isUnlocked: function (id) {
            return !!this._achievements[id];
        },

        /**
         * 按分类获取成就
         * @param {string} category - 分类
         * @returns {Array} 成就列表
         */
        getByCategory: function (category) {
            var result = [];
            for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                if (ACHIEVEMENT_DEFS[i].category === category) {
                    result.push({
                        ...ACHIEVEMENT_DEFS[i],
                        unlocked: !!this._achievements[ACHIEVEMENT_DEFS[i].id],
                        unlockedDate: this._achievements[ACHIEVEMENT_DEFS[i].id]
                            ? this._achievements[ACHIEVEMENT_DEFS[i].id].unlockedDate
                            : null
                    });
                }
            }
            return result;
        },

        /**
         * 获取最近解锁的成就
         * @param {number} limit - 数量
         * @returns {Array} 成就列表
         */
        getRecent: function (limit) {
            limit = limit || 5;
            var unlocked = this.getUnlocked();
            unlocked.sort(function (a, b) {
                return new Date(b.unlockedDate) - new Date(a.unlockedDate);
            });
            return unlocked.slice(0, limit);
        },

        /**
         * 获取稀有度配置
         * @returns {Object} 稀有度配置
         */
        getRarityConfig: function () {
            return RARITY_CONFIG;
        },

        /**
         * 重置所有成就
         */
        reset: function () {
            this._achievements = {};
            this._save();
        },

        // ---------- 事件 ----------
        on: function (event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
        },

        _emit: function (event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(function (cb) {
                    try { cb(data); } catch (e) { console.error(e); }
                });
            }
        }
    };

    stats.AchievementManager = AchievementManager;

} (window.SZ.stats));

// ============================================================
//  ReportGenerator - 学习报告生成
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    var ReportGenerator = {
        /**
         * 生成日报
         * @param {string} date - 日期
         * @returns {Object} 日报数据
         */
        generateDailyReport: function (date) {
            date = date || Utils.getToday();
            var StatsManager = stats.StatsManager;
            var ProgressCalculator = stats.ProgressCalculator;
            var AchievementManager = stats.AchievementManager;

            var dailyData = StatsManager.getDailyData(date);
            if (!dailyData) {
                dailyData = {
                    date: date,
                    questionCount: 0,
                    correctCount: 0,
                    wrongCount: 0,
                    studyTime: 0,
                    knowledgePoints: [],
                    departments: {},
                    questionTypes: {}
                };
            }

            var overall = StatsManager.getOverallStats();
            var goalProgress = StatsManager.getDailyGoalProgress(date);
            var levelInfo = StatsManager.getLevelInfo();

            // 昨日对比
            var yesterday = Utils.daysAgo(date, 1);
            var yesterdayData = StatsManager.getDailyData(yesterday);
            var comparison = {
                questions: 0,
                correctRate: 0,
                time: 0
            };
            if (yesterdayData) {
                comparison.questions = dailyData.questionCount - yesterdayData.questionCount;
                var todayRate = dailyData.questionCount > 0 ? dailyData.correctCount / dailyData.questionCount : 0;
                var yestRate = yesterdayData.questionCount > 0 ? yesterdayData.correctCount / yesterdayData.questionCount : 0;
                comparison.correctRate = Math.round((todayRate - yestRate) * 1000) / 10;
                comparison.time = dailyData.studyTime - yesterdayData.studyTime;
            }

            // 部门排名
            var deptRanking = [];
            for (var dept in dailyData.departments) {
                if (dailyData.departments.hasOwnProperty(dept)) {
                    deptRanking.push({
                        name: dept,
                        total: dailyData.departments[dept].total,
                        correct: dailyData.departments[dept].correct,
                        rate: dailyData.departments[dept].total > 0
                            ? dailyData.departments[dept].correct / dailyData.departments[dept].total
                            : 0
                    });
                }
            }
            deptRanking.sort(function (a, b) { return b.total - a.total; });

            // 题型统计
            var typeStats = dailyData.questionTypes || {};

            // 今日成就
            var todayAchievements = [];
            var unlocked = AchievementManager.getUnlocked();
            for (var i = 0; i < unlocked.length; i++) {
                var unlockDate = Utils.formatDate(unlocked[i].unlockedDate);
                if (unlockDate === date) {
                    todayAchievements.push(unlocked[i]);
                }
            }

            return {
                type: 'daily',
                date: date,
                summary: {
                    questionCount: dailyData.questionCount,
                    correctCount: dailyData.correctCount,
                    wrongCount: dailyData.wrongCount,
                    correctRate: dailyData.questionCount > 0
                        ? Math.round(dailyData.correctCount / dailyData.questionCount * 1000) / 10
                        : 0,
                    studyTime: dailyData.studyTime,
                    studyTimeFormatted: Utils.formatDuration(dailyData.studyTime),
                    knowledgePointsCount: dailyData.knowledgePoints.length,
                    sessions: dailyData.sessions || 0,
                    expGained: dailyData.expGained || 0
                },
                goalProgress: goalProgress,
                comparison: comparison,
                deptRanking: deptRanking,
                typeStats: typeStats,
                achievements: todayAchievements,
                levelInfo: {
                    level: levelInfo.level,
                    expGained: dailyData.expGained || 0,
                    progress: levelInfo.progress
                },
                streak: {
                    current: overall.streakDays,
                    max: overall.maxStreakDays
                }
            };
        },

        /**
         * 生成周报
         * @param {string} endDate - 结束日期
         * @returns {Object} 周报数据
         */
        generateWeeklyReport: function (endDate) {
            endDate = endDate || Utils.getToday();
            var StatsManager = stats.StatsManager;
            var ProgressCalculator = stats.ProgressCalculator;
            var AchievementManager = stats.AchievementManager;

            var weekStart = Utils.getWeekStart();
            var days = Utils.daysBetween(weekStart, endDate) + 1;

            // 获取本周每日数据
            var dailyList = [];
            var totalQuestions = 0;
            var totalCorrect = 0;
            var totalTime = 0;
            var studyDays = 0;
            var allDepts = {};
            var allTypes = {
                judge: { total: 0, correct: 0 },
                single: { total: 0, correct: 0 },
                multiple: { total: 0, correct: 0 }
            };

            for (var i = 0; i < days; i++) {
                var date = Utils.daysAgo(endDate, days - 1 - i);
                var data = StatsManager.getDailyData(date);
                if (!data) {
                    data = { date: date, questionCount: 0, correctCount: 0, studyTime: 0 };
                }
                dailyList.push(data);

                totalQuestions += data.questionCount;
                totalCorrect += data.correctCount;
                totalTime += data.studyTime;
                if (data.questionCount > 0) studyDays++;

                // 合并部门统计
                if (data.departments) {
                    for (var dept in data.departments) {
                        if (data.departments.hasOwnProperty(dept)) {
                            if (!allDepts[dept]) {
                                allDepts[dept] = { total: 0, correct: 0 };
                            }
                            allDepts[dept].total += data.departments[dept].total;
                            allDepts[dept].correct += data.departments[dept].correct;
                        }
                    }
                }

                // 合并题型统计
                if (data.questionTypes) {
                    for (var type in data.questionTypes) {
                        if (data.questionTypes.hasOwnProperty(type) && allTypes[type]) {
                            allTypes[type].total += data.questionTypes[type].total;
                            allTypes[type].correct += data.questionTypes[type].correct;
                        }
                    }
                }
            }

            // 上周对比
            var lastWeekQuestions = 0;
            var lastWeekCorrect = 0;
            var lastWeekTime = 0;
            for (var j = 0; j < 7; j++) {
                var lwDate = Utils.daysAgo(weekStart, 7 - j);
                var lwData = StatsManager.getDailyData(lwDate);
                if (lwData) {
                    lastWeekQuestions += lwData.questionCount;
                    lastWeekCorrect += lwData.correctCount;
                    lastWeekTime += lwData.studyTime;
                }
            }

            var avgPerDay = studyDays > 0 ? totalQuestions / studyDays : 0;
            var correctRate = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
            var lastCorrectRate = lastWeekQuestions > 0 ? lastWeekCorrect / lastWeekQuestions : 0;

            // 部门排名
            var deptRanking = [];
            for (var d in allDepts) {
                if (allDepts.hasOwnProperty(d)) {
                    deptRanking.push({
                        name: d,
                        total: allDepts[d].total,
                        correct: allDepts[d].correct,
                        rate: allDepts[d].total > 0 ? allDepts[d].correct / allDepts[d].total : 0
                    });
                }
            }
            deptRanking.sort(function (a, b) { return b.total - a.total; });

            // 本周成就
            var weekAchievements = [];
            var unlocked = AchievementManager.getUnlocked();
            for (var a = 0; a < unlocked.length; a++) {
                var unlockDate = Utils.formatDate(unlocked[a].unlockedDate);
                if (Utils.daysBetween(weekStart, unlockDate) >= 0 &&
                    Utils.daysBetween(unlockDate, endDate) >= 0) {
                    weekAchievements.push(unlocked[a]);
                }
            }

            // 每日趋势数据（用于图表）
            var trendData = dailyList.map(function (d) {
                return {
                    date: d.date,
                    label: d.date.slice(5), // MM-DD
                    questions: d.questionCount,
                    correct: d.correctCount
                };
            });

            var overall = StatsManager.getOverallStats();

            return {
                type: 'weekly',
                startDate: weekStart,
                endDate: endDate,
                days: days,
                summary: {
                    totalQuestions: totalQuestions,
                    totalCorrect: totalCorrect,
                    correctRate: Math.round(correctRate * 1000) / 10,
                    totalTime: totalTime,
                    totalTimeFormatted: Utils.formatDuration(totalTime),
                    studyDays: studyDays,
                    avgPerDay: Math.round(avgPerDay * 10) / 10,
                    avgTimePerDay: studyDays > 0 ? Math.round(totalTime / studyDays) : 0
                },
                comparison: {
                    questions: totalQuestions - lastWeekQuestions,
                    questionsPercent: lastWeekQuestions > 0
                        ? Math.round((totalQuestions - lastWeekQuestions) / lastWeekQuestions * 100)
                        : 0,
                    correctRate: Math.round((correctRate - lastCorrectRate) * 1000) / 10,
                    time: totalTime - lastWeekTime
                },
                dailyList: dailyList,
                trendData: trendData,
                deptRanking: deptRanking,
                typeStats: allTypes,
                achievements: weekAchievements,
                streak: {
                    current: overall.streakDays,
                    max: overall.maxStreakDays
                },
                // 评分
                score: this._calculateWeekScore({
                    studyDays: studyDays,
                    totalQuestions: totalQuestions,
                    correctRate: correctRate,
                    avgPerDay: avgPerDay
                })
            };
        },

        /**
         * 生成月报
         * @param {number} year - 年
         * @param {number} month - 月 (1-12)
         * @returns {Object} 月报数据
         */
        generateMonthlyReport: function (year, month) {
            var StatsManager = stats.StatsManager;
            var ProgressCalculator = stats.ProgressCalculator;
            var AchievementManager = stats.AchievementManager;

            var now = new Date();
            year = year || now.getFullYear();
            month = month || (now.getMonth() + 1);

            var monthStart = year + '-' + String(month).padStart(2, '0') + '-01';
            var daysInMonth = Utils.getDaysInMonth(year, month - 1);
            var monthEnd = year + '-' + String(month).padStart(2, '0') + '-' + daysInMonth;

            // 不超过今天
            var today = Utils.getToday();
            if (monthEnd > today) monthEnd = today;

            var days = Utils.daysBetween(monthStart, monthEnd) + 1;

            var dailyList = [];
            var totalQuestions = 0;
            var totalCorrect = 0;
            var totalTime = 0;
            var studyDays = 0;
            var allDepts = {};
            var allTypes = {
                judge: { total: 0, correct: 0 },
                single: { total: 0, correct: 0 },
                multiple: { total: 0, correct: 0 }
            };
            var weeklyBreakdown = [];
            var weekQuestions = 0;
            var weekDays = 0;

            for (var i = 0; i < days; i++) {
                var date = Utils.daysAgo(monthEnd, days - 1 - i);
                var data = StatsManager.getDailyData(date);
                if (!data) {
                    data = { date: date, questionCount: 0, correctCount: 0, studyTime: 0 };
                }
                dailyList.push(data);

                totalQuestions += data.questionCount;
                totalCorrect += data.correctCount;
                totalTime += data.studyTime;
                if (data.questionCount > 0) {
                    studyDays++;
                    weekQuestions += data.questionCount;
                    weekDays++;
                }

                // 每7天记录一次周统计
                var dayIdx = new Date(date).getDay();
                if (dayIdx === 0 || i === days - 1) {
                    weeklyBreakdown.push({
                        week: weeklyBreakdown.length + 1,
                        questions: weekQuestions,
                        days: weekDays
                    });
                    weekQuestions = 0;
                    weekDays = 0;
                }

                // 合并部门统计
                if (data.departments) {
                    for (var dept in data.departments) {
                        if (data.departments.hasOwnProperty(dept)) {
                            if (!allDepts[dept]) {
                                allDepts[dept] = { total: 0, correct: 0 };
                            }
                            allDepts[dept].total += data.departments[dept].total;
                            allDepts[dept].correct += data.departments[dept].correct;
                        }
                    }
                }

                // 合并题型统计
                if (data.questionTypes) {
                    for (var type in data.questionTypes) {
                        if (data.questionTypes.hasOwnProperty(type) && allTypes[type]) {
                            allTypes[type].total += data.questionTypes[type].total;
                            allTypes[type].correct += data.questionTypes[type].correct;
                        }
                    }
                }
            }

            // 上月对比
            var prevMonth = month === 1 ? 12 : month - 1;
            var prevYear = month === 1 ? year - 1 : year;
            var prevDays = Utils.getDaysInMonth(prevYear, prevMonth - 1);
            var prevQuestions = 0;
            var prevCorrect = 0;
            var prevTime = 0;
            var prevStudyDays = 0;

            for (var p = 0; p < prevDays; p++) {
                var pDate = prevYear + '-' + String(prevMonth).padStart(2, '0') + '-' + String(p + 1).padStart(2, '0');
                var pData = StatsManager.getDailyData(pDate);
                if (pData) {
                    prevQuestions += pData.questionCount;
                    prevCorrect += pData.correctCount;
                    prevTime += pData.studyTime;
                    if (pData.questionCount > 0) prevStudyDays++;
                }
            }

            var correctRate = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
            var prevCorrectRate = prevQuestions > 0 ? prevCorrect / prevQuestions : 0;

            // 部门排名
            var deptRanking = [];
            for (var d in allDepts) {
                if (allDepts.hasOwnProperty(d)) {
                    deptRanking.push({
                        name: d,
                        total: allDepts[d].total,
                        correct: allDepts[d].correct,
                        rate: allDepts[d].total > 0 ? allDepts[d].correct / allDepts[d].total : 0
                    });
                }
            }
            deptRanking.sort(function (a, b) { return b.total - a.total; });

            // 本月成就
            var monthAchievements = [];
            var unlocked = AchievementManager.getUnlocked();
            for (var a = 0; a < unlocked.length; a++) {
                var ud = new Date(unlocked[a].unlockedDate);
                if (ud.getFullYear() === year && (ud.getMonth() + 1) === month) {
                    monthAchievements.push(unlocked[a]);
                }
            }

            // 趋势数据
            var trendData = dailyList.map(function (d) {
                return {
                    date: d.date,
                    label: d.date.slice(8), // DD
                    questions: d.questionCount,
                    correct: d.correctCount
                };
            });

            var overall = StatsManager.getOverallStats();

            return {
                type: 'monthly',
                year: year,
                month: month,
                startDate: monthStart,
                endDate: monthEnd,
                days: days,
                summary: {
                    totalQuestions: totalQuestions,
                    totalCorrect: totalCorrect,
                    correctRate: Math.round(correctRate * 1000) / 10,
                    totalTime: totalTime,
                    totalTimeFormatted: Utils.formatDuration(totalTime),
                    studyDays: studyDays,
                    avgPerDay: studyDays > 0 ? Math.round(totalQuestions / studyDays * 10) / 10 : 0,
                    avgTimePerDay: studyDays > 0 ? Math.round(totalTime / studyDays) : 0
                },
                comparison: {
                    questions: totalQuestions - prevQuestions,
                    questionsPercent: prevQuestions > 0
                        ? Math.round((totalQuestions - prevQuestions) / prevQuestions * 100)
                        : 0,
                    correctRate: Math.round((correctRate - prevCorrectRate) * 1000) / 10,
                    time: totalTime - prevTime,
                    studyDays: studyDays - prevStudyDays
                },
                dailyList: dailyList,
                weeklyBreakdown: weeklyBreakdown,
                trendData: trendData,
                deptRanking: deptRanking,
                typeStats: allTypes,
                achievements: monthAchievements,
                streak: {
                    current: overall.streakDays,
                    max: overall.maxStreakDays
                },
                score: this._calculateMonthScore({
                    studyDays: studyDays,
                    totalDays: days,
                    totalQuestions: totalQuestions,
                    correctRate: correctRate
                })
            };
        },

        /**
         * 计算周评分
         */
        _calculateWeekScore: function (data) {
            var score = 0;
            // 学习天数 (满分40)
            score += Math.min(40, data.studyDays * 6);
            // 做题量 (满分30)
            score += Math.min(30, data.totalQuestions / 10);
            // 正确率 (满分30)
            score += Math.round(data.correctRate * 30);
            return Math.min(100, Math.round(score));
        },

        /**
         * 计算月评分
         */
        _calculateMonthScore: function (data) {
            var score = 0;
            // 学习天数比例 (满分40)
            var dayRatio = data.studyDays / data.totalDays;
            score += Math.round(dayRatio * 40);
            // 做题量 (满分30)
            score += Math.min(30, data.totalQuestions / 30);
            // 正确率 (满分30)
            score += Math.round(data.correctRate * 30);
            return Math.min(100, Math.round(score));
        },

        /**
         * 生成分享用的报告摘要文本
         * @param {Object} report - 报告数据
         * @returns {string} 摘要文本
         */
        generateShareText: function (report) {
            var lines = [];

            if (report.type === 'daily') {
                lines.push('📅 学习日报 - ' + report.date);
                lines.push('');
                lines.push('📝 今日做题：' + report.summary.questionCount + '道');
                lines.push('✅ 正确率：' + report.summary.correctRate + '%');
                lines.push('⏱️ 学习时长：' + report.summary.studyTimeFormatted);
                lines.push('🔥 连续学习：' + report.streak.current + '天');
                if (report.achievements.length > 0) {
                    lines.push('🏆 今日解锁成就：' + report.achievements.length + '个');
                }
                lines.push('');
                lines.push('💪 继续加油！');
            } else if (report.type === 'weekly') {
                lines.push('📅 学习周报');
                lines.push(report.startDate + ' ~ ' + report.endDate);
                lines.push('');
                lines.push('📝 本周做题：' + report.summary.totalQuestions + '道');
                lines.push('✅ 正确率：' + report.summary.correctRate + '%');
                lines.push('⏱️ 学习时长：' + report.summary.totalTimeFormatted);
                lines.push('📅 学习天数：' + report.summary.studyDays + '天');
                lines.push('⭐ 综合评分：' + report.score + '分');
                if (report.comparison.questions > 0) {
                    lines.push('📈 比上周多做' + report.comparison.questions + '题');
                }
                lines.push('');
                lines.push('💪 继续保持！');
            } else if (report.type === 'monthly') {
                lines.push('📅 学习月报 - ' + report.year + '年' + report.month + '月');
                lines.push('');
                lines.push('📝 本月做题：' + report.summary.totalQuestions + '道');
                lines.push('✅ 正确率：' + report.summary.correctRate + '%');
                lines.push('⏱️ 学习时长：' + report.summary.totalTimeFormatted);
                lines.push('📅 学习天数：' + report.summary.studyDays + '天');
                lines.push('⭐ 综合评分：' + report.score + '分');
                if (report.achievements.length > 0) {
                    lines.push('🏆 解锁成就：' + report.achievements.length + '个');
                }
                lines.push('');
                lines.push('🎯 下月继续努力！');
            }

            return lines.join('\n');
        }
    };

    stats.ReportGenerator = ReportGenerator;

} (window.SZ.stats));

// ============================================================
//  UIComponents - 可视化组件
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    var UIComponents = {
        /**
         * 渲染学习进度条
         * @param {HTMLElement|string} container - 容器元素或ID
         * @param {Object} options - 配置
         * @param {number} options.progress - 进度 0-1
         * @param {string} options.label - 标签
         * @param {string} options.type - 类型 (total/daily)
         */
        ProgressBar: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var progress = Utils.clamp(options.progress || 0, 0, 1);
            var label = options.label || '';
            var subLabel = options.subLabel || '';
            var showPercent = options.showPercent !== false;
            var color = options.color || '#4F8EF7';
            var trackColor = options.trackColor || '#f0f0f0';
            var height = options.height || 8;
            var animated = options.animated !== false;

            container.innerHTML = '';
            container.style.position = 'relative';

            // 标签行
            if (label || showPercent) {
                var labelRow = document.createElement('div');
                labelRow.style.display = 'flex';
                labelRow.style.justifyContent = 'space-between';
                labelRow.style.alignItems = 'center';
                labelRow.style.marginBottom = '6px';
                labelRow.style.fontSize = '13px';
                labelRow.style.color = '#333';

                if (label) {
                    var labelEl = document.createElement('span');
                    labelEl.textContent = label;
                    labelRow.appendChild(labelEl);
                }

                if (showPercent) {
                    var percentEl = document.createElement('span');
                    percentEl.textContent = Math.round(progress * 100) + '%';
                    percentEl.style.color = color;
                    percentEl.style.fontWeight = '600';
                    labelRow.appendChild(percentEl);
                }

                container.appendChild(labelRow);
            }

            // 进度条轨道
            var track = document.createElement('div');
            track.style.width = '100%';
            track.style.height = height + 'px';
            track.style.backgroundColor = trackColor;
            track.style.borderRadius = height / 2 + 'px';
            track.style.overflow = 'hidden';

            // 进度条填充
            var fill = document.createElement('div');
            fill.style.height = '100%';
            fill.style.width = '0%';
            fill.style.backgroundColor = color;
            fill.style.borderRadius = height / 2 + 'px';
            fill.style.transition = animated ? 'width 0.6s ease-out' : 'none';
            fill.style.background = 'linear-gradient(90deg, ' + color + ', ' + Utils.hexToRgba(color, 0.7) + ')';

            track.appendChild(fill);
            container.appendChild(track);

            // 副标签
            if (subLabel) {
                var subLabelEl = document.createElement('div');
                subLabelEl.style.fontSize = '11px';
                subLabelEl.style.color = '#999';
                subLabelEl.style.marginTop = '4px';
                subLabelEl.style.textAlign = 'right';
                subLabelEl.textContent = subLabel;
                container.appendChild(subLabelEl);
            }

            // 动画
            if (animated) {
                requestAnimationFrame(function () {
                    fill.style.width = (progress * 100) + '%';
                });
            } else {
                fill.style.width = (progress * 100) + '%';
            }

            return {
                setProgress: function (p) {
                    progress = Utils.clamp(p, 0, 1);
                    fill.style.width = (progress * 100) + '%';
                    if (showPercent && percentEl) {
                        percentEl.textContent = Math.round(progress * 100) + '%';
                    }
                },
                getProgress: function () { return progress; }
            };
        },

        /**
         * 渲染掌握度星级
         * @param {HTMLElement|string} container - 容器
         * @param {Object} options - 配置
         * @param {number} options.level - 等级 0-5
         * @param {number} options.maxLevel - 最大等级
         */
        MasteryStars: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var level = options.level || 0;
            var maxLevel = options.maxLevel || 5;
            var size = options.size || 16;
            var activeColor = options.activeColor || '#FAAD14';
            var inactiveColor = options.inactiveColor || '#E0E0E0';
            var showText = options.showText === true;
            var levelNames = options.levelNames || ['未学习', '初识', '熟悉', '掌握', '精通', '专家'];

            container.innerHTML = '';
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.gap = '4px';

            for (var i = 0; i < maxLevel; i++) {
                var star = document.createElement('span');
                star.style.fontSize = size + 'px';
                star.style.lineHeight = '1';
                star.style.transition = 'all 0.3s';
                star.textContent = '★';
                
                if (i < level) {
                    star.style.color = activeColor;
                    star.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
                } else {
                    star.style.color = inactiveColor;
                }

                container.appendChild(star);
            }

            if (showText) {
                var text = document.createElement('span');
                text.style.fontSize = (size * 0.75) + 'px';
                text.style.color = level > 0 ? activeColor : '#999';
                text.style.marginLeft = '6px';
                text.textContent = levelNames[Math.min(level, levelNames.length - 1)];
                container.appendChild(text);
            }

            return {
                setLevel: function (l) {
                    level = Utils.clamp(l, 0, maxLevel);
                    var stars = container.querySelectorAll('span');
                    for (var i = 0; i < maxLevel; i++) {
                        if (i < level) {
                            stars[i].style.color = activeColor;
                        } else {
                            stars[i].style.color = inactiveColor;
                        }
                    }
                    if (showText && text) {
                        text.textContent = levelNames[Math.min(level, levelNames.length - 1)];
                    }
                },
                getLevel: function () { return level; }
            };
        },

        /**
         * 连续学习天数火焰图标
         * @param {HTMLElement|string} container - 容器
         * @param {Object} options - 配置
         * @param {number} options.days - 连续天数
         */
        StreakFlame: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var days = options.days || 0;
            var size = options.size || 32;
            var showDays = options.showDays !== false;

            container.innerHTML = '';
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.gap = '6px';

            var flame = document.createElement('span');
            flame.style.fontSize = size + 'px';
            flame.textContent = '🔥';
            flame.style.animation = 'none';
            
            if (days > 0) {
                flame.style.animation = 'sz-flame-pulse 1.5s ease-in-out infinite';
            }

            container.appendChild(flame);

            if (showDays) {
                var daysEl = document.createElement('div');
                daysEl.style.display = 'flex';
                daysEl.style.flexDirection = 'column';
                daysEl.style.lineHeight = '1.2';

                var numEl = document.createElement('span');
                numEl.style.fontSize = Math.round(size * 0.6) + 'px';
                numEl.style.fontWeight = 'bold';
                numEl.style.color = '#F5222D';
                numEl.textContent = days;

                var labelEl = document.createElement('span');
                labelEl.style.fontSize = Math.round(size * 0.3) + 'px';
                labelEl.style.color = '#999';
                labelEl.textContent = '连续天数';

                daysEl.appendChild(numEl);
                daysEl.appendChild(labelEl);
                container.appendChild(daysEl);
            }

            // 注入动画样式
            this._injectFlameAnimation();

            return {
                setDays: function (d) {
                    days = d;
                    if (numEl) numEl.textContent = days;
                    if (days > 0) {
                        flame.style.animation = 'sz-flame-pulse 1.5s ease-in-out infinite';
                    } else {
                        flame.style.animation = 'none';
                    }
                },
                getDays: function () { return days; }
            };
        },

        _flameStyleInjected: false,
        _injectFlameAnimation: function () {
            if (this._flameStyleInjected) return;
            var style = document.createElement('style');
            style.textContent = [
                '@keyframes sz-flame-pulse {',
                '  0%, 100% { transform: scale(1); filter: brightness(1); }',
                '  50% { transform: scale(1.1); filter: brightness(1.2); }',
                '}'
            ].join('\n');
            document.head.appendChild(style);
            this._flameStyleInjected = true;
        },

        /**
         * 等级经验条
         * @param {HTMLElement|string} container - 容器
         * @param {Object} options - 配置
         */
        LevelExpBar: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var level = options.level || 1;
            var progress = Utils.clamp(options.progress || 0, 0, 1);
            var currentExp = options.currentExp || 0;
            var nextLevelExp = options.nextLevelExp || 100;
            var isMaxLevel = options.isMaxLevel || false;

            container.innerHTML = '';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.gap = '12px';

            // 等级徽章
            var badge = document.createElement('div');
            badge.style.width = '48px';
            badge.style.height = '48px';
            badge.style.borderRadius = '50%';
            badge.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            badge.style.display = 'flex';
            badge.style.flexDirection = 'column';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.color = '#fff';
            badge.style.fontWeight = 'bold';
            badge.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.4)';
            badge.style.flexShrink = '0';

            var levelNum = document.createElement('span');
            levelNum.style.fontSize = '18px';
            levelNum.style.lineHeight = '1';
            levelNum.textContent = 'Lv.' + level;

            var levelLabel = document.createElement('span');
            levelLabel.style.fontSize = '8px';
            levelLabel.style.opacity = '0.8';
            levelLabel.style.marginTop = '2px';
            levelLabel.textContent = isMaxLevel ? '满级' : '等级';

            badge.appendChild(levelNum);
            badge.appendChild(levelLabel);
            container.appendChild(badge);

            // 经验条区域
            var expArea = document.createElement('div');
            expArea.style.flex = '1';
            expArea.style.minWidth = '0';

            // 经验数值
            var expText = document.createElement('div');
            expText.style.display = 'flex';
            expText.style.justifyContent = 'space-between';
            expText.style.fontSize = '12px';
            expText.style.color = '#666';
            expText.style.marginBottom = '6px';

            var currentExpEl = document.createElement('span');
            currentExpEl.textContent = currentExp + ' EXP';

            var nextExpEl = document.createElement('span');
            nextExpEl.textContent = isMaxLevel ? 'MAX' : nextLevelExp + ' EXP';

            expText.appendChild(currentExpEl);
            expText.appendChild(nextExpEl);
            expArea.appendChild(expText);

            // 经验条
            var track = document.createElement('div');
            track.style.width = '100%';
            track.style.height = '8px';
            track.style.backgroundColor = '#f0f0f0';
            track.style.borderRadius = '4px';
            track.style.overflow = 'hidden';

            var fill = document.createElement('div');
            fill.style.height = '100%';
            fill.style.width = (progress * 100) + '%';
            fill.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
            fill.style.borderRadius = '4px';
            fill.style.transition = 'width 0.5s ease-out';

            track.appendChild(fill);
            expArea.appendChild(track);

            container.appendChild(expArea);

            return {
                setLevel: function (lvl, prog, curExp, nextExp, max) {
                    level = lvl;
                    progress = Utils.clamp(prog, 0, 1);
                    isMaxLevel = max || false;
                    levelNum.textContent = 'Lv.' + level;
                    levelLabel.textContent = isMaxLevel ? '满级' : '等级';
                    fill.style.width = (progress * 100) + '%';
                    currentExpEl.textContent = (curExp || 0) + ' EXP';
                    nextExpEl.textContent = isMaxLevel ? 'MAX' : (nextExp || 0) + ' EXP';
                },
                getLevel: function () { return level; }
            };
        },

        /**
         * 成就徽章
         * @param {HTMLElement|string} container - 容器
         * @param {Object} options - 配置
         * @param {Object} options.achievement - 成就数据
         * @param {boolean} options.unlocked - 是否已解锁
         */
        AchievementBadge: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var achievement = options.achievement || {};
            var unlocked = options.unlocked !== false;
            var size = options.size || 'normal'; // small, normal, large
            var showName = options.showName !== false;
            var showDesc = options.showDesc === true;

            var sizeConfig = {
                small: { badge: 40, icon: 20, nameSize: 11 },
                normal: { badge: 60, icon: 28, nameSize: 13 },
                large: { badge: 80, icon: 36, nameSize: 15 }
            };
            var cfg = sizeConfig[size] || sizeConfig.normal;

            var rarityColors = {
                common: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280', glow: 'none' },
                rare: { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB', glow: '0 0 10px rgba(59, 130, 246, 0.3)' },
                epic: { bg: '#F5F3FF', border: '#8B5CF6', text: '#7C3AED', glow: '0 0 15px rgba(139, 92, 246, 0.4)' },
                legendary: { bg: '#FFFBEB', border: '#F59E0B', text: '#D97706', glow: '0 0 20px rgba(245, 158, 11, 0.5)' },
                mythic: { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626', glow: '0 0 25px rgba(239, 68, 68, 0.6)' }
            };
            var rarity = rarityColors[achievement.rarity] || rarityColors.common;

            container.innerHTML = '';
            container.style.display = 'inline-flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.gap = '6px';
            container.style.cursor = 'pointer';

            // 徽章主体
            var badge = document.createElement('div');
            badge.style.width = cfg.badge + 'px';
            badge.style.height = cfg.badge + 'px';
            badge.style.borderRadius = '50%';
            badge.style.border = '3px solid ' + (unlocked ? rarity.border : '#E5E7EB');
            badge.style.background = unlocked ? rarity.bg : '#F9FAFB';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.fontSize = cfg.icon + 'px';
            badge.style.position = 'relative';
            badge.style.transition = 'all 0.3s';
            badge.style.boxShadow = unlocked ? rarity.glow : 'none';
            badge.style.filter = unlocked ? 'none' : 'grayscale(100%)';
            badge.style.opacity = unlocked ? '1' : '0.5';

            badge.textContent = achievement.icon || '🏆';

            // 稀有度标识
            if (unlocked && size !== 'small') {
                var rarityDot = document.createElement('div');
                rarityDot.style.position = 'absolute';
                rarityDot.style.bottom = '2px';
                rarityDot.style.right = '2px';
                rarityDot.style.width = '12px';
                rarityDot.style.height = '12px';
                rarityDot.style.borderRadius = '50%';
                rarityDot.style.backgroundColor = rarity.border;
                rarityDot.style.border = '2px solid #fff';
                badge.appendChild(rarityDot);
            }

            container.appendChild(badge);

            // 名称
            if (showName) {
                var name = document.createElement('div');
                name.style.fontSize = cfg.nameSize + 'px';
                name.style.fontWeight = unlocked ? '600' : '400';
                name.style.color = unlocked ? rarity.text : '#9CA3AF';
                name.style.textAlign = 'center';
                name.style.maxWidth = cfg.badge + 20 + 'px';
                name.style.overflow = 'hidden';
                name.style.textOverflow = 'ellipsis';
                name.style.whiteSpace = 'nowrap';
                name.textContent = achievement.name || '未知成就';
                container.appendChild(name);
            }

            // 描述
            if (showDesc && achievement.description) {
                var desc = document.createElement('div');
                desc.style.fontSize = '11px';
                desc.style.color = '#9CA3AF';
                desc.style.textAlign = 'center';
                desc.style.maxWidth = cfg.badge + 40 + 'px';
                desc.textContent = achievement.description;
                container.appendChild(desc);
            }

            // 悬停效果
            container.addEventListener('mouseenter', function () {
                if (unlocked) {
                    badge.style.transform = 'scale(1.1)';
                }
            });
            container.addEventListener('mouseleave', function () {
                badge.style.transform = 'scale(1)';
            });

            return {
                setUnlocked: function (u) {
                    unlocked = u;
                    badge.style.borderColor = unlocked ? rarity.border : '#E5E7EB';
                    badge.style.background = unlocked ? rarity.bg : '#F9FAFB';
                    badge.style.filter = unlocked ? 'none' : 'grayscale(100%)';
                    badge.style.opacity = unlocked ? '1' : '0.5';
                    badge.style.boxShadow = unlocked ? rarity.glow : 'none';
                    if (name) {
                        name.style.fontWeight = unlocked ? '600' : '400';
                        name.style.color = unlocked ? rarity.text : '#9CA3AF';
                    }
                },
                isUnlocked: function () { return unlocked; }
            };
        },

        /**
         * 学习时间线
         * @param {HTMLElement|string} container - 容器
         * @param {Object} options - 配置
         * @param {Array} options.events - 事件列表 [{date, type, title, desc}]
         */
        Timeline: function (container, options) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            if (!container) return null;

            var events = options.events || [];
            var maxItems = options.maxItems || 20;

            container.innerHTML = '';
            container.style.position = 'relative';
            container.style.paddingLeft = '20px';

            // 时间线
            var line = document.createElement('div');
            line.style.position = 'absolute';
            line.style.left = '6px';
            line.style.top = '0';
            line.style.bottom = '0';
            line.style.width = '2px';
            line.style.backgroundColor = '#E5E7EB';
            container.appendChild(line);

            var displayEvents = events.slice(0, maxItems);

            for (var i = 0; i < displayEvents.length; i++) {
                var event = displayEvents[i];
                var item = document.createElement('div');
                item.style.position = 'relative';
                item.style.paddingBottom = i === displayEvents.length - 1 ? '0' : '16px';

                // 节点
                var dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.left = '-17px';
                dot.style.top = '4px';
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = this._getEventColor(event.type);
                dot.style.border = '2px solid #fff';
                dot.style.boxShadow = '0 0 0 2px ' + this._getEventColor(event.type);
                item.appendChild(dot);

                // 内容
                var content = document.createElement('div');
                content.style.backgroundColor = '#F9FAFB';
                content.style.borderRadius = '8px';
                content.style.padding = '10px 12px';
                content.style.marginLeft = '8px';

                var title = document.createElement('div');
                title.style.fontSize = '13px';
                title.style.fontWeight = '600';
                title.style.color = '#374151';
                title.style.marginBottom = '2px';
                title.textContent = event.title || '';
                content.appendChild(title);

                if (event.desc) {
                    var desc = document.createElement('div');
                    desc.style.fontSize = '11px';
                    desc.style.color = '#6B7280';
                    desc.textContent = event.desc;
                    content.appendChild(desc);
                }

                if (event.date) {
                    var date = document.createElement('div');
                    date.style.fontSize = '10px';
                    date.style.color = '#9CA3AF';
                    date.style.marginTop = '4px';
                    date.textContent = event.date;
                    content.appendChild(date);
                }

                item.appendChild(content);
                container.appendChild(item);
            }

            if (events.length === 0) {
                var empty = document.createElement('div');
                empty.style.textAlign = 'center';
                empty.style.padding = '20px';
                empty.style.color = '#9CA3AF';
                empty.style.fontSize = '13px';
                empty.textContent = '暂无学习记录';
                container.appendChild(empty);
            }

            return {
                addEvent: function (evt) {
                    events.unshift(evt);
                    // 重新渲染（简化实现）
                    // 实际应用可优化为增量添加
                },
                getEvents: function () { return events.slice(); }
            };
        },

        _getEventColor: function (type) {
            var colors = {
                answer: '#4F8EF7',
                correct: '#52C41A',
                wrong: '#F5222D',
                achievement: '#FAAD14',
                levelup: '#722ED1',
                review: '#13C2C2',
                note: '#EB2F96',
                default: '#9CA3AF'
            };
            return colors[type] || colors.default;
        },

        /**
         * 知识掌握度热力分布（Canvas实现）
         * @param {HTMLCanvasElement|string} canvas - Canvas元素
         * @param {Object} options - 配置
         * @param {Object} options.deptStats - 部门统计
         */
        MasteryHeatmap: function (canvas, options) {
            var cvs = Utils.getCanvas(canvas);
            if (!cvs) return null;

            var width = options.width || cvs.clientWidth || 500;
            var height = options.height || cvs.clientHeight || 300;
            var ctx = Utils.getContext(cvs, width, height);
            var deptStats = options.deptStats || {};
            var style = options.style || {};

            var depts = Object.keys(deptStats);
            if (depts.length === 0) {
                ctx.fillStyle = '#999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', width / 2, height / 2);
                return;
            }

            var padding = { top: 30, right: 30, bottom: 50, left: 80 };
            var chartWidth = width - padding.left - padding.right;
            var chartHeight = height - padding.top - padding.bottom;

            // 计算网格
            var cols = Math.min(5, depts.length);
            var rows = Math.ceil(depts.length / cols);
            var cellWidth = chartWidth / cols;
            var cellHeight = chartHeight / rows;
            var cellPadding = 8;

            // 颜色梯度
            var getHeatColor = function (value) {
                // value: 0-1
                if (value <= 0) return '#EBEDF0';
                var r = Math.round(235 - value * 100);
                var g = Math.round(235 - value * 100);
                var b = Math.round(240 - value * 80);
                // 从浅灰到主题色
                var r2 = Math.round(79 + value * 0);
                var g2 = Math.round(142 + value * 0);
                var b2 = Math.round(247 + value * 0);
                // 插值
                var t = value;
                var rr = Math.round(Utils.lerp(220, 79, t));
                var gg = Math.round(Utils.lerp(220, 142, t));
                var bb = Math.round(Utils.lerp(220, 247, t));
                return 'rgb(' + rr + ',' + gg + ',' + bb + ')';
            };

            // 标题
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(options.title || '知识掌握度分布', width / 2, 8);

            // 绘制每个部门格子
            for (var i = 0; i < depts.length; i++) {
                var dept = depts[i];
                var stats = deptStats[dept];
                var col = i % cols;
                var row = Math.floor(i / cols);

                var x = padding.left + col * cellWidth + cellPadding;
                var y = padding.top + row * cellHeight + cellPadding;
                var w = cellWidth - cellPadding * 2;
                var h = cellHeight - cellPadding * 2;

                // 掌握度值 0-1
                var mastery = stats.answered > 0 ? (stats.avgMastery || 0) / 5 : 0;
                var completion = stats.total > 0 ? stats.answered / stats.total : 0;
                var heatValue = mastery * 0.6 + completion * 0.4;

                // 绘制热力块
                ctx.fillStyle = getHeatColor(heatValue);
                Utils.roundRect(ctx, x, y, w, h, 8);
                ctx.fill();

                // 部门名称
                ctx.fillStyle = heatValue > 0.5 ? '#fff' : '#333';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                var deptName = dept.length > 6 ? dept.slice(0, 5) + '...' : dept;
                ctx.fillText(deptName, x + w / 2, y + h / 2 - 10);

                // 掌握度百分比
                ctx.fillStyle = heatValue > 0.5 ? 'rgba(255,255,255,0.9)' : '#666';
                ctx.font = '11px sans-serif';
                var pct = Math.round(mastery * 100) + '%';
                ctx.fillText('掌握度 ' + pct, x + w / 2, y + h / 2 + 10);

                // 题目数
                ctx.fillStyle = heatValue > 0.5 ? 'rgba(255,255,255,0.7)' : '#999';
                ctx.font = '10px sans-serif';
                ctx.fillText(stats.answered + '/' + stats.total + '题', x + w / 2, y + h / 2 + 24);
            }

            return { depts: depts, deptStats: deptStats };
        }
    };

    stats.UIComponents = UIComponents;

} (window.SZ.stats));

// ============================================================
//  设置管理
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;
    var SETTINGS_KEY = 'sz_stats_settings';

    var defaultSettings = {
        dailyGoal: {
            questionCount: 30,
            correctRate: 0.7,
            studyTime: 1800
        },
        notification: {
            enabled: true,
            dailyReminder: true,
            achievementPopup: true,
            soundEnabled: false
        },
        display: {
            theme: 'auto',
            chartAnimation: true,
            showConfetti: true,
            compactMode: false
        },
        privacy: {
            syncEnabled: false,
            autoBackup: true
        }
    };

    var SettingsManager = {
        _settings: null,

        init: function () {
            this._settings = Utils.getStorage(SETTINGS_KEY, {});
            this._mergeDefaults();
        },

        _mergeDefaults: function () {
            var merged = Utils.deepClone(defaultSettings);
            for (var key in this._settings) {
                if (this._settings.hasOwnProperty(key)) {
                    if (typeof this._settings[key] === 'object' && this._settings[key] !== null) {
                        merged[key] = Object.assign(merged[key] || {}, this._settings[key]);
                    } else {
                        merged[key] = this._settings[key];
                    }
                }
            }
            this._settings = merged;
        },

        get: function (key) {
            if (!key) return Utils.deepClone(this._settings);
            var keys = key.split('.');
            var value = this._settings;
            for (var i = 0; i < keys.length; i++) {
                if (value && value.hasOwnProperty(keys[i])) {
                    value = value[keys[i]];
                } else {
                    return undefined;
                }
            }
            return typeof value === 'object' ? Utils.deepClone(value) : value;
        },

        set: function (key, value) {
            var keys = key.split('.');
            var target = this._settings;
            for (var i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]] || typeof target[keys[i]] !== 'object') {
                    target[keys[i]] = {};
                }
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = value;
            this._save();
        },

        reset: function () {
            this._settings = Utils.deepClone(defaultSettings);
            this._save();
        },

        _save: function () {
            Utils.setStorage(SETTINGS_KEY, this._settings);
        }
    };

    stats.SettingsManager = SettingsManager;

} (window.SZ.stats));


// ============================================================
//  数据迁移与版本管理
// ============================================================
(function (stats) {
    'use strict';

    var Utils = stats._utils;

    var DataMigrator = {
        currentVersion: '1.0.0',

        /**
         * 检查并执行数据迁移
         */
        migrate: function () {
            var storedVersion = Utils.getStorage('sz_stats_version', null);
            
            if (!storedVersion) {
                // 新用户或旧版本无版本号
                this._migrateFromV0();
            } else if (storedVersion !== this.currentVersion) {
                // 版本不同，按需要迁移
                // 目前只有一个版本，直接更新版本号
            }

            Utils.setStorage('sz_stats_version', this.currentVersion);
        },

        _migrateFromV0: function () {
            // 从无版本号的数据迁移
            // 主要是补全缺失的字段
            var overall = Utils.getStorage('sz_overall_stats', null);
            if (overall) {
                if (!overall.level) overall.level = 1;
                if (!overall.totalExp) overall.totalExp = 0;
                if (!overall.masteredQuestions) overall.masteredQuestions = 0;
                if (!overall.reviewWrongCount) overall.reviewWrongCount = 0;
                if (!overall.currentCombo) overall.currentCombo = 0;
                if (!overall.maxCombo) overall.maxCombo = 0;
                Utils.setStorage('sz_overall_stats', overall);
            }
        },

        /**
         * 估算数据存储大小
         * @returns {Object} 各模块大小（字节）
         */
        getStorageSize: function () {
            var keys = [
                'sz_question_records',
                'sz_daily_data',
                'sz_overall_stats',
                'sz_wrong_book',
                'sz_favorites',
                'sz_notes',
                'sz_achievements',
                'sz_stats_settings',
                'sz_stats_version'
            ];

            var sizes = {};
            var total = 0;

            for (var i = 0; i < keys.length; i++) {
                var data = localStorage.getItem(keys[i]);
                var size = data ? data.length * 2 : 0; // UTF-16
                sizes[keys[i]] = size;
                total += size;
            }

            sizes._total = total;
            sizes._totalKB = Math.round(total / 1024 * 100) / 100;
            sizes._totalMB = Math.round(total / 1024 / 1024 * 100) / 100;

            return sizes;
        },

        /**
         * 清理旧数据（保留最近N天的日数据）
         * @param {number} days - 保留天数
         */
        cleanupOldData: function (days) {
            days = days || 365;
            var dailyData = Utils.getStorage('sz_daily_data', {});
            var cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            var cutoffStr = Utils.formatDate(cutoff);

            var deleted = 0;
            for (var date in dailyData) {
                if (dailyData.hasOwnProperty(date)) {
                    if (date < cutoffStr) {
                        delete dailyData[date];
                        deleted++;
                    }
                }
            }

            if (deleted > 0) {
                Utils.setStorage('sz_daily_data', dailyData);
            }

            return deleted;
        }
    };

    stats.DataMigrator = DataMigrator;

} (window.SZ.stats));


// ============================================================
//  主入口与公共API
// ============================================================
(function (stats) {
    'use strict';

    var initialized = false;

    /**
     * 初始化统计系统
     * @param {Object} options - 初始化选项
     * @returns {boolean} 是否成功初始化
     */
    stats.init = function (options) {
        if (initialized) return true;

        options = options || {};

        try {
            // 执行数据迁移
            if (stats.DataMigrator) {
                stats.DataMigrator.migrate();
            }

            // 初始化各模块
            if (stats.SettingsManager) {
                stats.SettingsManager.init();
            }

            if (stats.StatsManager) {
                stats.StatsManager.init();
            }

            if (stats.AchievementManager) {
                stats.AchievementManager.init();
                // 如果传入了总题数，设置进去
                if (options.totalQuestionCount) {
                    stats.AchievementManager.setTotalQuestionCount(options.totalQuestionCount);
                }
            }

            initialized = true;

            // 触发初始化完成事件
            if (stats.StatsManager && stats.StatsManager._emit) {
                stats.StatsManager._emit('initialized', { success: true });
            }

            return true;
        } catch (e) {
            console.error('SZ.stats 初始化失败:', e);
            return false;
        }
    };

    /**
     * 检查是否已初始化
     * @returns {boolean}
     */
    stats.isInitialized = function () {
        return initialized;
    };

    /**
     * 获取系统版本
     * @returns {string}
     */
    stats.getVersion = function () {
        return '1.0.0';
    };

    /**
     * 便捷方法：记录答题
     * @param {Object} params - 答题参数
     */
    stats.recordAnswer = function (params) {
        if (!initialized) this.init();
        return stats.StatsManager.recordAnswer(params);
    };

    /**
     * 便捷方法：获取整体统计
     */
    stats.getOverallStats = function () {
        if (!initialized) this.init();
        return stats.StatsManager.getOverallStats();
    };

    /**
     * 便捷方法：获取今日数据
     */
    stats.getTodayData = function () {
        if (!initialized) this.init();
        return stats.StatsManager.getTodayData();
    };

    /**
     * 便捷方法：导出数据
     */
    stats.exportData = function () {
        if (!initialized) this.init();
        return stats.StatsManager.exportData();
    };

    /**
     * 便捷方法：导入数据
     */
    stats.importData = function (jsonData, options) {
        if (!initialized) this.init();
        return stats.StatsManager.importData(jsonData, options);
    };

    /**
     * 便捷方法：重置数据
     */
    stats.resetData = function (options) {
        if (!initialized) this.init();
        return stats.StatsManager.resetData(options);
    };

    /**
     * 便捷方法：生成日报
     */
    stats.getDailyReport = function (date) {
        if (!initialized) this.init();
        return stats.ReportGenerator.generateDailyReport(date);
    };

    /**
     * 便捷方法：生成周报
     */
    stats.getWeeklyReport = function (endDate) {
        if (!initialized) this.init();
        return stats.ReportGenerator.generateWeeklyReport(endDate);
    };

    /**
     * 便捷方法：生成月报
     */
    stats.getMonthlyReport = function (year, month) {
        if (!initialized) this.init();
        return stats.ReportGenerator.generateMonthlyReport(year, month);
    };

    /**
     * 便捷方法：获取成就进度
     */
    stats.getAchievementProgress = function () {
        if (!initialized) this.init();
        return stats.AchievementManager.getProgress();
    };

    /**
     * 便捷方法：获取等级信息
     */
    stats.getLevelInfo = function () {
        if (!initialized) this.init();
        return stats.StatsManager.getLevelInfo();
    };

    /**
     * 便捷方法：获取每日目标进度
     */
    stats.getDailyGoalProgress = function (date) {
        if (!initialized) this.init();
        return stats.StatsManager.getDailyGoalProgress(date);
    };

    /**
     * 便捷方法：添加学习时长
     */
    stats.addStudyTime = function (seconds) {
        if (!initialized) this.init();
        stats.StatsManager.addStudyTime(seconds);
    };

    // 模块清单（供外部查询）
    stats.modules = [
        'StatsManager',
        'ProgressCalculator',
        'ChartRenderer',
        'AchievementManager',
        'ReportGenerator',
        'UIComponents',
        'SettingsManager',
        'DataMigrator'
    ];

    // 图表类型清单
    stats.chartTypes = [
        'LineChart',
        'BarChart',
        'PieChart',
        'DoughnutChart',
        'RadarChart',
        'HeatmapChart',
        'ProgressRing',
        'GaugeChart',
        'AreaChart',
        'StackedBarChart'
    ];

    // UI组件清单
    stats.uiComponents = [
        'ProgressBar',
        'MasteryStars',
        'StreakFlame',
        'LevelExpBar',
        'AchievementBadge',
        'Timeline',
        'MasteryHeatmap'
    ];

    // 自动初始化（如果DOM已加载）
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // 延迟一点，确保所有模块都已定义
        setTimeout(function () {
            // 不自动初始化，等待调用方显式调用init()
            // 这样可以传入配置参数
        }, 0);
    }

} (window.SZ.stats));
