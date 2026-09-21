/**
 * ============================================================================
 *  SZ.themes - 刷题应用主题皮肤管理系统
 * ============================================================================
 *
 *  版本: 1.0.0
 *  作者: SZ Team
 *  描述: 刷题应用的主题皮肤管理核心系统
 *
 *  功能特性：
 *  - 56种精心设计的主题皮肤切换
 *  - 主题预览（hover临时切换）
 *  - 主题收藏/常用主题管理
 *  - 30+种字体管理（20+中文字体 + 10+英文字体）
 *  - 字体大小/粗细/行高调节
 *  - 背景自定义（颜色/图片/渐变/图案/滤镜）
 *  - 多种图标风格切换
 *  - 粒子特效联动
 *  - 音效风格联动
 *  - 主题专属动画
 *  - 设置持久化（localStorage）
 *  - 配置导入/导出
 *  - 重置为默认
 *
 *  使用方式：
 *  - SZ.themes.getThemeList()          // 获取主题列表
 *  - SZ.themes.setTheme('dark')        // 切换主题
 *  - SZ.themes.getCurrentTheme()       // 获取当前主题
 *  - SZ.themes.setFont('思源黑体')     // 设置字体
 *  - SZ.themes.setFontSize('large')    // 设置字号
 *  - SZ.themes.setCustomBg(config)     // 设置自定义背景
 *  - SZ.themes.exportSettings()        // 导出设置
 *  - SZ.themes.importSettings(data)    // 导入设置
 *  - SZ.themes.resetToDefault()        // 重置为默认
 *
 * ============================================================================
 */

(function (window) {
    'use strict';

    // ============================================================
    //  命名空间初始化
    // ============================================================
    window.SZ = window.SZ || {};
    window.SZ.themes = window.SZ.themes || {};

    var SZT = window.SZ.themes;

    // ============================================================
    //  常量定义
    // ============================================================

    /** localStorage 存储键名 */
    var STORAGE_KEYS = {
        CURRENT_THEME: 'sz_theme_current',
        FAVORITE_THEMES: 'sz_theme_favorites',
        FREQUENT_THEMES: 'sz_theme_frequent',
        FONT_FAMILY: 'sz_theme_font_family',
        FONT_SIZE: 'sz_theme_font_size',
        FONT_WEIGHT: 'sz_theme_font_weight',
        LINE_HEIGHT: 'sz_theme_line_height',
        CUSTOM_BG: 'sz_theme_custom_bg',
        ICON_STYLE: 'sz_theme_icon_style',
        ICON_SIZE: 'sz_theme_icon_size',
        PARTICLE_ENABLED: 'sz_theme_particle_enabled',
        SOUND_STYLE: 'sz_theme_sound_style',
        ALL_SETTINGS: 'sz_theme_all_settings'
    };

    /** 默认主题ID */
    var DEFAULT_THEME_ID = 'default';

    /** 字体大小档位 */
    var FONT_SIZE_LEVELS = {
        small: { label: '小', value: '14px', multiplier: 0.9 },
        medium: { label: '中', value: '16px', multiplier: 1.0 },
        large: { label: '大', value: '18px', multiplier: 1.15 },
        xlarge: { label: '特大', value: '20px', multiplier: 1.3 }
    };

    /** 字体粗细档位 */
    var FONT_WEIGHT_LEVELS = {
        light: { label: '细', value: 300 },
        normal: { label: '常规', value: 400 },
        medium: { label: '中等', value: 500 },
        semibold: { label: '半粗', value: 600 },
        bold: { label: '粗体', value: 700 }
    };

    /** 行高档位 */
    var LINE_HEIGHT_LEVELS = {
        tight: { label: '紧凑', value: 1.3 },
        normal: { label: '标准', value: 1.6 },
        relaxed: { label: '宽松', value: 1.8 },
        loose: { label: '超宽', value: 2.0 }
    };

    /** 图标风格 */
    var ICON_STYLES = {
        linear: { label: '线性', description: '简洁的线条图标' },
        filled: { label: '填充', description: '实心填充图标' },
        duotone: { label: '双色', description: '双色渐变图标' },
        pixel: { label: '像素风', description: '复古像素风格' },
        handdrawn: { label: '手绘风', description: '手绘草图风格' },
        neon: { label: '霓虹风', description: '发光霓虹效果' },
        outline: { label: '轮廓', description: '细轮廓线条' },
        rounded: { label: '圆角', description: '圆润可爱风格' }
    };

    /** 背景滤镜预设 */
    var BG_FILTER_PRESETS = {
        none: { label: '无', filter: 'none' },
        grayscale: { label: '黑白', filter: 'grayscale(100%)' },
        sepia: { label: '复古', filter: 'sepia(80%)' },
        blur: { label: '模糊', filter: 'blur(5px)' },
        brightness: { label: '高亮', filter: 'brightness(130%)' },
        contrast: { label: '高对比', filter: 'contrast(130%)' },
        saturate: { label: '高饱和', filter: 'saturate(150%)' },
        hueRotate: { label: '色相偏移', filter: 'hue-rotate(90deg)' },
        invert: { label: '反色', filter: 'invert(100%)' },
        warm: { label: '暖色', filter: 'sepia(30%) saturate(120%)' },
        cool: { label: '冷色', filter: 'hue-rotate(180deg) saturate(80%)' },
        vintage: { label: '复古胶片', filter: 'sepia(50%) contrast(110%) brightness(90%)' },
        dreamy: { label: '梦幻', filter: 'brightness(110%) saturate(120%) blur(1px)' },
        cinematic: { label: '电影感', filter: 'contrast(120%) saturate(80%) brightness(90%)' }
    };

    /** 背景图案类型 */
    var BG_PATTERN_TYPES = {
        dots: { label: '点阵', css: 'radial-gradient(circle, var(--pattern-color) 1px, transparent 1px)' },
        grid: { label: '网格', css: 'linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-color) 1px, transparent 1px)' },
        stripes: { label: '条纹', css: 'repeating-linear-gradient(45deg, var(--pattern-color), var(--pattern-color) 2px, transparent 2px, transparent 20px)' },
        hstripes: { label: '横条纹', css: 'repeating-linear-gradient(0deg, var(--pattern-color), var(--pattern-color) 1px, transparent 1px, transparent 10px)' },
        vstripes: { label: '竖条纹', css: 'repeating-linear-gradient(90deg, var(--pattern-color), var(--pattern-color) 1px, transparent 1px, transparent 10px)' },
        triangles: { label: '三角形', css: 'linear-gradient(60deg, var(--pattern-color) 25%, transparent 25%, transparent 75%, var(--pattern-color) 75%), linear-gradient(60deg, var(--pattern-color) 25%, transparent 25%, transparent 75%, var(--pattern-color) 75%)' },
        hexagons: { label: '六边形', css: 'radial-gradient(circle at 50% 50%, var(--pattern-color) 2px, transparent 2px)' },
        waves: { label: '波浪', css: 'repeating-linear-gradient(90deg, transparent, transparent 10px, var(--pattern-color) 10px, var(--pattern-color) 20px)' },
        zigzag: { label: '锯齿', css: 'linear-gradient(135deg, var(--pattern-color) 25%, transparent 25%) -10px 0, linear-gradient(225deg, var(--pattern-color) 25%, transparent 25%) -10px 0, linear-gradient(315deg, var(--pattern-color) 25%, transparent 25%), linear-gradient(45deg, var(--pattern-color) 25%, transparent 25%)' },
        cross: { label: '十字', css: 'linear-gradient(var(--pattern-color) 2px, transparent 2px), linear-gradient(90deg, var(--pattern-color) 2px, transparent 2px)' },
        circles: { label: '圆环', css: 'radial-gradient(circle, var(--pattern-color) 2px, transparent 2px), radial-gradient(circle, var(--pattern-color) 2px, transparent 2px)' },
        diamonds: { label: '菱形', css: 'linear-gradient(45deg, var(--pattern-color) 25%, transparent 25%), linear-gradient(-45deg, var(--pattern-color) 25%, transparent 25%)' }
    };

    /** 渐变类型 */
    var GRADIENT_TYPES = {
        linear: '线性渐变',
        radial: '径向渐变',
        conic: '锥形渐变',
        linear45: '45度线性',
        linear135: '135度线性',
        repeatingLinear: '重复线性',
        repeatingRadial: '重复径向'
    };

    /** 主题分类 */
    var THEME_CATEGORIES = {
        minimal: { label: '简约', icon: '◇' },
        retro: { label: '复古', icon: '♪' },
        game: { label: '游戏', icon: '▶' },
        nature: { label: '自然', icon: '❀' },
        art: { label: '艺术', icon: '◈' },
        culture: { label: '文化', icon: '❖' },
        festival: { label: '节日', icon: '✿' },
        tech: { label: '科技', icon: '◆' },
        editor: { label: '编辑器', icon: '▤' }
    };

    // ============================================================
    //  工具函数
    // ============================================================

    var utils = {
        /**
         * 安全获取 localStorage 数据
         * @param {string} key - 存储键名
         * @param {*} defaultValue - 默认值
         * @returns {*} 解析后的数据
         */
        getStorage: function (key, defaultValue) {
            try {
                var value = localStorage.getItem(key);
                if (value === null || value === undefined) {
                    return defaultValue;
                }
                return JSON.parse(value);
            } catch (e) {
                console.warn('[SZ.themes] 读取 localStorage 失败:', key, e);
                return defaultValue;
            }
        },

        /**
         * 安全设置 localStorage 数据
         * @param {string} key - 存储键名
         * @param {*} value - 要存储的值
         */
        setStorage: function (key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('[SZ.themes] 写入 localStorage 失败:', key, e);
            }
        },

        /**
         * 删除 localStorage 数据
         * @param {string} key - 存储键名
         */
        removeStorage: function (key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('[SZ.themes] 删除 localStorage 失败:', key, e);
            }
        },

        /**
         * 深拷贝对象
         * @param {*} obj - 要拷贝的对象
         * @returns {*} 拷贝后的对象
         */
        deepClone: function (obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(function (item) { return utils.deepClone(item); });
            }
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = utils.deepClone(obj[key]);
                }
            }
            return result;
        },

        /**
         * 简单的对象合并（浅合并）
         */
        extend: function (target, source) {
            target = target || {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        },

        /**
         * 深合并对象
         */
        deepExtend: function (target, source) {
            target = target || {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        target[key] = utils.deepExtend(target[key] || {}, source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        },

        /**
         * 生成唯一ID
         */
        generateId: function () {
            return 'sz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 颜色值验证 - 十六进制颜色
         */
        isValidHex: function (color) {
            return /^#([0-9A-F]{3}){1,2}$/i.test(color);
        },

        /**
         * RGB转十六进制
         */
        rgbToHex: function (r, g, b) {
            return '#' + [r, g, b].map(function (x) {
                var hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },

        /**
         * 十六进制转RGB
         */
        hexToRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        },

        /**
         * 十六进制转RGBA字符串
         */
        hexToRgba: function (hex, alpha) {
            var c = utils.hexToRgb(hex);
            return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
        },

        /**
         * 数值限制在范围内
         */
        clamp: function (val, min, max) {
            return Math.max(min, Math.min(max, val));
        },

        /**
         * 事件触发器 - 简单的事件系统
         */
        createEventEmitter: function () {
            var events = {};
            return {
                on: function (event, callback) {
                    if (!events[event]) {
                        events[event] = [];
                    }
                    events[event].push(callback);
                    return function () {
                        events[event] = events[event].filter(function (cb) { return cb !== callback; });
                    };
                },
                emit: function (event, data) {
                    if (events[event]) {
                        events[event].forEach(function (cb) {
                            try { cb(data); } catch (e) { console.error(e); }
                        });
                    }
                },
                off: function (event, callback) {
                    if (events[event]) {
                        events[event] = events[event].filter(function (cb) { return cb !== callback; });
                    }
                }
            };
        },

        /**
         * 检查是否在浏览器环境
         */
        isBrowser: function () {
            return typeof document !== 'undefined' && typeof window !== 'undefined';
        },

        /**
         * 防抖函数
         */
        debounce: function (fn, delay) {
            var timer = null;
            return function () {
                var context = this;
                var args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },

        /**
         * 节流函数
         */
        throttle: function (fn, limit) {
            var inThrottle;
            return function () {
                var context = this;
                var args = arguments;
                if (!inThrottle) {
                    fn.apply(context, args);
                    inThrottle = true;
                    setTimeout(function () { return inThrottle = false; }, limit);
                }
            };
        }
    };

    // ============================================================
    //  主题数据定义 (56种主题)
    // ============================================================

    var THEME_DATA = [
        // ===== 简约系列 =====
        {
            id: 'default',
            name: '清新苹果风',
            description: '简洁清爽的苹果风格，明亮舒适，适合长时间刷题',
            category: 'minimal',
            particleTheme: 'default',
            iconStyle: 'linear',
            fontRecommendation: '苹方',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#0071e3',
                secondary: '#f5f5f7',
                accent: '#0071e3'
            },
            particleConfig: {
                colors: ['#0071e3', '#2997ff', '#5ac8fa', '#34c759'],
                particleCount: 30,
                particleTypes: ['circle', 'star'],
                connectLines: true,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_1',
            animationStyle: 'smooth'
        },
        {
            id: 'dark',
            name: '深色模式',
            description: '护眼深色主题，适合夜间刷题，降低视觉疲劳',
            category: 'minimal',
            particleTheme: 'dark',
            iconStyle: 'linear',
            fontRecommendation: '苹方',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#0a84ff',
                secondary: '#1c1c1e',
                accent: '#0a84ff'
            },
            particleConfig: {
                colors: ['#0a84ff', '#64d2ff', '#30d158', '#bf5af2'],
                particleCount: 35,
                particleTypes: ['circle', 'star'],
                connectLines: true,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_2',
            animationStyle: 'smooth'
        },
        {
            id: 'minimal-white',
            name: '极简白',
            description: '极致简约的纯白设计，去除一切干扰，专注刷题',
            category: 'minimal',
            particleTheme: 'minimal',
            iconStyle: 'outline',
            fontRecommendation: '思源黑体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#333333',
                secondary: '#ffffff',
                accent: '#333333'
            },
            particleConfig: {
                colors: ['#cccccc', '#dddddd', '#eeeeee'],
                particleCount: 15,
                particleTypes: ['circle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.3 },
                size: { min: 1, max: 2 }
            },
            soundStyle: 'correct_3',
            animationStyle: 'subtle'
        },
        {
            id: 'minimal-black',
            name: '极简黑',
            description: '纯黑极简风格，AMOLED友好，极致省电护眼',
            category: 'minimal',
            particleTheme: 'minimal',
            iconStyle: 'outline',
            fontRecommendation: '思源黑体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#ffffff',
                secondary: '#000000',
                accent: '#ffffff'
            },
            particleConfig: {
                colors: ['#333333', '#444444', '#555555'],
                particleCount: 15,
                particleTypes: ['circle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.3 },
                size: { min: 1, max: 2 }
            },
            soundStyle: 'correct_4',
            animationStyle: 'subtle'
        },
        {
            id: 'paper',
            name: '纸张质感',
            description: '模拟真实纸张质感，温润护眼，如阅读纸质书籍',
            category: 'minimal',
            particleTheme: 'paper',
            iconStyle: 'handdrawn',
            fontRecommendation: '宋体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#3d3d3d',
                secondary: '#f8f4e9',
                accent: '#8b7355'
            },
            particleConfig: {
                colors: ['#d4c5a9', '#c9b896', '#bfae83'],
                particleCount: 20,
                particleTypes: ['circle', 'triangle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.4 },
                size: { min: 1, max: 4 }
            },
            soundStyle: 'correct_5',
            animationStyle: 'gentle'
        },
        {
            id: 'parchment',
            name: '羊皮卷',
            description: '古典羊皮卷风格，复古文艺，沉浸式阅读体验',
            category: 'retro',
            particleTheme: 'parchment',
            iconStyle: 'handdrawn',
            fontRecommendation: '楷体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成100道题',
            colors: {
                primary: '#5c4a3d',
                secondary: '#f0e4c8',
                accent: '#8b6914'
            },
            particleConfig: {
                colors: ['#c9b896', '#a89060', '#8b7355'],
                particleCount: 25,
                particleTypes: ['circle', 'dust'],
                connectLines: false,
                speed: { min: 0.1, max: 0.3 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_6',
            animationStyle: 'gentle'
        },
        {
            id: 'fluent',
            name: 'Fluent设计',
            description: '微软Fluent Design风格，亚克力材质，现代感十足',
            category: 'tech',
            particleTheme: 'fluent',
            iconStyle: 'filled',
            fontRecommendation: '微软雅黑',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#0078d4',
                secondary: '#f3f3f3',
                accent: '#0078d4'
            },
            particleConfig: {
                colors: ['#0078d4', '#00bcf2', '#00b294', '#e81123'],
                particleCount: 35,
                particleTypes: ['circle', 'square'],
                connectLines: true,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_7',
            animationStyle: 'modern'
        },
        {
            id: 'material',
            name: 'Material设计',
            description: 'Google Material Design风格，层次分明，动感十足',
            category: 'tech',
            particleTheme: 'material',
            iconStyle: 'filled',
            fontRecommendation: 'Roboto',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#6200ee',
                secondary: '#fafafa',
                accent: '#6200ee'
            },
            particleConfig: {
                colors: ['#6200ee', '#03dac6', '#cf6679', '#bb86fc'],
                particleCount: 40,
                particleTypes: ['circle', 'rounded'],
                connectLines: false,
                speed: { min: 0.4, max: 1.0 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_8',
            animationStyle: 'bouncy'
        },

        // ===== 游戏系列 =====
        {
            id: 'pokemon',
            name: '宝可梦',
            description: '经典宝可梦风格，红黄蓝配色，充满童年回忆',
            category: 'game',
            particleTheme: 'pokemon',
            iconStyle: 'rounded',
            fontRecommendation: '像素字体',
            difficulty: 3,
            isPremium: false,
            unlockCondition: '完成50道题',
            colors: {
                primary: '#ffcb05',
                secondary: '#3b4cca',
                accent: '#ff0000'
            },
            particleConfig: {
                colors: ['#ffcb05', '#ff0000', '#3b4cca', '#00ff00', '#ffffff'],
                particleCount: 50,
                particleTypes: ['circle', 'star', 'pokeball'],
                connectLines: false,
                speed: { min: 0.5, max: 1.5 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_9',
            animationStyle: 'bouncy'
        },
        {
            id: 'cyberpunk',
            name: '赛博朋克',
            description: '霓虹闪烁的赛博朋克世界，未来感十足，炫酷无比',
            category: 'game',
            particleTheme: 'cyberpunk',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 4,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff00ff',
                secondary: '#0a0a1a',
                accent: '#00ffff'
            },
            particleConfig: {
                colors: ['#ff00ff', '#00ffff', '#ff2a6d', '#05d9e8', '#d1d7e0'],
                particleCount: 60,
                particleTypes: ['circle', 'glow', 'neon'],
                connectLines: true,
                speed: { min: 0.8, max: 2.0 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_10',
            animationStyle: 'flashy'
        },
        {
            id: 'stardew',
            name: '星露谷物语',
            description: '温馨像素农场风格，治愈系配色，放松刷题心情',
            category: 'game',
            particleTheme: 'stardew',
            iconStyle: 'pixel',
            fontRecommendation: '像素字体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成80道题',
            colors: {
                primary: '#7f6a4e',
                secondary: '#e5d9b6',
                accent: '#6b8e23'
            },
            particleConfig: {
                colors: ['#6b8e23', '#daa520', '#cd853f', '#8b4513', '#90ee90'],
                particleCount: 35,
                particleTypes: ['pixel', 'star', 'leaf'],
                connectLines: false,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_11',
            animationStyle: 'pixel'
        },
        {
            id: 'retro-wave',
            name: '复古浪潮',
            description: '80年代复古合成波风格，霓虹网格，怀旧未来感',
            category: 'retro',
            particleTheme: 'retroWave',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff6ad5',
                secondary: '#1a0a2e',
                accent: '#01cdfe'
            },
            particleConfig: {
                colors: ['#ff6ad5', '#01cdfe', '#ff71ce', '#05ffa1', '#b967ff'],
                particleCount: 45,
                particleTypes: ['circle', 'glow'],
                connectLines: true,
                speed: { min: 0.5, max: 1.2 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_12',
            animationStyle: 'flashy'
        },
        {
            id: 'vaporwave',
            name: '蒸汽波',
            description: '迷幻蒸汽波美学，粉紫渐变，复古电子感',
            category: 'art',
            particleTheme: 'vaporwave',
            iconStyle: 'duotone',
            fontRecommendation: '艺术字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff71ce',
                secondary: '#2b0b3a',
                accent: '#01cdfe'
            },
            particleConfig: {
                colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#fffb96', '#b967ff'],
                particleCount: 50,
                particleTypes: ['circle', 'star', 'triangle'],
                connectLines: true,
                speed: { min: 0.4, max: 1.0 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_13',
            animationStyle: 'dreamy'
        },
        {
            id: 'synthwave',
            name: '合成波',
            description: '电子合成波风格，深蓝紫红渐变，动感十足',
            category: 'retro',
            particleTheme: 'synthwave',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff2a6d',
                secondary: '#0d0221',
                accent: '#05d9e8'
            },
            particleConfig: {
                colors: ['#ff2a6d', '#05d9e8', '#d1d7e0', '#ff6ad5', '#7f00ff'],
                particleCount: 55,
                particleTypes: ['circle', 'glow', 'neon'],
                connectLines: true,
                speed: { min: 0.6, max: 1.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_14',
            animationStyle: 'flashy'
        },

        // ===== 编辑器系列 =====
        {
            id: 'nord',
            name: 'Nord极光',
            description: '北欧极光配色，清爽冷色调，代码编辑器风格',
            category: 'editor',
            particleTheme: 'nord',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#88c0d0',
                secondary: '#2e3440',
                accent: '#88c0d0'
            },
            particleConfig: {
                colors: ['#88c0d0', '#81a1c1', '#5e81ac', '#bf616a', '#a3be8c'],
                particleCount: 30,
                particleTypes: ['circle', 'snow'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_15',
            animationStyle: 'smooth'
        },
        {
            id: 'dracula',
            name: '德古拉',
            description: '经典暗色主题，深紫配色，程序员最爱',
            category: 'editor',
            particleTheme: 'dracula',
            iconStyle: 'linear',
            fontRecommendation: 'Fira Code',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#bd93f9',
                secondary: '#282a36',
                accent: '#bd93f9'
            },
            particleConfig: {
                colors: ['#bd93f9', '#ff79c6', '#50fa7b', '#f1fa8c', '#8be9fd'],
                particleCount: 35,
                particleTypes: ['circle', 'bat'],
                connectLines: false,
                speed: { min: 0.3, max: 0.7 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_16',
            animationStyle: 'smooth'
        },
        {
            id: 'monokai',
            name: 'Monokai',
            description: '经典Monokai配色，色彩丰富，代码高亮首选',
            category: 'editor',
            particleTheme: 'monokai',
            iconStyle: 'linear',
            fontRecommendation: 'Consolas',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#f92672',
                secondary: '#272822',
                accent: '#a6e22e'
            },
            particleConfig: {
                colors: ['#f92672', '#a6e22e', '#66d9ef', '#fd971f', '#ae81ff'],
                particleCount: 40,
                particleTypes: ['circle', 'code'],
                connectLines: false,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_17',
            animationStyle: 'smooth'
        },
        {
            id: 'gruvbox',
            name: 'Gruvbox',
            description: '复古暖色调编辑器主题，护眼舒适，怀旧风格',
            category: 'editor',
            particleTheme: 'gruvbox',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#fe8019',
                secondary: '#282828',
                accent: '#fabd2f'
            },
            particleConfig: {
                colors: ['#fe8019', '#fabd2f', '#b8bb26', '#8ec07c', '#fb4934'],
                particleCount: 30,
                particleTypes: ['circle', 'leaf'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_18',
            animationStyle: 'gentle'
        },
        {
            id: 'solarized-light',
            name: 'Solarized亮色',
            description: '精心设计的亮色配色方案，科学护眼，长时间使用',
            category: 'editor',
            particleTheme: 'solarized',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#268bd2',
                secondary: '#fdf6e3',
                accent: '#2aa198'
            },
            particleConfig: {
                colors: ['#268bd2', '#2aa198', '#859900', '#b58900', '#dc322f'],
                particleCount: 25,
                particleTypes: ['circle', 'sun'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_19',
            animationStyle: 'smooth'
        },
        {
            id: 'solarized-dark',
            name: 'Solarized暗色',
            description: 'Solarized暗色版本，同样科学护眼的深色方案',
            category: 'editor',
            particleTheme: 'solarized',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#268bd2',
                secondary: '#002b36',
                accent: '#2aa198'
            },
            particleConfig: {
                colors: ['#268bd2', '#2aa198', '#859900', '#b58900', '#dc322f'],
                particleCount: 25,
                particleTypes: ['circle', 'moon'],
                connectLines: false,
                speed: { min: 0.1, max: 0.4 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_20',
            animationStyle: 'smooth'
        },
        {
            id: 'tokyo-night',
            name: '东京之夜',
            description: '宁静的东京夜景配色，深蓝紫色调，优雅神秘',
            category: 'editor',
            particleTheme: 'tokyoNight',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成30道题',
            colors: {
                primary: '#7aa2f7',
                secondary: '#1a1b26',
                accent: '#bb9af7'
            },
            particleConfig: {
                colors: ['#7aa2f7', '#bb9af7', '#9ece6a', '#e0af68', '#f7768e'],
                particleCount: 40,
                particleTypes: ['circle', 'star', 'sakura'],
                connectLines: true,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 1, max: 4 }
            },
            soundStyle: 'correct_21',
            animationStyle: 'dreamy'
        },
        {
            id: 'catppuccin',
            name: '猫卡布奇诺',
            description: '柔和的暖色调配色，温馨舒适，像一杯拿铁咖啡',
            category: 'editor',
            particleTheme: 'catppuccin',
            iconStyle: 'rounded',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '完成20道题',
            colors: {
                primary: '#89b4fa',
                secondary: '#1e1e2e',
                accent: '#cba6f7'
            },
            particleConfig: {
                colors: ['#89b4fa', '#cba6f7', '#a6e3a1', '#f9e2af', '#f38ba8'],
                particleCount: 30,
                particleTypes: ['circle', 'cat'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_22',
            animationStyle: 'gentle'
        },
        {
            id: 'rose-pine',
            name: '玫瑰松',
            description: '优雅的玫瑰金配色，低调奢华，文艺青年首选',
            category: 'editor',
            particleTheme: 'rosePine',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ebbcba',
                secondary: '#191724',
                accent: '#9ccfd8'
            },
            particleConfig: {
                colors: ['#ebbcba', '#9ccfd8', '#31748f', '#f6c177', '#c4a7e7'],
                particleCount: 35,
                particleTypes: ['circle', 'rose', 'pine'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 4 }
            },
            soundStyle: 'correct_23',
            animationStyle: 'elegant'
        },
        {
            id: 'everforest',
            name: '永恒森林',
            description: '森林绿色调，护眼舒适，仿佛置身大自然',
            category: 'editor',
            particleTheme: 'everforest',
            iconStyle: 'linear',
            fontRecommendation: '等宽字体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '完成60道题',
            colors: {
                primary: '#a7c080',
                secondary: '#2d353b',
                accent: '#83c092'
            },
            particleConfig: {
                colors: ['#a7c080', '#83c092', '#dbbc7f', '#e69875', '#7fbbb3'],
                particleCount: 35,
                particleTypes: ['circle', 'leaf', 'tree'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_24',
            animationStyle: 'gentle'
        },

        // ===== 自然系列 =====
        {
            id: 'autumn',
            name: '金秋落叶',
            description: '秋日金黄枫叶，温暖橙红配色，收获季节的喜悦',
            category: 'nature',
            particleTheme: 'autumn',
            iconStyle: 'handdrawn',
            fontRecommendation: '宋体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#d35400',
                secondary: '#fef5e7',
                accent: '#e67e22'
            },
            particleConfig: {
                colors: ['#d35400', '#e67e22', '#f39c12', '#c0392b', '#8b4513'],
                particleCount: 45,
                particleTypes: ['leaf', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 3, max: 8 }
            },
            soundStyle: 'correct_25',
            animationStyle: 'gentle'
        },
        {
            id: 'spring',
            name: '春日繁花',
            description: '春天粉嫩花漾，清新嫩绿，充满生机与希望',
            category: 'nature',
            particleTheme: 'spring',
            iconStyle: 'rounded',
            fontRecommendation: '楷体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#e91e63',
                secondary: '#fce4ec',
                accent: '#8bc34a'
            },
            particleConfig: {
                colors: ['#e91e63', '#8bc34a', '#ffeb3b', '#ff9800', '#f8bbd9'],
                particleCount: 50,
                particleTypes: ['flower', 'petal', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_26',
            animationStyle: 'bouncy'
        },
        {
            id: 'summer',
            name: '夏日海滩',
            description: '阳光沙滩海浪，蓝色清凉配色，夏日度假感',
            category: 'nature',
            particleTheme: 'summer',
            iconStyle: 'filled',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#00bcd4',
                secondary: '#e0f7fa',
                accent: '#ff9800'
            },
            particleConfig: {
                colors: ['#00bcd4', '#ff9800', '#ffeb3b', '#4caf50', '#03a9f4'],
                particleCount: 45,
                particleTypes: ['wave', 'sun', 'circle'],
                connectLines: false,
                speed: { min: 0.4, max: 1.0 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_27',
            animationStyle: 'bouncy'
        },
        {
            id: 'winter',
            name: '冬日雪景',
            description: '纯白雪花飘落，冰蓝冷色调，宁静冬日氛围',
            category: 'nature',
            particleTheme: 'winter',
            iconStyle: 'outline',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#0288d1',
                secondary: '#e3f2fd',
                accent: '#b3e5fc'
            },
            particleConfig: {
                colors: ['#ffffff', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6'],
                particleCount: 60,
                particleTypes: ['snow', 'snowflake', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_28',
            animationStyle: 'gentle'
        },
        {
            id: 'ocean',
            name: '深海蓝调',
            description: '深邃海洋蓝色，神秘宁静，潜入知识的深海',
            category: 'nature',
            particleTheme: 'ocean',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成40道题',
            colors: {
                primary: '#0277bd',
                secondary: '#01579b',
                accent: '#4fc3f7'
            },
            particleConfig: {
                colors: ['#0277bd', '#4fc3f7', '#00e5ff', '#00bfa5', '#006064'],
                particleCount: 40,
                particleTypes: ['bubble', 'wave', 'fish'],
                connectLines: true,
                speed: { min: 0.3, max: 0.7 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_29',
            animationStyle: 'smooth'
        },
        {
            id: 'forest',
            name: '翠绿森林',
            description: '茂密森林绿色调，清新自然，提神醒脑',
            category: 'nature',
            particleTheme: 'forest',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成40道题',
            colors: {
                primary: '#2e7d32',
                secondary: '#e8f5e9',
                accent: '#66bb6a'
            },
            particleConfig: {
                colors: ['#2e7d32', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
                particleCount: 40,
                particleTypes: ['leaf', 'tree', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_30',
            animationStyle: 'gentle'
        },
        {
            id: 'desert',
            name: '沙漠黄昏',
            description: '金色沙漠日落，温暖橙红色调，壮丽辽阔',
            category: 'nature',
            particleTheme: 'desert',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成70道题',
            colors: {
                primary: '#e65100',
                secondary: '#fff3e0',
                accent: '#ff9800'
            },
            particleConfig: {
                colors: ['#e65100', '#ff9800', '#ffc107', '#bf360c', '#ffcc80'],
                particleCount: 35,
                particleTypes: ['sun', 'sand', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.7 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_31',
            animationStyle: 'smooth'
        },
        {
            id: 'mountain',
            name: '雪山之巅',
            description: '巍峨雪山蓝白配色，清冷高洁，勇攀知识高峰',
            category: 'nature',
            particleTheme: 'mountain',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成100道题',
            colors: {
                primary: '#1565c0',
                secondary: '#e3f2fd',
                accent: '#90caf9'
            },
            particleConfig: {
                colors: ['#1565c0', '#90caf9', '#e3f2fd', '#ffffff', '#64b5f6'],
                particleCount: 30,
                particleTypes: ['snow', 'mountain', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_32',
            animationStyle: 'elegant'
        },
        {
            id: 'galaxy',
            name: '璀璨星河',
            description: '浩瀚宇宙星空，深紫蓝色调，探索知识宇宙',
            category: 'nature',
            particleTheme: 'galaxy',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#7c4dff',
                secondary: '#1a1a2e',
                accent: '#00e5ff'
            },
            particleConfig: {
                colors: ['#7c4dff', '#00e5ff', '#ff4081', '#ffd740', '#69f0ae'],
                particleCount: 80,
                particleTypes: ['star', 'circle', 'planet'],
                connectLines: true,
                speed: { min: 0.1, max: 0.4 },
                size: { min: 1, max: 4 }
            },
            soundStyle: 'correct_33',
            animationStyle: 'dreamy'
        },
        {
            id: 'sunset',
            name: '落日余晖',
            description: '浪漫日落橙红色，温暖治愈，结束一天的学习',
            category: 'nature',
            particleTheme: 'sunset',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成50道题',
            colors: {
                primary: '#ff5722',
                secondary: '#fbe9e7',
                accent: '#ff9800'
            },
            particleConfig: {
                colors: ['#ff5722', '#ff9800', '#ffc107', '#e91e63', '#9c27b0'],
                particleCount: 40,
                particleTypes: ['sun', 'cloud', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_34',
            animationStyle: 'gentle'
        },
        {
            id: 'sunrise',
            name: '旭日东升',
            description: '清晨日出金粉色，充满希望，开启元气满满的一天',
            category: 'nature',
            particleTheme: 'sunrise',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成50道题',
            colors: {
                primary: '#ff7043',
                secondary: '#fff8e1',
                accent: '#ffca28'
            },
            particleConfig: {
                colors: ['#ff7043', '#ffca28', '#ffeb3b', '#f8bbd0', '#81d4fa'],
                particleCount: 40,
                particleTypes: ['sun', 'ray', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.7 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_35',
            animationStyle: 'bouncy'
        },

        // ===== 艺术/文化系列 =====
        {
            id: 'shinkai',
            name: '新海诚风',
            description: '新海诚动画风格，清新唯美，蓝天白云，少年感十足',
            category: 'art',
            particleTheme: 'shinkai',
            iconStyle: 'handdrawn',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#4a90d9',
                secondary: '#e8f4fd',
                accent: '#ff6b6b'
            },
            particleConfig: {
                colors: ['#4a90d9', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
                particleCount: 50,
                particleTypes: ['cloud', 'star', 'petal', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 2, max: 6 }
            },
            soundStyle: 'correct_36',
            animationStyle: 'dreamy'
        },
        {
            id: 'ink',
            name: '水墨丹青',
            description: '中国传统水墨画风格，黑白灰意境，诗意刷题',
            category: 'culture',
            particleTheme: 'ink',
            iconStyle: 'handdrawn',
            fontRecommendation: '楷体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#2c2c2c',
                secondary: '#f5f5f0',
                accent: '#8b4513'
            },
            particleConfig: {
                colors: ['#2c2c2c', '#555555', '#888888', '#aaaaaa', '#cccccc'],
                particleCount: 30,
                particleTypes: ['ink', 'brush', 'circle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.4 },
                size: { min: 3, max: 8 }
            },
            soundStyle: 'correct_37',
            animationStyle: 'elegant'
        },
        {
            id: 'liquidglass',
            name: '液态玻璃',
            description: '毛玻璃拟态效果，透明质感，现代简约高级感',
            category: 'tech',
            particleTheme: 'liquidGlass',
            iconStyle: 'linear',
            fontRecommendation: '苹方',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ffffff',
                secondary: 'rgba(255,255,255,0.1)',
                accent: '#007aff'
            },
            particleConfig: {
                colors: ['#ffffff', '#007aff', '#5ac8fa', '#34c759', '#ff9500'],
                particleCount: 40,
                particleTypes: ['circle', 'bubble', 'glass'],
                connectLines: false,
                speed: { min: 0.3, max: 0.8 },
                size: { min: 3, max: 8 }
            },
            soundStyle: 'correct_38',
            animationStyle: 'smooth'
        },
        {
            id: 'coffee',
            name: '咖啡时光',
            description: '浓郁咖啡棕色调，温暖醇厚，午后刷题好伴侣',
            category: 'art',
            particleTheme: 'coffee',
            iconStyle: 'handdrawn',
            fontRecommendation: '宋体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#6f4e37',
                secondary: '#f5e6d3',
                accent: '#8b4513'
            },
            particleConfig: {
                colors: ['#6f4e37', '#8b4513', '#a0522d', '#cd853f', '#d2691e'],
                particleCount: 25,
                particleTypes: ['coffee', 'steam', 'circle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.4 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_39',
            animationStyle: 'gentle'
        },
        {
            id: 'candy',
            name: '糖果乐园',
            description: '缤纷糖果色，甜美可爱，让刷题变得甜蜜有趣',
            category: 'art',
            particleTheme: 'candy',
            iconStyle: 'rounded',
            fontRecommendation: '圆体',
            difficulty: 3,
            isPremium: false,
            unlockCondition: '完成30道题',
            colors: {
                primary: '#ff69b4',
                secondary: '#fff0f5',
                accent: '#87ceeb'
            },
            particleConfig: {
                colors: ['#ff69b4', '#87ceeb', '#98fb98', '#ffa07a', '#dda0dd'],
                particleCount: 50,
                particleTypes: ['candy', 'star', 'heart', 'circle'],
                connectLines: false,
                speed: { min: 0.4, max: 1.0 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_40',
            animationStyle: 'bouncy'
        },
        {
            id: 'pastel',
            name: '马卡龙',
            description: '柔和马卡龙色系，低饱和度，温柔治愈',
            category: 'art',
            particleTheme: 'pastel',
            iconStyle: 'rounded',
            fontRecommendation: '圆体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '默认解锁',
            colors: {
                primary: '#b19cd9',
                secondary: '#fef9ff',
                accent: '#aec6cf'
            },
            particleConfig: {
                colors: ['#b19cd9', '#aec6cf', '#b5e7a0', '#fcb5b5', '#fdfd96'],
                particleCount: 35,
                particleTypes: ['circle', 'heart', 'star'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 3, max: 6 }
            },
            soundStyle: 'correct_41',
            animationStyle: 'gentle'
        },
        {
            id: 'neon-pink',
            name: '霓虹粉',
            description: '炫酷霓虹粉色，发光效果，夜店风十足',
            category: 'art',
            particleTheme: 'neonPink',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 4,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff1493',
                secondary: '#0a0a0a',
                accent: '#00ffff'
            },
            particleConfig: {
                colors: ['#ff1493', '#00ffff', '#ff00ff', '#39ff14', '#ffff00'],
                particleCount: 60,
                particleTypes: ['neon', 'glow', 'circle'],
                connectLines: true,
                speed: { min: 0.6, max: 1.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_42',
            animationStyle: 'flashy'
        },
        {
            id: 'neon-blue',
            name: '霓虹蓝',
            description: '冰蓝色霓虹光效，科技感爆棚，赛博朋克蓝',
            category: 'tech',
            particleTheme: 'neonBlue',
            iconStyle: 'neon',
            fontRecommendation: '等宽字体',
            difficulty: 4,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#00ffff',
                secondary: '#0a0a1a',
                accent: '#ff00ff'
            },
            particleConfig: {
                colors: ['#00ffff', '#ff00ff', '#0080ff', '#00ff80', '#8000ff'],
                particleCount: 60,
                particleTypes: ['neon', 'glow', 'circle'],
                connectLines: true,
                speed: { min: 0.6, max: 1.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_43',
            animationStyle: 'flashy'
        },

        // ===== 终端系列 =====
        {
            id: 'terminal-green',
            name: '绿色终端',
            description: '复古绿色CRT终端，黑客帝国既视感，极客范',
            category: 'tech',
            particleTheme: 'terminal',
            iconStyle: 'pixel',
            fontRecommendation: '等宽字体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成30道题',
            colors: {
                primary: '#33ff33',
                secondary: '#0a0a0a',
                accent: '#00ff00'
            },
            particleConfig: {
                colors: ['#33ff33', '#00ff00', '#00cc00', '#009900', '#66ff66'],
                particleCount: 40,
                particleTypes: ['text', 'code', 'matrix'],
                connectLines: false,
                speed: { min: 0.5, max: 1.5 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_44',
            animationStyle: 'tech'
        },
        {
            id: 'terminal-amber',
            name: '琥珀终端',
            description: '复古琥珀色CRT显示器，怀旧经典，老派程序员',
            category: 'tech',
            particleTheme: 'terminal',
            iconStyle: 'pixel',
            fontRecommendation: '等宽字体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成30道题',
            colors: {
                primary: '#ffb000',
                secondary: '#1a0f00',
                accent: '#ff8c00'
            },
            particleConfig: {
                colors: ['#ffb000', '#ff8c00', '#ff6600', '#ffcc00', '#cc8800'],
                particleCount: 40,
                particleTypes: ['text', 'code', 'pixel'],
                connectLines: false,
                speed: { min: 0.5, max: 1.5 },
                size: { min: 1, max: 3 }
            },
            soundStyle: 'correct_45',
            animationStyle: 'tech'
        },
        {
            id: 'matrix',
            name: '矩阵雨',
            description: '黑客帝国矩阵数字雨，代码流动，极客终极信仰',
            category: 'tech',
            particleTheme: 'matrix',
            iconStyle: 'pixel',
            fontRecommendation: '等宽字体',
            difficulty: 4,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#00ff41',
                secondary: '#000000',
                accent: '#00ff41'
            },
            particleConfig: {
                colors: ['#00ff41', '#00cc33', '#009922', '#006611', '#33ff66'],
                particleCount: 70,
                particleTypes: ['matrix', 'code', 'text'],
                connectLines: false,
                speed: { min: 1.0, max: 3.0 },
                size: { min: 1, max: 2 }
            },
            soundStyle: 'correct_46',
            animationStyle: 'flashy'
        },

        // ===== 文化系列 =====
        {
            id: 'japanese',
            name: '和风日式',
            description: '传统日式风格，樱花红白色，优雅精致',
            category: 'culture',
            particleTheme: 'japanese',
            iconStyle: 'handdrawn',
            fontRecommendation: '思源宋体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#bc2c2c',
                secondary: '#fefefe',
                accent: '#e8b4b8'
            },
            particleConfig: {
                colors: ['#bc2c2c', '#e8b4b8', '#fefefe', '#2c2c2c', '#f5e6e8'],
                particleCount: 45,
                particleTypes: ['sakura', 'fan', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_47',
            animationStyle: 'elegant'
        },
        {
            id: 'chinese',
            name: '中国风',
            description: '传统中国风，朱红金黄配色，古典雅致，书香门第',
            category: 'culture',
            particleTheme: 'chinese',
            iconStyle: 'handdrawn',
            fontRecommendation: '楷体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#c41e3a',
                secondary: '#fffaf0',
                accent: '#d4af37'
            },
            particleConfig: {
                colors: ['#c41e3a', '#d4af37', '#fffaf0', '#8b0000', '#ffd700'],
                particleCount: 40,
                particleTypes: ['flower', 'cloud', 'lantern', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_48',
            animationStyle: 'elegant'
        },
        {
            id: 'korean',
            name: '韩风',
            description: '清新韩式风格，粉嫩柔和，简约时尚',
            category: 'culture',
            particleTheme: 'korean',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成60道题',
            colors: {
                primary: '#e86a8e',
                secondary: '#fdf2f5',
                accent: '#a8d8ea'
            },
            particleConfig: {
                colors: ['#e86a8e', '#a8d8ea', '#fdf2f5', '#ffd3b6', '#c9b1ff'],
                particleCount: 40,
                particleTypes: ['heart', 'star', 'circle'],
                connectLines: false,
                speed: { min: 0.3, max: 0.7 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_49',
            animationStyle: 'bouncy'
        },
        {
            id: 'scandinavian',
            name: '北欧风',
            description: '斯堪的纳维亚简约风格，白木色调，清新自然',
            category: 'culture',
            particleTheme: 'scandinavian',
            iconStyle: 'linear',
            fontRecommendation: '思源黑体',
            difficulty: 1,
            isPremium: false,
            unlockCondition: '完成80道题',
            colors: {
                primary: '#5c7c8f',
                secondary: '#f9f9f7',
                accent: '#c4a77d'
            },
            particleConfig: {
                colors: ['#5c7c8f', '#c4a77d', '#f9f9f7', '#8eb8c9', '#d4c4a8'],
                particleCount: 25,
                particleTypes: ['leaf', 'snow', 'circle'],
                connectLines: false,
                speed: { min: 0.1, max: 0.3 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_50',
            animationStyle: 'gentle'
        },
        {
            id: 'bohemian',
            name: '波西米亚',
            description: '自由不羁的波西米亚风格，多彩民族风，随性浪漫',
            category: 'art',
            particleTheme: 'bohemian',
            iconStyle: 'handdrawn',
            fontRecommendation: '艺术字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#8b4513',
                secondary: '#f5e6d3',
                accent: '#d2691e'
            },
            particleConfig: {
                colors: ['#8b4513', '#d2691e', '#cd853f', '#daa520', '#b8860b'],
                particleCount: 45,
                particleTypes: ['feather', 'dreamcatcher', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.6 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_51',
            animationStyle: 'dreamy'
        },
        {
            id: 'industrial',
            name: '工业风',
            description: '粗犷工业风格，水泥金属质感，硬核刷题',
            category: 'tech',
            particleTheme: 'industrial',
            iconStyle: 'filled',
            fontRecommendation: '等宽字体',
            difficulty: 2,
            isPremium: false,
            unlockCondition: '完成90道题',
            colors: {
                primary: '#424242',
                secondary: '#212121',
                accent: '#ff5722'
            },
            particleConfig: {
                colors: ['#424242', '#ff5722', '#757575', '#9e9e9e', '#bdbdbd'],
                particleCount: 35,
                particleTypes: ['gear', 'bolt', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 2, max: 5 }
            },
            soundStyle: 'correct_52',
            animationStyle: 'tech'
        },

        // ===== 艺术设计系列 =====
        {
            id: 'steampunk',
            name: '蒸汽朋克',
            description: '维多利亚蒸汽时代风格，黄铜齿轮，机械美学',
            category: 'art',
            particleTheme: 'steampunk',
            iconStyle: 'handdrawn',
            fontRecommendation: '艺术字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#b8860b',
                secondary: '#2c1810',
                accent: '#cd853f'
            },
            particleConfig: {
                colors: ['#b8860b', '#cd853f', '#daa520', '#8b4513', '#d2691e'],
                particleCount: 40,
                particleTypes: ['gear', 'clock', 'steam', 'circle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 3, max: 7 }
            },
            soundStyle: 'correct_53',
            animationStyle: 'steampunk'
        },
        {
            id: 'artdeco',
            name: '装饰艺术',
            description: 'Art Deco奢华风格，几何金箔，盖茨比时代的华丽',
            category: 'art',
            particleTheme: 'artdeco',
            iconStyle: 'duotone',
            fontRecommendation: '艺术字体',
            difficulty: 3,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#d4af37',
                secondary: '#0a0a0a',
                accent: '#f5e6d3'
            },
            particleConfig: {
                colors: ['#d4af37', '#f5e6d3', '#0a0a0a', '#b8860b', '#ffd700'],
                particleCount: 35,
                particleTypes: ['diamond', 'triangle', 'star', 'circle'],
                connectLines: true,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 3, max: 6 }
            },
            soundStyle: 'correct_54',
            animationStyle: 'elegant'
        },
        {
            id: 'memphis',
            name: '孟菲斯',
            description: '80年代孟菲斯设计，大胆几何撞色，活泼俏皮',
            category: 'art',
            particleTheme: 'memphis',
            iconStyle: 'filled',
            fontRecommendation: '艺术字体',
            difficulty: 4,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#ff6b6b',
                secondary: '#ffe66d',
                accent: '#4ecdc4'
            },
            particleConfig: {
                colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff8c42', '#a8e6cf'],
                particleCount: 55,
                particleTypes: ['circle', 'triangle', 'square', 'zigzag', 'dots'],
                connectLines: false,
                speed: { min: 0.5, max: 1.2 },
                size: { min: 3, max: 8 }
            },
            soundStyle: 'correct_55',
            animationStyle: 'bouncy'
        },
        {
            id: 'bauhaus',
            name: '包豪斯',
            description: '包豪斯设计风格，几何原色，理性简约，现代设计之源',
            category: 'art',
            particleTheme: 'bauhaus',
            iconStyle: 'filled',
            fontRecommendation: '思源黑体',
            difficulty: 2,
            isPremium: true,
            unlockCondition: '高级主题',
            colors: {
                primary: '#e53935',
                secondary: '#ffffff',
                accent: '#1565c0'
            },
            particleConfig: {
                colors: ['#e53935', '#1565c0', '#fdd835', '#000000', '#ffffff'],
                particleCount: 30,
                particleTypes: ['circle', 'square', 'triangle'],
                connectLines: false,
                speed: { min: 0.2, max: 0.5 },
                size: { min: 4, max: 8 }
            },
            soundStyle: 'correct_56',
            animationStyle: 'modern'
        }
    ];

    // ============================================================
    //  字体数据定义
    // ============================================================

    var FONT_DATA = {
        chinese: [
            {
                id: 'pingfang',
                name: '苹方',
                nameEn: 'PingFang SC',
                fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif',
                category: 'sans-serif',
                description: '苹果系统默认中文字体，清晰现代',
                isDefault: true,
                weightSupport: ['light', 'normal', 'medium', 'semibold', 'bold']
            },
            {
                id: 'siyuan-hei',
                name: '思源黑体',
                nameEn: 'Source Han Sans CN',
                fontFamily: '"Source Han Sans CN", "Noto Sans CJK SC", "PingFang SC", sans-serif',
                category: 'sans-serif',
                description: 'Adobe与Google合作开源字体，完整字重',
                isDefault: false,
                weightSupport: ['light', 'normal', 'medium', 'semibold', 'bold']
            },
            {
                id: 'siyuan-song',
                name: '思源宋体',
                nameEn: 'Source Han Serif CN',
                fontFamily: '"Source Han Serif CN", "Noto Serif CJK SC", "Songti SC", serif',
                category: 'serif',
                description: '开源宋体，优雅的衬线字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'medium', 'semibold', 'bold']
            },
            {
                id: 'microsoft-yahei',
                name: '微软雅黑',
                nameEn: 'Microsoft YaHei',
                fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
                category: 'sans-serif',
                description: 'Windows系统默认中文字体',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'songti',
                name: '宋体',
                nameEn: 'SimSun',
                fontFamily: 'SimSun, "Songti SC", "Source Han Serif CN", serif',
                category: 'serif',
                description: '传统宋体，经典印刷字体',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'kaiti',
                name: '楷体',
                nameEn: 'KaiTi',
                fontFamily: 'KaiTi, "Kaiti SC", "STKaiti", serif',
                category: 'serif',
                description: '楷体书法风格，优雅手写感',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'heiti',
                name: '黑体',
                nameEn: 'SimHei',
                fontFamily: 'SimHei, "Heiti SC", "PingFang SC", sans-serif',
                category: 'sans-serif',
                description: '经典黑体，醒目有力',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'fangsong',
                name: '仿宋',
                nameEn: 'FangSong',
                fontFamily: 'FangSong, "FangSong_GB2312", "STFangsong", serif',
                category: 'serif',
                description: '仿宋字体，公文常用',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'yuanti',
                name: '圆体',
                nameEn: 'Yuanti SC',
                fontFamily: '"Yuanti SC", "STYuanti", "PingFang SC", sans-serif',
                category: 'sans-serif',
                description: '圆润可爱的圆体字',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'lishu',
                name: '隶书',
                nameEn: 'LiSu',
                fontFamily: 'LiSu, "STLiti", serif',
                category: 'serif',
                description: '隶书风格，古朴典雅',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'xihei',
                name: '细黑',
                nameEn: 'STXihei',
                fontFamily: 'STXihei, "PingFang SC", "Microsoft YaHei", sans-serif',
                category: 'sans-serif',
                description: '细黑体，轻盈优雅',
                isDefault: false,
                weightSupport: ['light', 'normal']
            },
            {
                id: 'xingkai',
                name: '行楷',
                nameEn: 'STXingkai',
                fontFamily: '"STXingkai", "Kaiti SC", cursive',
                category: 'cursive',
                description: '行楷字体，书法艺术感',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'xinwei',
                name: '新魏',
                nameEn: 'STXinwei',
                fontFamily: '"STXinwei", "STKaiti", serif',
                category: 'serif',
                description: '新魏体，刚劲有力',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'xiaowei',
                name: '小薇',
                nameEn: 'STXiaowei',
                fontFamily: '"STXiaowei", "Yuanti SC", sans-serif',
                category: 'sans-serif',
                description: '可爱的小薇字体',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'youyuan',
                name: '幼圆',
                nameEn: 'YouYuan',
                fontFamily: 'YouYuan, "Yuanti SC", sans-serif',
                category: 'sans-serif',
                description: '幼圆体，圆润可爱',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'shusong',
                name: '书宋',
                nameEn: 'STShusong',
                fontFamily: '"STShusong", SimSun, "Songti SC", serif',
                category: 'serif',
                description: '书宋体，书籍常用',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'zhongsong',
                name: '中宋',
                nameEn: 'STZhongsong',
                fontFamily: '"STZhongsong", SimSun, serif',
                category: 'serif',
                description: '中宋体，标题常用',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'fangsong-gb2312',
                name: '仿宋_GB2312',
                nameEn: 'FangSong_GB2312',
                fontFamily: '"FangSong_GB2312", FangSong, serif',
                category: 'serif',
                description: '国标仿宋，公文标准',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'kaiti-gb2312',
                name: '楷体_GB2312',
                nameEn: 'KaiTi_GB2312',
                fontFamily: '"KaiTi_GB2312", KaiTi, "Kaiti SC", serif',
                category: 'serif',
                description: '国标楷体，规范标准',
                isDefault: false,
                weightSupport: ['normal']
            },
            {
                id: 'pixel-cn',
                name: '像素字体',
                nameEn: 'Pixel Font',
                fontFamily: '"Press Start 2P", "ZCOOL KuaiLe", monospace',
                category: 'monospace',
                description: '复古像素风格，游戏感十足',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Press Start 2P'
            },
            {
                id: 'zcool-kuaile',
                name: '站酷快乐体',
                nameEn: 'ZCOOL KuaiLe',
                fontFamily: '"ZCOOL KuaiLe", "PingFang SC", cursive',
                category: 'cursive',
                description: '活泼可爱的手写风格字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'ZCOOL KuaiLe'
            },
            {
                id: 'zcool-qingke',
                name: '站酷庆科黄油体',
                nameEn: 'ZCOOL QingKe HuangYou',
                fontFamily: '"ZCOOL QingKe HuangYou", "PingFang SC", sans-serif',
                category: 'sans-serif',
                description: '圆润可爱的艺术字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'ZCOOL QingKe HuangYou'
            },
            {
                id: 'ma-shan-zheng',
                name: '马善政楷书',
                nameEn: 'Ma Shan Zheng',
                fontFamily: '"Ma Shan Zheng", "Kaiti SC", cursive',
                category: 'cursive',
                description: '书法风格的毛笔楷书',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Ma Shan Zheng'
            },
            {
                id: 'liu-jian-mao-cao',
                name: '刘建毛草',
                nameEn: 'Liu Jian Mao Cao',
                fontFamily: '"Liu Jian Mao Cao", cursive',
                category: 'cursive',
                description: '潇洒的草书字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Liu Jian Mao Cao'
            },
            {
                id: 'long-cang',
                name: '龙藏体',
                nameEn: 'Long Cang',
                fontFamily: '"Long Cang", cursive',
                category: 'cursive',
                description: '飘逸的手写书法字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Long Cang'
            }
        ],
        english: [
            {
                id: 'roboto',
                name: 'Roboto',
                nameEn: 'Roboto',
                fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
                category: 'sans-serif',
                description: 'Google官方字体，现代几何风格',
                isDefault: true,
                weightSupport: ['light', 'normal', 'medium', 'bold'],
                isGoogleFont: true,
                googleFont: 'Roboto'
            },
            {
                id: 'open-sans',
                name: 'Open Sans',
                nameEn: 'Open Sans',
                fontFamily: '"Open Sans", Arial, sans-serif',
                category: 'sans-serif',
                description: '人性化的无衬线字体，清晰易读',
                isDefault: false,
                weightSupport: ['light', 'normal', 'semibold', 'bold'],
                isGoogleFont: true,
                googleFont: 'Open Sans'
            },
            {
                id: 'lato',
                name: 'Lato',
                nameEn: 'Lato',
                fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
                category: 'sans-serif',
                description: '温暖而严肃的无衬线字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Lato'
            },
            {
                id: 'montserrat',
                name: 'Montserrat',
                nameEn: 'Montserrat',
                fontFamily: 'Montserrat, Arial, sans-serif',
                category: 'sans-serif',
                description: '几何风格的无衬线字体，现代感强',
                isDefault: false,
                weightSupport: ['light', 'normal', 'medium', 'bold'],
                isGoogleFont: true,
                googleFont: 'Montserrat'
            },
            {
                id: 'poppins',
                name: 'Poppins',
                nameEn: 'Poppins',
                fontFamily: 'Poppins, Arial, sans-serif',
                category: 'sans-serif',
                description: '几何无衬线字体，优雅时尚',
                isDefault: false,
                weightSupport: ['light', 'normal', 'medium', 'bold'],
                isGoogleFont: true,
                googleFont: 'Poppins'
            },
            {
                id: 'raleway',
                name: 'Raleway',
                nameEn: 'Raleway',
                fontFamily: 'Raleway, Arial, sans-serif',
                category: 'sans-serif',
                description: '优雅的无衬线字体，细线风格',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Raleway'
            },
            {
                id: 'merriweather',
                name: 'Merriweather',
                nameEn: 'Merriweather',
                fontFamily: 'Merriweather, Georgia, serif',
                category: 'serif',
                description: '适合屏幕阅读的衬线字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Merriweather'
            },
            {
                id: 'playfair-display',
                name: 'Playfair Display',
                nameEn: 'Playfair Display',
                fontFamily: '"Playfair Display", Georgia, serif',
                category: 'serif',
                description: '优雅的衬线字体，适合标题',
                isDefault: false,
                weightSupport: ['normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Playfair Display'
            },
            {
                id: 'source-code-pro',
                name: 'Source Code Pro',
                nameEn: 'Source Code Pro',
                fontFamily: '"Source Code Pro", "Fira Code", Consolas, monospace',
                category: 'monospace',
                description: 'Adobe出品的编程等宽字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Source Code Pro'
            },
            {
                id: 'fira-code',
                name: 'Fira Code',
                nameEn: 'Fira Code',
                fontFamily: '"Fira Code", "Source Code Pro", Consolas, monospace',
                category: 'monospace',
                description: '带编程连字的等宽字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Fira Code'
            },
            {
                id: 'jetbrains-mono',
                name: 'JetBrains Mono',
                nameEn: 'JetBrains Mono',
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
                category: 'monospace',
                description: 'JetBrains出品的编程字体',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'JetBrains Mono'
            },
            {
                id: 'consolas',
                name: 'Consolas',
                nameEn: 'Consolas',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                category: 'monospace',
                description: 'Windows系统默认等宽字体',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'courier-new',
                name: 'Courier New',
                nameEn: 'Courier New',
                fontFamily: '"Courier New", Courier, monospace',
                category: 'monospace',
                description: '经典等宽打字机字体',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'georgia',
                name: 'Georgia',
                nameEn: 'Georgia',
                fontFamily: 'Georgia, "Times New Roman", serif',
                category: 'serif',
                description: '经典衬线字体，屏幕可读性好',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'times-new-roman',
                name: 'Times New Roman',
                nameEn: 'Times New Roman',
                fontFamily: '"Times New Roman", Times, serif',
                category: 'serif',
                description: '经典衬线字体，印刷标准',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'arial',
                name: 'Arial',
                nameEn: 'Arial',
                fontFamily: 'Arial, Helvetica, sans-serif',
                category: 'sans-serif',
                description: '最经典的无衬线字体',
                isDefault: false,
                weightSupport: ['normal', 'bold']
            },
            {
                id: 'helvetica',
                name: 'Helvetica',
                nameEn: 'Helvetica',
                fontFamily: 'Helvetica, Arial, sans-serif',
                category: 'sans-serif',
                description: '传奇无衬线字体，设计经典',
                isDefault: false,
                weightSupport: ['light', 'normal', 'bold']
            },
            {
                id: 'dancing-script',
                name: 'Dancing Script',
                nameEn: 'Dancing Script',
                fontFamily: '"Dancing Script", cursive',
                category: 'cursive',
                description: '优雅的手写草书字体',
                isDefault: false,
                weightSupport: ['normal', 'bold'],
                isGoogleFont: true,
                googleFont: 'Dancing Script'
            },
            {
                id: 'pacifico',
                name: 'Pacifico',
                nameEn: 'Pacifico',
                fontFamily: 'Pacifico, cursive',
                category: 'cursive',
                description: '有趣的手写风格字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Pacifico'
            },
            {
                id: 'press-start-2p',
                name: 'Press Start 2P',
                nameEn: 'Press Start 2P',
                fontFamily: '"Press Start 2P", monospace',
                category: 'monospace',
                description: '复古像素风格字体',
                isDefault: false,
                weightSupport: ['normal'],
                isGoogleFont: true,
                googleFont: 'Press Start 2P'
            }
        ]
    };

    // ============================================================
    //  图标数据定义
    // ============================================================

    var ICON_DATA = {
        home: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" opacity="0.3"></path><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="10" y="2" width="4" height="2"/><rect x="8" y="4" width="8" height="2"/><rect x="6" y="6" width="12" height="2"/><rect x="4" y="8" width="16" height="2"/><rect x="4" y="10" width="2" height="10"/><rect x="18" y="10" width="2" height="10"/><rect x="8" y="12" width="2" height="8"/><rect x="14" y="12" width="2" height="8"/><rect x="10" y="12" width="4" height="4"/></svg>'
        },
        settings: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"></path></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3" opacity="0.3"></circle><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="10" y="2" width="4" height="2"/><rect x="10" y="4" width="4" height="2"/><rect x="8" y="6" width="2" height="2"/><rect x="14" y="6" width="2" height="2"/><rect x="6" y="8" width="2" height="2"/><rect x="16" y="8" width="2" height="2"/><rect x="4" y="10" width="2" height="4"/><rect x="18" y="10" width="2" height="4"/><rect x="6" y="14" width="2" height="2"/><rect x="16" y="14" width="2" height="2"/><rect x="8" y="16" width="2" height="2"/><rect x="14" y="16" width="2" height="2"/><rect x="10" y="18" width="4" height="2"/><rect x="10" y="20" width="4" height="2"/><rect x="10" y="10" width="4" height="4"/></svg>'
        },
        star: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" opacity="0.3"></polygon><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2"></polygon></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="11" y="2" width="2" height="2"/><rect x="10" y="4" width="4" height="2"/><rect x="9" y="6" width="6" height="2"/><rect x="2" y="8" width="20" height="2"/><rect x="4" y="10" width="16" height="2"/><rect x="6" y="12" width="12" height="2"/><rect x="4" y="14" width="6" height="2"/><rect x="14" y="14" width="6" height="2"/><rect x="2" y="16" width="4" height="2"/><rect x="18" y="16" width="4" height="2"/><rect x="2" y="18" width="4" height="2"/><rect x="18" y="18" width="4" height="2"/></svg>'
        },
        book: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5z"></path></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" opacity="0.3"></path><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" fill="none"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" fill="none"></path></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="4" y="4" width="2" height="16"/><rect x="6" y="3" width="12" height="18"/><rect x="18" y="4" width="2" height="16"/><rect x="8" y="6" width="8" height="2"/><rect x="8" y="10" width="8" height="2"/><rect x="8" y="14" width="6" height="2"/></svg>'
        },
        check: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.3"></circle><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"></path></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="10" y="4" width="2" height="2"/><rect x="8" y="6" width="2" height="2"/><rect x="6" y="8" width="2" height="2"/><rect x="4" y="10" width="2" height="2"/><rect x="6" y="12" width="2" height="2"/><rect x="8" y="14" width="2" height="2"/><rect x="10" y="16" width="2" height="2"/><rect x="12" y="14" width="2" height="2"/><rect x="14" y="12" width="2" height="2"/><rect x="16" y="10" width="2" height="2"/><rect x="18" y="8" width="2" height="2"/><rect x="20" y="6" width="2" height="2"/></svg>'
        },
        x: {
            linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            filled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>',
            duotone: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.3"></circle><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"></path></svg>',
            pixel: '<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><rect x="4" y="4" width="2" height="2"/><rect x="6" y="6" width="2" height="2"/><rect x="8" y="8" width="2" height="2"/><rect x="10" y="10" width="4" height="4"/><rect x="14" y="8" width="2" height="2"/><rect x="16" y="6" width="2" height="2"/><rect x="18" y="4" width="2" height="2"/><rect x="18" y="18" width="2" height="2"/><rect x="16" y="16" width="2" height="2"/><rect x="14" y="14" width="2" height="2"/><rect x="8" y="14" width="2" height="2"/><rect x="6" y="16" width="2" height="2"/><rect x="4" y="18" width="2" height="2"/></svg>'
        }
    };

    // ============================================================
    //  默认配置
    // ============================================================

    var DEFAULT_SETTINGS = {
        theme: {
            currentThemeId: DEFAULT_THEME_ID,
            favorites: [],
            frequent: [],
            previewEnabled: true
        },
        font: {
            fontFamily: 'pingfang',
            fontSize: 'medium',
            fontWeight: 'normal',
            lineHeight: 'normal',
            googleFontsEnabled: true
        },
        background: {
            mode: 'theme', // theme, color, image, gradient, pattern, custom
            color: '#f5f5f7',
            image: '',
            imageOpacity: 0.1,
            imageBlur: 0,
            brightness: 100,
            saturation: 100,
            filter: 'none',
            gradient: {
                type: 'linear',
                angle: 135,
                stops: [
                    { color: '#667eea', position: 0 },
                    { color: '#764ba2', position: 100 }
                ]
            },
            pattern: {
                type: 'dots',
                color: '#000000',
                size: 20,
                opacity: 0.05
            },
            customCss: ''
        },
        icons: {
            style: 'linear',
            size: 24
        },
        effects: {
            particlesEnabled: true,
            soundStyleEnabled: true,
            animationEnabled: true
        }
    };

    // ============================================================
    //  ThemeManager - 主题管理器
    // ============================================================

    var ThemeManager = (function () {
        /**
         * 构造函数
         */
        function ThemeManager() {
            this.currentThemeId = utils.getStorage(STORAGE_KEYS.CURRENT_THEME, DEFAULT_THEME_ID);
            this.favorites = utils.getStorage(STORAGE_KEYS.FAVORITE_THEMES, []);
            this.frequent = utils.getStorage(STORAGE_KEYS.FREQUENT_THEMES, []);
            this.previousThemeId = null;
            this.eventEmitter = utils.createEventEmitter();
            this._init();
        }

        /**
         * 初始化
         */
        ThemeManager.prototype._init = function () {
            if (utils.isBrowser()) {
                this._applyThemeToBody(this.currentThemeId);
            }
        };

        /**
         * 获取主题列表
         * @param {Object} options - 过滤选项
         * @param {string} options.category - 按分类过滤
         * @param {boolean} options.premiumOnly - 只显示高级主题
         * @param {string} options.search - 搜索关键词
         * @returns {Array} 主题列表
         */
        ThemeManager.prototype.getThemeList = function (options) {
            options = options || {};
            var list = utils.deepClone(THEME_DATA);

            if (options.category) {
                list = list.filter(function (t) { return t.category === options.category; });
            }

            if (options.premiumOnly) {
                list = list.filter(function (t) { return t.isPremium; });
            }

            if (options.search) {
                var keyword = options.search.toLowerCase();
                list = list.filter(function (t) {
                    return t.name.toLowerCase().indexOf(keyword) !== -1 ||
                        t.description.toLowerCase().indexOf(keyword) !== -1 ||
                        t.id.toLowerCase().indexOf(keyword) !== -1;
                });
            }

            return list;
        };

        /**
         * 获取当前主题
         * @returns {Object} 当前主题对象
         */
        ThemeManager.prototype.getCurrentTheme = function () {
            return this.getThemeById(this.currentThemeId) || THEME_DATA[0];
        };

        /**
         * 根据ID获取主题
         * @param {string} themeId - 主题ID
         * @returns {Object|null} 主题对象
         */
        ThemeManager.prototype.getThemeById = function (themeId) {
            for (var i = 0; i < THEME_DATA.length; i++) {
                if (THEME_DATA[i].id === themeId) {
                    return utils.deepClone(THEME_DATA[i]);
                }
            }
            return null;
        };

        /**
         * 设置主题
         * @param {string} themeId - 主题ID
         * @returns {boolean} 是否设置成功
         */
        ThemeManager.prototype.setTheme = function (themeId) {
            var theme = this.getThemeById(themeId);
            if (!theme) {
                console.warn('[SZ.themes] 主题不存在:', themeId);
                return false;
            }

            this.previousThemeId = this.currentThemeId;
            this.currentThemeId = themeId;
            utils.setStorage(STORAGE_KEYS.CURRENT_THEME, themeId);

            if (utils.isBrowser()) {
                this._applyThemeToBody(themeId);
                this._triggerThemeChange(theme);
            }

            this._updateFrequent(themeId);
            this.eventEmitter.emit('change', { themeId: themeId, theme: theme });

            return true;
        };

        /**
         * 应用主题类名到body
         */
        ThemeManager.prototype._applyThemeToBody = function (themeId) {
            if (!document.body) return;

            // 移除所有theme-开头的类
            var classes = document.body.className.split(' ').filter(function (cls) {
                return cls.indexOf('theme-') !== 0;
            });

            classes.push('theme-' + themeId);
            document.body.className = classes.join(' ');
        };

        /**
         * 触发主题变更联动效果
         */
        ThemeManager.prototype._triggerThemeChange = function (theme) {
            // 粒子特效联动
            if (window.SZ && window.SZ.particles && typeof window.SZ.particles.setBackgroundTheme === 'function') {
                try {
                    window.SZ.particles.setBackgroundTheme(theme.particleConfig);
                } catch (e) {
                    console.warn('[SZ.themes] 粒子特效联动失败:', e);
                }
            }

            // 音效风格联动
            if (window.SZ && window.SZ.sounds && typeof window.SZ.sounds.setCorrectStyle === 'function') {
                try {
                    window.SZ.sounds.setCorrectStyle(theme.soundStyle);
                } catch (e) {
                    console.warn('[SZ.themes] 音效风格联动失败:', e);
                }
            }

            // 图标风格联动
            if (theme.iconStyle && SZT.getIconManager && typeof SZT.getIconManager().setIconStyle === 'function') {
                try {
                    SZT.getIconManager().setIconStyle(theme.iconStyle);
                } catch (e) {
                    console.warn('[SZ.themes] 图标风格联动失败:', e);
                }
            }
        };

        /**
         * 更新常用主题记录
         */
        ThemeManager.prototype._updateFrequent = function (themeId) {
            var freq = this.frequent.filter(function (item) {
                return item.id !== themeId;
            });

            freq.unshift({ id: themeId, count: 1, lastUsed: Date.now() });

            // 只保留前20个
            if (freq.length > 20) {
                freq = freq.slice(0, 20);
            }

            this.frequent = freq;
            utils.setStorage(STORAGE_KEYS.FREQUENT_THEMES, freq);
        };

        /**
         * 主题预览 - 临时切换（hover效果）
         * @param {string} themeId - 主题ID
         */
        ThemeManager.prototype.previewTheme = function (themeId) {
            if (!this.previewEnabled) return;
            if (!utils.isBrowser()) return;

            var theme = this.getThemeById(themeId);
            if (!theme) return;

            this._applyThemeToBody(themeId);
            this.eventEmitter.emit('preview', { themeId: themeId, theme: theme });
        };

        /**
         * 结束预览，恢复当前主题
         */
        ThemeManager.prototype.endPreview = function () {
            if (!utils.isBrowser()) return;
            this._applyThemeToBody(this.currentThemeId);
            this.eventEmitter.emit('previewEnd', { themeId: this.currentThemeId });
        };

        /**
         * 启用/禁用预览
         */
        ThemeManager.prototype.setPreviewEnabled = function (enabled) {
            this.previewEnabled = enabled;
        };

        /**
         * 收藏主题
         * @param {string} themeId - 主题ID
         * @returns {boolean} 是否收藏成功
         */
        ThemeManager.prototype.addFavorite = function (themeId) {
            if (!this.getThemeById(themeId)) return false;
            if (this.isFavorite(themeId)) return false;

            this.favorites.push(themeId);
            utils.setStorage(STORAGE_KEYS.FAVORITE_THEMES, this.favorites);
            this.eventEmitter.emit('favoriteChange', { themeId: themeId, action: 'add' });
            return true;
        };

        /**
         * 取消收藏
         * @param {string} themeId - 主题ID
         * @returns {boolean} 是否取消成功
         */
        ThemeManager.prototype.removeFavorite = function (themeId) {
            var index = this.favorites.indexOf(themeId);
            if (index === -1) return false;

            this.favorites.splice(index, 1);
            utils.setStorage(STORAGE_KEYS.FAVORITE_THEMES, this.favorites);
            this.eventEmitter.emit('favoriteChange', { themeId: themeId, action: 'remove' });
            return true;
        };

        /**
         * 切换收藏状态
         * @param {string} themeId - 主题ID
         * @returns {boolean} 新的收藏状态
         */
        ThemeManager.prototype.toggleFavorite = function (themeId) {
            if (this.isFavorite(themeId)) {
                this.removeFavorite(themeId);
                return false;
            } else {
                this.addFavorite(themeId);
                return true;
            }
        };

        /**
         * 检查是否已收藏
         * @param {string} themeId - 主题ID
         * @returns {boolean} 是否已收藏
         */
        ThemeManager.prototype.isFavorite = function (themeId) {
            return this.favorites.indexOf(themeId) !== -1;
        };

        /**
         * 获取收藏的主题列表
         * @returns {Array} 收藏的主题列表
         */
        ThemeManager.prototype.getFavorites = function () {
            var self = this;
            return this.favorites.map(function (id) {
                return self.getThemeById(id);
            }).filter(function (t) { return t !== null; });
        };

        /**
         * 获取常用主题列表
         * @param {number} limit - 返回数量限制
         * @returns {Array} 常用主题列表
         */
        ThemeManager.prototype.getFrequent = function (limit) {
            limit = limit || 10;
            var self = this;
            return this.frequent.slice(0, limit).map(function (item) {
                var theme = self.getThemeById(item.id);
                if (theme) {
                    theme.useCount = item.count;
                    theme.lastUsed = item.lastUsed;
                }
                return theme;
            }).filter(function (t) { return t !== null; });
        };

        /**
         * 按分类获取主题
         * @param {string} category - 分类名
         * @returns {Array} 主题列表
         */
        ThemeManager.prototype.getThemesByCategory = function (category) {
            return this.getThemeList({ category: category });
        };

        /**
         * 获取所有分类
         * @returns {Object} 分类对象
         */
        ThemeManager.prototype.getCategories = function () {
            return utils.deepClone(THEME_CATEGORIES);
        };

        /**
         * 获取上一个主题
         * @returns {Object|null} 上一个主题
         */
        ThemeManager.prototype.getPreviousTheme = function () {
            if (!this.previousThemeId) return null;
            return this.getThemeById(this.previousThemeId);
        };

        /**
         * 回退到上一个主题
         * @returns {boolean} 是否回退成功
         */
        ThemeManager.prototype.revertToPrevious = function () {
            if (!this.previousThemeId) return false;
            return this.setTheme(this.previousThemeId);
        };

        /**
         * 随机切换主题
         * @param {Object} options - 选项
         * @returns {Object} 新主题
         */
        ThemeManager.prototype.randomTheme = function (options) {
            options = options || {};
            var list = this.getThemeList(options);
            if (list.length === 0) return null;

            // 排除当前主题
            list = list.filter(function (t) { return t.id !== this.currentThemeId; }.bind(this));
            if (list.length === 0) return null;

            var randomIndex = Math.floor(Math.random() * list.length);
            var theme = list[randomIndex];
            this.setTheme(theme.id);
            return theme;
        };

        /**
         * 事件监听
         */
        ThemeManager.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return ThemeManager;
    })();

    // ============================================================
    //  FontManager - 字体管理器
    // ============================================================

    var FontManager = (function () {
        /**
         * 构造函数
         */
        function FontManager() {
            this.currentFontId = utils.getStorage(STORAGE_KEYS.FONT_FAMILY, 'pingfang');
            this.fontSize = utils.getStorage(STORAGE_KEYS.FONT_SIZE, 'medium');
            this.fontWeight = utils.getStorage(STORAGE_KEYS.FONT_WEIGHT, 'normal');
            this.lineHeight = utils.getStorage(STORAGE_KEYS.LINE_HEIGHT, 'normal');
            this.googleFontsLoaded = {};
            this.googleFontsEnabled = true;
            this.eventEmitter = utils.createEventEmitter();
            this._init();
        }

        /**
         * 初始化
         */
        FontManager.prototype._init = function () {
            if (!utils.isBrowser()) return;
            this._applyFontFamily();
            this._applyFontSize();
            this._applyFontWeight();
            this._applyLineHeight();
        };

        /**
         * 获取所有字体列表
         * @param {Object} options - 选项
         * @param {string} options.type - 类型: chinese/english/all
         * @returns {Array} 字体列表
         */
        FontManager.prototype.getFontList = function (options) {
            options = options || {};
            var type = options.type || 'all';
            var list = [];

            if (type === 'chinese' || type === 'all') {
                list = list.concat(utils.deepClone(FONT_DATA.chinese));
            }
            if (type === 'english' || type === 'all') {
                list = list.concat(utils.deepClone(FONT_DATA.english));
            }

            return list;
        };

        /**
         * 获取中文字体列表
         * @returns {Array} 中文字体列表
         */
        FontManager.prototype.getChineseFonts = function () {
            return utils.deepClone(FONT_DATA.chinese);
        };

        /**
         * 获取英文字体列表
         * @returns {Array} 英文字体列表
         */
        FontManager.prototype.getEnglishFonts = function () {
            return utils.deepClone(FONT_DATA.english);
        };

        /**
         * 根据ID获取字体
         * @param {string} fontId - 字体ID
         * @returns {Object|null} 字体对象
         */
        FontManager.prototype.getFontById = function (fontId) {
            var allFonts = FONT_DATA.chinese.concat(FONT_DATA.english);
            for (var i = 0; i < allFonts.length; i++) {
                if (allFonts[i].id === fontId) {
                    return utils.deepClone(allFonts[i]);
                }
            }
            return null;
        };

        /**
         * 设置字体
         * @param {string} fontId - 字体ID
         * @returns {boolean} 是否设置成功
         */
        FontManager.prototype.setFont = function (fontId) {
            var font = this.getFontById(fontId);
            if (!font) {
                console.warn('[SZ.themes] 字体不存在:', fontId);
                return false;
            }

            this.currentFontId = fontId;
            utils.setStorage(STORAGE_KEYS.FONT_FAMILY, fontId);

            // 如果是Google Fonts，加载字体
            if (font.isGoogleFont && font.googleFont && this.googleFontsEnabled) {
                this._loadGoogleFont(font.googleFont);
            }

            this._applyFontFamily();
            this.eventEmitter.emit('fontChange', { fontId: fontId, font: font });
            return true;
        };

        /**
         * 应用字体族到页面
         */
        FontManager.prototype._applyFontFamily = function () {
            if (!utils.isBrowser() || !document.documentElement) return;
            var font = this.getFontById(this.currentFontId);
            if (!font) return;
            document.documentElement.style.setProperty('--font-family', font.fontFamily);
        };

        /**
         * 加载Google Fonts
         */
        FontManager.prototype._loadGoogleFont = function (fontName) {
            if (!utils.isBrowser()) return;
            if (this.googleFontsLoaded[fontName]) return;

            var linkId = 'sz-google-font-' + fontName.replace(/\s+/g, '-').toLowerCase();
            if (document.getElementById(linkId)) {
                this.googleFontsLoaded[fontName] = true;
                return;
            }

            var link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontName) + ':wght@300;400;500;700&display=swap';
            document.head.appendChild(link);

            this.googleFontsLoaded[fontName] = true;
        };

        /**
         * 设置字体大小
         * @param {string} size - 大小档位: small/medium/large/xlarge
         * @returns {boolean} 是否设置成功
         */
        FontManager.prototype.setFontSize = function (size) {
            if (!FONT_SIZE_LEVELS[size]) {
                console.warn('[SZ.themes] 无效的字体大小:', size);
                return false;
            }

            this.fontSize = size;
            utils.setStorage(STORAGE_KEYS.FONT_SIZE, size);
            this._applyFontSize();
            this.eventEmitter.emit('fontSizeChange', { size: size, config: FONT_SIZE_LEVELS[size] });
            return true;
        };

        /**
         * 应用字体大小
         */
        FontManager.prototype._applyFontSize = function () {
            if (!utils.isBrowser() || !document.documentElement) return;
            var sizeConfig = FONT_SIZE_LEVELS[this.fontSize];
            if (sizeConfig) {
                document.documentElement.style.setProperty('--font-size-base', sizeConfig.value);
                document.documentElement.style.fontSize = sizeConfig.value;
            }
        };

        /**
         * 设置字体粗细
         * @param {string} weight - 粗细档位: light/normal/medium/semibold/bold
         * @returns {boolean} 是否设置成功
         */
        FontManager.prototype.setFontWeight = function (weight) {
            if (!FONT_WEIGHT_LEVELS[weight]) {
                console.warn('[SZ.themes] 无效的字体粗细:', weight);
                return false;
            }

            this.fontWeight = weight;
            utils.setStorage(STORAGE_KEYS.FONT_WEIGHT, weight);
            this._applyFontWeight();
            this.eventEmitter.emit('fontWeightChange', { weight: weight, config: FONT_WEIGHT_LEVELS[weight] });
            return true;
        };

        /**
         * 应用字体粗细
         */
        FontManager.prototype._applyFontWeight = function () {
            if (!utils.isBrowser() || !document.documentElement) return;
            var weightConfig = FONT_WEIGHT_LEVELS[this.fontWeight];
            if (weightConfig) {
                document.documentElement.style.setProperty('--font-weight', weightConfig.value);
            }
        };

        /**
         * 设置行高
         * @param {string} lineHeight - 行高档位: tight/normal/relaxed/loose
         * @returns {boolean} 是否设置成功
         */
        FontManager.prototype.setLineHeight = function (lineHeight) {
            if (!LINE_HEIGHT_LEVELS[lineHeight]) {
                console.warn('[SZ.themes] 无效的行高:', lineHeight);
                return false;
            }

            this.lineHeight = lineHeight;
            utils.setStorage(STORAGE_KEYS.LINE_HEIGHT, lineHeight);
            this._applyLineHeight();
            this.eventEmitter.emit('lineHeightChange', { lineHeight: lineHeight, config: LINE_HEIGHT_LEVELS[lineHeight] });
            return true;
        };

        /**
         * 应用行高
         */
        FontManager.prototype._applyLineHeight = function () {
            if (!utils.isBrowser() || !document.documentElement) return;
            var lhConfig = LINE_HEIGHT_LEVELS[this.lineHeight];
            if (lhConfig) {
                document.documentElement.style.setProperty('--line-height', lhConfig.value);
            }
        };

        /**
         * 获取当前字体
         * @returns {Object} 当前字体对象
         */
        FontManager.prototype.getCurrentFont = function () {
            return this.getFontById(this.currentFontId);
        };

        /**
         * 获取当前字体大小配置
         * @returns {Object} 字体大小配置
         */
        FontManager.prototype.getCurrentFontSize = function () {
            return FONT_SIZE_LEVELS[this.fontSize];
        };

        /**
         * 获取当前字体粗细配置
         * @returns {Object} 字体粗细配置
         */
        FontManager.prototype.getCurrentFontWeight = function () {
            return FONT_WEIGHT_LEVELS[this.fontWeight];
        };

        /**
         * 获取当前行高配置
         * @returns {Object} 行高配置
         */
        FontManager.prototype.getCurrentLineHeight = function () {
            return LINE_HEIGHT_LEVELS[this.lineHeight];
        };

        /**
         * 获取字体大小档位列表
         * @returns {Object} 字体大小档位
         */
        FontManager.prototype.getFontSizeLevels = function () {
            return utils.deepClone(FONT_SIZE_LEVELS);
        };

        /**
         * 获取字体粗细档位列表
         * @returns {Object} 字体粗细档位
         */
        FontManager.prototype.getFontWeightLevels = function () {
            return utils.deepClone(FONT_WEIGHT_LEVELS);
        };

        /**
         * 获取行高档位列表
         * @returns {Object} 行高档位
         */
        FontManager.prototype.getLineHeightLevels = function () {
            return utils.deepClone(LINE_HEIGHT_LEVELS);
        };

        /**
         * 启用/禁用Google Fonts
         */
        FontManager.prototype.setGoogleFontsEnabled = function (enabled) {
            this.googleFontsEnabled = enabled;
        };

        /**
         * 字体预览 - 临时应用字体
         * @param {string} fontId - 字体ID
         */
        FontManager.prototype.previewFont = function (fontId) {
            if (!utils.isBrowser()) return;
            var font = this.getFontById(fontId);
            if (!font) return;
            if (font.isGoogleFont && font.googleFont && this.googleFontsEnabled) {
                this._loadGoogleFont(font.googleFont);
            }
            document.documentElement.style.setProperty('--font-family', font.fontFamily);
        };

        /**
         * 结束字体预览
         */
        FontManager.prototype.endFontPreview = function () {
            this._applyFontFamily();
        };

        /**
         * 事件监听
         */
        FontManager.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return FontManager;
    })();

    // ============================================================
    //  BackgroundManager - 背景自定义管理器
    // ============================================================

    var BackgroundManager = (function () {
        /**
         * 构造函数
         */
        function BackgroundManager() {
            this.config = utils.getStorage(STORAGE_KEYS.CUSTOM_BG, utils.deepClone(DEFAULT_SETTINGS.background));
            this.eventEmitter = utils.createEventEmitter();
            this._init();
        }

        /**
         * 初始化
         */
        BackgroundManager.prototype._init = function () {
            if (!utils.isBrowser()) return;
            this.applyBackground();
        };

        /**
         * 获取当前背景配置
         * @returns {Object} 背景配置
         */
        BackgroundManager.prototype.getConfig = function () {
            return utils.deepClone(this.config);
        };

        /**
         * 设置自定义背景
         * @param {Object} config - 背景配置
         * @returns {boolean} 是否设置成功
         */
        BackgroundManager.prototype.setCustomBg = function (config) {
            if (!config || typeof config !== 'object') {
                console.warn('[SZ.themes] 无效的背景配置');
                return false;
            }

            utils.deepExtend(this.config, config);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            this.eventEmitter.emit('change', this.config);
            return true;
        };

        /**
         * 设置背景模式
         * @param {string} mode - 模式: theme/color/image/gradient/pattern/custom
         */
        BackgroundManager.prototype.setMode = function (mode) {
            var validModes = ['theme', 'color', 'image', 'gradient', 'pattern', 'custom'];
            if (validModes.indexOf(mode) === -1) {
                console.warn('[SZ.themes] 无效的背景模式:', mode);
                return false;
            }

            this.config.mode = mode;
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            this.eventEmitter.emit('modeChange', mode);
            return true;
        };

        /**
         * 应用背景到页面
         */
        BackgroundManager.prototype.applyBackground = function () {
            if (!utils.isBrowser() || !document.body) return;

            var bgStyle = '';
            var filterStyle = '';

            switch (this.config.mode) {
                case 'theme':
                    // 主题模式，清除自定义背景
                    document.body.style.background = '';
                    document.body.style.backgroundImage = '';
                    document.body.style.backgroundColor = '';
                    document.body.style.filter = '';
                    this._removeCustomBgStyle();
                    return;

                case 'color':
                    bgStyle = this.config.color || '#ffffff';
                    document.body.style.backgroundColor = bgStyle;
                    document.body.style.backgroundImage = 'none';
                    break;

                case 'image':
                    if (this.config.image) {
                        var imgUrl = this.config.image;
                        var opacity = this.config.imageOpacity !== undefined ? this.config.imageOpacity : 0.1;
                        var blur = this.config.imageBlur || 0;

                        // 创建伪元素背景图层
                        this._setImageBackground(imgUrl, opacity, blur);
                    }
                    break;

                case 'gradient':
                    bgStyle = this._generateGradientCSS();
                    document.body.style.background = bgStyle;
                    break;

                case 'pattern':
                    bgStyle = this._generatePatternCSS();
                    document.body.style.background = bgStyle;
                    document.body.style.backgroundSize = this.config.pattern.size + 'px ' + this.config.pattern.size + 'px';
                    break;

                case 'custom':
                    if (this.config.customCss) {
                        this._applyCustomCSS(this.config.customCss);
                    }
                    break;
            }

            // 应用滤镜
            if (this.config.mode !== 'theme' && this.config.filter && this.config.filter !== 'none') {
                var filter = BG_FILTER_PRESETS[this.config.filter];
                if (filter) {
                    filterStyle = filter.filter;
                }
            }

            // 应用亮度和饱和度调整
            var adjustments = [];
            if (this.config.brightness !== undefined && this.config.brightness !== 100) {
                adjustments.push('brightness(' + this.config.brightness + '%)');
            }
            if (this.config.saturation !== undefined && this.config.saturation !== 100) {
                adjustments.push('saturate(' + this.config.saturation + '%)');
            }
            if (adjustments.length > 0) {
                filterStyle = filterStyle ? filterStyle + ' ' : '';
                filterStyle += adjustments.join(' ');
            }

            if (filterStyle) {
                document.body.style.filter = filterStyle;
            }
        };

        /**
         * 设置图片背景
         */
        BackgroundManager.prototype._setImageBackground = function (imgUrl, opacity, blur) {
            var styleId = 'sz-custom-bg-style';
            var styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }

            var css = 'body::before {';
            css += 'content: "";';
            css += 'position: fixed;';
            css += 'top: 0; left: 0; right: 0; bottom: 0;';
            css += 'background-image: url("' + imgUrl + '");';
            css += 'background-size: cover;';
            css += 'background-position: center;';
            css += 'background-repeat: no-repeat;';
            css += 'opacity: ' + opacity + ';';
            css += 'filter: blur(' + blur + 'px);';
            css += 'z-index: -1;';
            css += 'pointer-events: none;';
            css += '}';

            styleEl.textContent = css;
        };

        /**
         * 移除自定义背景样式
         */
        BackgroundManager.prototype._removeCustomBgStyle = function () {
            var styleEl = document.getElementById('sz-custom-bg-style');
            if (styleEl) {
                styleEl.remove();
            }
        };

        /**
         * 生成渐变CSS
         */
        BackgroundManager.prototype._generateGradientCSS = function () {
            var grad = this.config.gradient;
            if (!grad || !grad.stops || grad.stops.length === 0) {
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }

            var stopsStr = grad.stops.map(function (stop) {
                return stop.color + ' ' + stop.position + '%';
            }).join(', ');

            switch (grad.type) {
                case 'radial':
                    return 'radial-gradient(circle, ' + stopsStr + ')';
                case 'conic':
                    return 'conic-gradient(from 0deg, ' + stopsStr + ')';
                case 'linear45':
                    return 'linear-gradient(45deg, ' + stopsStr + ')';
                case 'linear135':
                    return 'linear-gradient(135deg, ' + stopsStr + ')';
                case 'repeatingLinear':
                    return 'repeating-linear-gradient(' + (grad.angle || 45) + 'deg, ' + stopsStr + ')';
                case 'repeatingRadial':
                    return 'repeating-radial-gradient(circle, ' + stopsStr + ')';
                case 'linear':
                default:
                    return 'linear-gradient(' + (grad.angle || 135) + 'deg, ' + stopsStr + ')';
            }
        };

        /**
         * 生成图案CSS
         */
        BackgroundManager.prototype._generatePatternCSS = function () {
            var pat = this.config.pattern;
            var pattern = BG_PATTERN_TYPES[pat.type];
            if (!pattern) {
                return BG_PATTERN_TYPES.dots.css;
            }

            var color = pat.color || '#000000';
            var opacity = pat.opacity !== undefined ? pat.opacity : 0.05;
            var rgbaColor = utils.hexToRgba(color, opacity);

            return pattern.css.replace(/var\(--pattern-color\)/g, rgbaColor);
        };

        /**
         * 应用自定义CSS
         */
        BackgroundManager.prototype._applyCustomCSS = function (css) {
            var styleId = 'sz-custom-bg-css';
            var styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = css;
        };

        /**
         * 设置背景颜色
         * @param {string} color - 十六进制颜色值
         */
        BackgroundManager.prototype.setBackgroundColor = function (color) {
            if (!utils.isValidHex(color)) {
                console.warn('[SZ.themes] 无效的颜色值:', color);
                return false;
            }
            this.config.color = color;
            if (this.config.mode === 'theme') {
                this.config.mode = 'color';
            }
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置背景图片
         * @param {string} imageUrl - 图片URL
         */
        BackgroundManager.prototype.setBackgroundImage = function (imageUrl) {
            this.config.image = imageUrl;
            this.config.mode = 'image';
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 上传背景图片
         * @param {File} file - 图片文件
         * @param {Function} callback - 回调函数
         */
        BackgroundManager.prototype.uploadBackgroundImage = function (file, callback) {
            if (!file || !file.type || file.type.indexOf('image') === -1) {
                console.warn('[SZ.themes] 请上传图片文件');
                return false;
            }

            var reader = new FileReader();
            var self = this;
            reader.onload = function (e) {
                var dataUrl = e.target.result;
                self.setBackgroundImage(dataUrl);
                if (typeof callback === 'function') {
                    callback(dataUrl);
                }
            };
            reader.readAsDataURL(file);
            return true;
        };

        /**
         * 设置背景模糊度
         * @param {number} blur - 模糊度 (0-20px)
         */
        BackgroundManager.prototype.setBlur = function (blur) {
            this.config.imageBlur = utils.clamp(blur, 0, 20);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置背景透明度
         * @param {number} opacity - 透明度 (0-1)
         */
        BackgroundManager.prototype.setOpacity = function (opacity) {
            this.config.imageOpacity = utils.clamp(opacity, 0, 1);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置背景亮度
         * @param {number} brightness - 亮度百分比 (0-200)
         */
        BackgroundManager.prototype.setBrightness = function (brightness) {
            this.config.brightness = utils.clamp(brightness, 0, 200);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置背景饱和度
         * @param {number} saturation - 饱和度百分比 (0-200)
         */
        BackgroundManager.prototype.setSaturation = function (saturation) {
            this.config.saturation = utils.clamp(saturation, 0, 200);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置背景滤镜
         * @param {string} filterName - 滤镜名称
         */
        BackgroundManager.prototype.setFilter = function (filterName) {
            if (!BG_FILTER_PRESETS[filterName]) {
                console.warn('[SZ.themes] 无效的滤镜:', filterName);
                return false;
            }
            this.config.filter = filterName;
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 获取所有滤镜预设
         * @returns {Object} 滤镜预设
         */
        BackgroundManager.prototype.getFilterPresets = function () {
            return utils.deepClone(BG_FILTER_PRESETS);
        };

        /**
         * 获取所有图案类型
         * @returns {Object} 图案类型
         */
        BackgroundManager.prototype.getPatternTypes = function () {
            return utils.deepClone(BG_PATTERN_TYPES);
        };

        /**
         * 获取渐变类型
         * @returns {Object} 渐变类型
         */
        BackgroundManager.prototype.getGradientTypes = function () {
            return utils.deepClone(GRADIENT_TYPES);
        };

        /**
         * 设置渐变配置
         * @param {Object} gradientConfig - 渐变配置
         */
        BackgroundManager.prototype.setGradient = function (gradientConfig) {
            this.config.gradient = utils.deepExtend(this.config.gradient || {}, gradientConfig);
            this.config.mode = 'gradient';
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 添加渐变色标
         * @param {string} color - 颜色
         * @param {number} position - 位置百分比
         */
        BackgroundManager.prototype.addGradientStop = function (color, position) {
            if (!this.config.gradient) {
                this.config.gradient = { type: 'linear', angle: 135, stops: [] };
            }
            this.config.gradient.stops.push({ color: color, position: position });
            this.config.gradient.stops.sort(function (a, b) { return a.position - b.position; });
            this.config.mode = 'gradient';
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 移除渐变色标
         * @param {number} index - 色标索引
         */
        BackgroundManager.prototype.removeGradientStop = function (index) {
            if (!this.config.gradient || !this.config.gradient.stops) return false;
            if (index < 0 || index >= this.config.gradient.stops.length) return false;
            this.config.gradient.stops.splice(index, 1);
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 设置图案类型
         * @param {string} patternType - 图案类型
         */
        BackgroundManager.prototype.setPattern = function (patternType) {
            if (!BG_PATTERN_TYPES[patternType]) {
                console.warn('[SZ.themes] 无效的图案类型:', patternType);
                return false;
            }
            this.config.pattern.type = patternType;
            this.config.mode = 'pattern';
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.applyBackground();
            return true;
        };

        /**
         * 重置为主题默认背景
         */
        BackgroundManager.prototype.resetToTheme = function () {
            this.config.mode = 'theme';
            this._removeCustomBgStyle();
            var customCss = document.getElementById('sz-custom-bg-css');
            if (customCss) customCss.remove();
            document.body.style.background = '';
            document.body.style.backgroundImage = '';
            document.body.style.backgroundColor = '';
            document.body.style.filter = '';
            utils.setStorage(STORAGE_KEYS.CUSTOM_BG, this.config);
            this.eventEmitter.emit('reset');
            return true;
        };

        /**
         * 事件监听
         */
        BackgroundManager.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return BackgroundManager;
    })();

    // ============================================================
    //  IconManager - 图标系统管理器
    // ============================================================

    var IconManager = (function () {
        /**
         * 构造函数
         */
        function IconManager() {
            this.currentStyle = utils.getStorage(STORAGE_KEYS.ICON_STYLE, 'linear');
            this.iconSize = utils.getStorage(STORAGE_KEYS.ICON_SIZE, 24);
            this.eventEmitter = utils.createEventEmitter();
            this._init();
        }

        /**
         * 初始化
         */
        IconManager.prototype._init = function () {
            if (!utils.isBrowser()) return;
            this._applyIconSize();
            this._applyIconStyleClass();
        };

        /**
         * 获取图标SVG
         * @param {string} iconName - 图标名称
         * @param {Object} options - 选项
         * @returns {string} SVG字符串
         */
        IconManager.prototype.getIcon = function (iconName, options) {
            options = options || {};
            var style = options.style || this.currentStyle;
            var size = options.size || this.iconSize;
            var color = options.color || 'currentColor';
            var className = options.className || '';

            var iconData = ICON_DATA[iconName];
            if (!iconData) {
                console.warn('[SZ.themes] 图标不存在:', iconName);
                return '';
            }

            var svg = iconData[style] || iconData.linear;
            if (!svg) {
                svg = iconData.linear || '';
            }

            // 添加尺寸和颜色
            var sizeAttr = 'width="' + size + '" height="' + size + '"';
            svg = svg.replace('<svg', '<svg ' + sizeAttr + ' style="color:' + color + '" class="sz-icon ' + className + '"');

            return svg;
        };

        /**
         * 渲染图标到DOM元素
         * @param {HTMLElement} element - 目标元素
         * @param {string} iconName - 图标名称
         * @param {Object} options - 选项
         */
        IconManager.prototype.renderIcon = function (element, iconName, options) {
            if (!element || !utils.isBrowser()) return false;
            var svg = this.getIcon(iconName, options);
            element.innerHTML = svg;
            return true;
        };

        /**
         * 设置图标风格
         * @param {string} style - 图标风格
         * @returns {boolean} 是否设置成功
         */
        IconManager.prototype.setIconStyle = function (style) {
            if (!ICON_STYLES[style]) {
                console.warn('[SZ.themes] 无效的图标风格:', style);
                return false;
            }

            this.currentStyle = style;
            utils.setStorage(STORAGE_KEYS.ICON_STYLE, style);
            this._applyIconStyleClass();
            this._updateAllIcons();
            this.eventEmitter.emit('styleChange', { style: style, config: ICON_STYLES[style] });
            return true;
        };

        /**
         * 应用图标风格类名到body
         */
        IconManager.prototype._applyIconStyleClass = function () {
            if (!document.body) return;
            var classes = document.body.className.split(' ').filter(function (cls) {
                return cls.indexOf('icon-style-') !== 0;
            });
            classes.push('icon-style-' + this.currentStyle);
            document.body.className = classes.join(' ');
        };

        /**
         * 更新所有图标
         */
        IconManager.prototype._updateAllIcons = function () {
            if (!utils.isBrowser()) return;
            var icons = document.querySelectorAll('[data-sz-icon]');
            for (var i = 0; i < icons.length; i++) {
                var iconName = icons[i].getAttribute('data-sz-icon');
                if (iconName) {
                    this.renderIcon(icons[i], iconName);
                }
            }
        };

        /**
         * 设置图标大小
         * @param {number} size - 图标大小(px)
         * @returns {boolean} 是否设置成功
         */
        IconManager.prototype.setIconSize = function (size) {
            size = parseInt(size, 10);
            if (isNaN(size) || size < 12 || size > 64) {
                console.warn('[SZ.themes] 无效的图标大小:', size);
                return false;
            }

            this.iconSize = size;
            utils.setStorage(STORAGE_KEYS.ICON_SIZE, size);
            this._applyIconSize();
            this.eventEmitter.emit('sizeChange', { size: size });
            return true;
        };

        /**
         * 应用图标大小
         */
        IconManager.prototype._applyIconSize = function () {
            if (!document.documentElement) return;
            document.documentElement.style.setProperty('--icon-size', this.iconSize + 'px');
        };

        /**
         * 获取当前图标风格
         * @returns {string} 当前图标风格
         */
        IconManager.prototype.getCurrentStyle = function () {
            return this.currentStyle;
        };

        /**
         * 获取图标风格列表
         * @returns {Object} 图标风格对象
         */
        IconManager.prototype.getIconStyles = function () {
            return utils.deepClone(ICON_STYLES);
        };

        /**
         * 获取所有图标名称列表
         * @returns {Array} 图标名称数组
         */
        IconManager.prototype.getIconNames = function () {
            return Object.keys(ICON_DATA);
        };

        /**
         * 获取当前图标大小
         * @returns {number} 图标大小
         */
        IconManager.prototype.getIconSize = function () {
            return this.iconSize;
        };

        /**
         * 检查图标是否存在
         * @param {string} iconName - 图标名称
         * @returns {boolean} 是否存在
         */
        IconManager.prototype.hasIcon = function (iconName) {
            return !!ICON_DATA[iconName];
        };

        /**
         * 事件监听
         */
        IconManager.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return IconManager;
    })();

    // ============================================================
    //  ThemeEffects - 主题特效联动
    // ============================================================

    var ThemeEffects = (function () {
        /**
         * 构造函数
         */
        function ThemeEffects(themeManager) {
            this.themeManager = themeManager;
            this.particlesEnabled = utils.getStorage(STORAGE_KEYS.PARTICLE_ENABLED, true);
            this.soundStyleEnabled = utils.getStorage(STORAGE_KEYS.SOUND_STYLE + '_enabled', true);
            this.animationEnabled = true;
            this.eventEmitter = utils.createEventEmitter();
            this._bindEvents();
        }

        /**
         * 绑定事件
         */
        ThemeEffects.prototype._bindEvents = function () {
            var self = this;
            if (this.themeManager && this.themeManager.on) {
                this.themeManager.on('change', function (data) {
                    self._onThemeChange(data.theme);
                });
            }
        };

        /**
         * 主题变更时触发特效联动
         */
        ThemeEffects.prototype._onThemeChange = function (theme) {
            if (!theme) return;

            // 粒子特效联动
            if (this.particlesEnabled) {
                this._updateParticleEffects(theme);
            }

            // 音效风格联动
            if (this.soundStyleEnabled) {
                this._updateSoundStyle(theme);
            }

            // 主题专属动画
            if (this.animationEnabled) {
                this._playThemeAnimation(theme);
            }

            this.eventEmitter.emit('effectsChange', { theme: theme });
        };

        /**
         * 更新粒子特效
         */
        ThemeEffects.prototype._updateParticleEffects = function (theme) {
            if (!window.SZ || !window.SZ.particles) return;

            try {
                var particles = window.SZ.particles;

                // 尝试调用背景粒子主题设置
                if (typeof particles.setBackgroundTheme === 'function' && theme.particleConfig) {
                    particles.setBackgroundTheme(theme.particleConfig);
                }

                // 尝试设置粒子主题
                if (typeof particles.setTheme === 'function' && theme.particleConfig) {
                    particles.setTheme(theme.particleConfig);
                }

                // 播放主题切换特效
                if (typeof particles.playThemeTransition === 'function') {
                    particles.playThemeTransition(theme.particleTheme);
                }
            } catch (e) {
                console.warn('[SZ.themes] 粒子特效更新失败:', e);
            }
        };

        /**
         * 更新音效风格
         */
        ThemeEffects.prototype._updateSoundStyle = function (theme) {
            if (!window.SZ || !window.SZ.sounds) return;

            try {
                var sounds = window.SZ.sounds;

                // 设置答对音效风格
                if (typeof sounds.setCorrectStyle === 'function' && theme.soundStyle) {
                    sounds.setCorrectStyle(theme.soundStyle);
                }

                // 播放主题切换音效
                if (typeof sounds.play === 'function') {
                    sounds.play('ui_click');
                }
            } catch (e) {
                console.warn('[SZ.themes] 音效风格更新失败:', e);
            }
        };

        /**
         * 播放主题专属动画
         */
        ThemeEffects.prototype._playThemeAnimation = function (theme) {
            if (!utils.isBrowser() || !document.body) return;

            // 移除旧的动画类
            var animClasses = document.body.className.split(' ').filter(function (cls) {
                return cls.indexOf('theme-anim-') !== 0;
            });

            // 添加新的动画类
            if (theme.animationStyle) {
                animClasses.push('theme-anim-' + theme.animationStyle);
            }

            document.body.className = animClasses.join(' ');

            // 触发重绘以启动动画
            var styleId = 'sz-theme-transition-style';
            var styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }

            var animDuration = '0.5s';
            styleEl.textContent = [
                '.theme-transition-enter {',
                '  animation: themeFadeIn ' + animDuration + ' ease-out;',
                '}',
                '@keyframes themeFadeIn {',
                '  from { opacity: 0; transform: scale(0.98); }',
                '  to { opacity: 1; transform: scale(1); }',
                '}'
            ].join('\n');

            // 添加动画类
            document.body.classList.remove('theme-transition-enter');
            // 强制重绘
            void document.body.offsetWidth;
            document.body.classList.add('theme-transition-enter');
        };

        /**
         * 启用/禁用粒子特效
         */
        ThemeEffects.prototype.setParticlesEnabled = function (enabled) {
            this.particlesEnabled = enabled;
            utils.setStorage(STORAGE_KEYS.PARTICLE_ENABLED, enabled);

            if (window.SZ && window.SZ.particles) {
                try {
                    if (enabled) {
                        if (typeof window.SZ.particles.resume === 'function') {
                            window.SZ.particles.resume();
                        }
                    } else {
                        if (typeof window.SZ.particles.pause === 'function') {
                            window.SZ.particles.pause();
                        }
                    }
                } catch (e) {
                    console.warn('[SZ.themes] 粒子特效开关失败:', e);
                }
            }

            this.eventEmitter.emit('particlesToggle', { enabled: enabled });
        };

        /**
         * 启用/禁用音效风格联动
         */
        ThemeEffects.prototype.setSoundStyleEnabled = function (enabled) {
            this.soundStyleEnabled = enabled;
            utils.setStorage(STORAGE_KEYS.SOUND_STYLE + '_enabled', enabled);
            this.eventEmitter.emit('soundStyleToggle', { enabled: enabled });
        };

        /**
         * 启用/禁用主题动画
         */
        ThemeEffects.prototype.setAnimationEnabled = function (enabled) {
            this.animationEnabled = enabled;
            this.eventEmitter.emit('animationToggle', { enabled: enabled });
        };

        /**
         * 播放主题切换转场效果
         * @param {string} type - 转场类型
         */
        ThemeEffects.prototype.playTransition = function (type) {
            if (!utils.isBrowser()) return;

            var overlay = document.getElementById('sz-theme-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'sz-theme-overlay';
                overlay.style.cssText = [
                    'position: fixed;',
                    'top: 0; left: 0; right: 0; bottom: 0;',
                    'background: rgba(0,0,0,0.5);',
                    'opacity: 0;',
                    'pointer-events: none;',
                    'z-index: 99999;',
                    'transition: opacity 0.3s ease;'
                ].join('');
                document.body.appendChild(overlay);
            }

            overlay.style.opacity = '1';

            setTimeout(function () {
                overlay.style.opacity = '0';
            }, 200);
        };

        /**
         * 获取粒子特效配置
         * @param {string} themeId - 主题ID
         * @returns {Object} 粒子配置
         */
        ThemeEffects.prototype.getParticleConfig = function (themeId) {
            var theme = this.themeManager.getThemeById(themeId);
            return theme ? theme.particleConfig : null;
        };

        /**
         * 事件监听
         */
        ThemeEffects.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return ThemeEffects;
    })();

    // ============================================================
    //  SettingsManager - 设置持久化管理
    // ============================================================

    var SettingsManager = (function () {
        /**
         * 构造函数
         */
        function SettingsManager(modules) {
            this.modules = modules || {};
            this.eventEmitter = utils.createEventEmitter();
        }

        /**
         * 获取所有设置
         * @returns {Object} 完整的设置对象
         */
        SettingsManager.prototype.getAllSettings = function () {
            var settings = {
                version: '1.0.0',
                exportTime: Date.now(),
                theme: {
                    currentThemeId: this.modules.theme ? this.modules.theme.currentThemeId : DEFAULT_THEME_ID,
                    favorites: this.modules.theme ? this.modules.theme.favorites : [],
                    frequent: this.modules.theme ? this.modules.theme.frequent : []
                },
                font: {
                    fontFamily: this.modules.font ? this.modules.font.currentFontId : 'pingfang',
                    fontSize: this.modules.font ? this.modules.font.fontSize : 'medium',
                    fontWeight: this.modules.font ? this.modules.font.fontWeight : 'normal',
                    lineHeight: this.modules.font ? this.modules.font.lineHeight : 'normal'
                },
                background: this.modules.background ? this.modules.background.getConfig() : utils.deepClone(DEFAULT_SETTINGS.background),
                icons: {
                    style: this.modules.icons ? this.modules.icons.currentStyle : 'linear',
                    size: this.modules.icons ? this.modules.icons.iconSize : 24
                },
                effects: {
                    particlesEnabled: this.modules.effects ? this.modules.effects.particlesEnabled : true,
                    soundStyleEnabled: this.modules.effects ? this.modules.effects.soundStyleEnabled : true,
                    animationEnabled: this.modules.effects ? this.modules.effects.animationEnabled : true
                }
            };
            return settings;
        };

        /**
         * 导出设置为JSON字符串
         * @returns {string} JSON字符串
         */
        SettingsManager.prototype.exportSettings = function () {
            var settings = this.getAllSettings();
            try {
                return JSON.stringify(settings, null, 2);
            } catch (e) {
                console.error('[SZ.themes] 导出设置失败:', e);
                return null;
            }
        };

        /**
         * 导出设置并下载为文件
         */
        SettingsManager.prototype.exportToFile = function () {
            if (!utils.isBrowser()) return false;

            var jsonStr = this.exportSettings();
            if (!jsonStr) return false;

            var blob = new Blob([jsonStr], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'sz-theme-settings-' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        };

        /**
         * 导入设置
         * @param {Object|string} settings - 设置对象或JSON字符串
         * @param {Object} options - 选项
         * @param {boolean} options.merge - 是否合并到现有设置
         * @returns {boolean} 是否导入成功
         */
        SettingsManager.prototype.importSettings = function (settings, options) {
            options = options || {};
            var settingsObj;

            // 解析JSON字符串
            if (typeof settings === 'string') {
                try {
                    settingsObj = JSON.parse(settings);
                } catch (e) {
                    console.error('[SZ.themes] 导入设置解析失败:', e);
                    return false;
                }
            } else if (typeof settings === 'object' && settings !== null) {
                settingsObj = settings;
            } else {
                console.warn('[SZ.themes] 无效的设置数据');
                return false;
            }

            // 验证数据
            if (!this._validateSettings(settingsObj)) {
                console.warn('[SZ.themes] 设置数据验证失败');
                return false;
            }

            // 应用设置
            this._applyImportedSettings(settingsObj, options);
            this.eventEmitter.emit('import', { settings: settingsObj, options: options });
            return true;
        };

        /**
         * 从文件导入设置
         * @param {File} file - JSON文件
         * @param {Function} callback - 回调函数
         */
        SettingsManager.prototype.importFromFile = function (file, callback) {
            if (!utils.isBrowser() || !file) return false;

            var reader = new FileReader();
            var self = this;
            reader.onload = function (e) {
                var success = self.importSettings(e.target.result);
                if (typeof callback === 'function') {
                    callback(success, success ? self.getAllSettings() : null);
                }
            };
            reader.onerror = function () {
                if (typeof callback === 'function') {
                    callback(false, null);
                }
            };
            reader.readAsText(file);
            return true;
        };

        /**
         * 验证设置数据
         */
        SettingsManager.prototype._validateSettings = function (settings) {
            if (!settings || typeof settings !== 'object') return false;

            // 检查基本结构
            if (settings.theme && typeof settings.theme !== 'object') return false;
            if (settings.font && typeof settings.font !== 'object') return false;
            if (settings.background && typeof settings.background !== 'object') return false;

            return true;
        };

        /**
         * 应用导入的设置
         */
        SettingsManager.prototype._applyImportedSettings = function (settings, options) {
            // 主题设置
            if (settings.theme && this.modules.theme) {
                if (settings.theme.currentThemeId) {
                    this.modules.theme.setTheme(settings.theme.currentThemeId);
                }
                if (settings.theme.favorites && Array.isArray(settings.theme.favorites)) {
                    this.modules.theme.favorites = settings.theme.favorites.slice();
                    utils.setStorage(STORAGE_KEYS.FAVORITE_THEMES, this.modules.theme.favorites);
                }
            }

            // 字体设置
            if (settings.font && this.modules.font) {
                if (settings.font.fontFamily) {
                    this.modules.font.setFont(settings.font.fontFamily);
                }
                if (settings.font.fontSize) {
                    this.modules.font.setFontSize(settings.font.fontSize);
                }
                if (settings.font.fontWeight) {
                    this.modules.font.setFontWeight(settings.font.fontWeight);
                }
                if (settings.font.lineHeight) {
                    this.modules.font.setLineHeight(settings.font.lineHeight);
                }
            }

            // 背景设置
            if (settings.background && this.modules.background) {
                this.modules.background.setCustomBg(settings.background);
            }

            // 图标设置
            if (settings.icons && this.modules.icons) {
                if (settings.icons.style) {
                    this.modules.icons.setIconStyle(settings.icons.style);
                }
                if (settings.icons.size) {
                    this.modules.icons.setIconSize(settings.icons.size);
                }
            }

            // 特效设置
            if (settings.effects && this.modules.effects) {
                if (settings.effects.particlesEnabled !== undefined) {
                    this.modules.effects.setParticlesEnabled(settings.effects.particlesEnabled);
                }
                if (settings.effects.soundStyleEnabled !== undefined) {
                    this.modules.effects.setSoundStyleEnabled(settings.effects.soundStyleEnabled);
                }
                if (settings.effects.animationEnabled !== undefined) {
                    this.modules.effects.setAnimationEnabled(settings.effects.animationEnabled);
                }
            }
        };

        /**
         * 重置为默认设置
         * @returns {boolean} 是否重置成功
         */
        SettingsManager.prototype.resetToDefault = function () {
            // 清除所有存储
            for (var key in STORAGE_KEYS) {
                if (STORAGE_KEYS.hasOwnProperty(key)) {
                    utils.removeStorage(STORAGE_KEYS[key]);
                }
            }

            // 重置主题
            if (this.modules.theme) {
                this.modules.theme.currentThemeId = DEFAULT_THEME_ID;
                this.modules.theme.favorites = [];
                this.modules.theme.frequent = [];
                this.modules.theme.setTheme(DEFAULT_THEME_ID);
            }

            // 重置字体
            if (this.modules.font) {
                this.modules.font.currentFontId = 'pingfang';
                this.modules.font.fontSize = 'medium';
                this.modules.font.fontWeight = 'normal';
                this.modules.font.lineHeight = 'normal';
                this.modules.font.setFont('pingfang');
                this.modules.font.setFontSize('medium');
                this.modules.font.setFontWeight('normal');
                this.modules.font.setLineHeight('normal');
            }

            // 重置背景
            if (this.modules.background) {
                this.modules.background.config = utils.deepClone(DEFAULT_SETTINGS.background);
                this.modules.background.resetToTheme();
            }

            // 重置图标
            if (this.modules.icons) {
                this.modules.icons.currentStyle = 'linear';
                this.modules.icons.iconSize = 24;
                this.modules.icons.setIconStyle('linear');
                this.modules.icons.setIconSize(24);
            }

            // 重置特效
            if (this.modules.effects) {
                this.modules.effects.particlesEnabled = true;
                this.modules.effects.soundStyleEnabled = true;
                this.modules.effects.animationEnabled = true;
            }

            this.eventEmitter.emit('reset');
            return true;
        };

        /**
         * 保存所有设置到localStorage
         */
        SettingsManager.prototype.saveAll = function () {
            var settings = this.getAllSettings();
            utils.setStorage(STORAGE_KEYS.ALL_SETTINGS, settings);
            return true;
        };

        /**
         * 事件监听
         */
        SettingsManager.prototype.on = function (event, callback) {
            return this.eventEmitter.on(event, callback);
        };

        return SettingsManager;
    })();

    // ============================================================
    //  主模块初始化与公共API
    // ============================================================

    // 单例实例
    var themeManager = null;
    var fontManager = null;
    var backgroundManager = null;
    var iconManager = null;
    var themeEffects = null;
    var settingsManager = null;
    var initialized = false;
    var eventEmitter = utils.createEventEmitter();

    /**
     * 初始化主题系统
     */
    function init() {
        if (initialized) return;

        // 初始化各管理器
        themeManager = new ThemeManager();
        fontManager = new FontManager();
        backgroundManager = new BackgroundManager();
        iconManager = new IconManager();
        themeEffects = new ThemeEffects(themeManager);

        // 初始化设置管理器（需要传入各模块引用）
        settingsManager = new SettingsManager({
            theme: themeManager,
            font: fontManager,
            background: backgroundManager,
            icons: iconManager,
            effects: themeEffects
        });

        initialized = true;

        // DOM就绪后应用设置
        if (utils.isBrowser()) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () {
                    _onDomReady();
                });
            } else {
                _onDomReady();
            }
        }

        eventEmitter.emit('init');
    }

    /**
     * DOM就绪后的处理
     */
    function _onDomReady() {
        // 确保主题类已应用
        if (themeManager) {
            themeManager._applyThemeToBody(themeManager.currentThemeId);
        }

        // 确保字体已应用
        if (fontManager) {
            fontManager._applyFontFamily();
            fontManager._applyFontSize();
            fontManager._applyFontWeight();
            fontManager._applyLineHeight();
        }

        // 应用背景
        if (backgroundManager) {
            backgroundManager.applyBackground();
        }

        // 应用图标设置
        if (iconManager) {
            iconManager._applyIconSize();
            iconManager._applyIconStyleClass();
        }
    }

    // ============================================================
    //  公共 API - 主题相关
    // ============================================================

    /**
     * 获取主题列表
     */
    SZT.getThemeList = function (options) {
        if (!themeManager) init();
        return themeManager.getThemeList(options);
    };

    /**
     * 获取当前主题
     */
    SZT.getCurrentTheme = function () {
        if (!themeManager) init();
        return themeManager.getCurrentTheme();
    };

    /**
     * 设置主题
     */
    SZT.setTheme = function (themeId) {
        if (!themeManager) init();
        return themeManager.setTheme(themeId);
    };

    /**
     * 根据ID获取主题
     */
    SZT.getThemeById = function (themeId) {
        if (!themeManager) init();
        return themeManager.getThemeById(themeId);
    };

    /**
     * 主题预览
     */
    SZT.previewTheme = function (themeId) {
        if (!themeManager) init();
        return themeManager.previewTheme(themeId);
    };

    /**
     * 结束主题预览
     */
    SZT.endPreview = function () {
        if (!themeManager) init();
        return themeManager.endPreview();
    };

    /**
     * 添加收藏
     */
    SZT.addFavorite = function (themeId) {
        if (!themeManager) init();
        return themeManager.addFavorite(themeId);
    };

    /**
     * 移除收藏
     */
    SZT.removeFavorite = function (themeId) {
        if (!themeManager) init();
        return themeManager.removeFavorite(themeId);
    };

    /**
     * 切换收藏
     */
    SZT.toggleFavorite = function (themeId) {
        if (!themeManager) init();
        return themeManager.toggleFavorite(themeId);
    };

    /**
     * 检查是否已收藏
     */
    SZT.isFavorite = function (themeId) {
        if (!themeManager) init();
        return themeManager.isFavorite(themeId);
    };

    /**
     * 获取收藏列表
     */
    SZT.getFavorites = function () {
        if (!themeManager) init();
        return themeManager.getFavorites();
    };

    /**
     * 获取常用主题
     */
    SZT.getFrequent = function (limit) {
        if (!themeManager) init();
        return themeManager.getFrequent(limit);
    };

    /**
     * 按分类获取主题
     */
    SZT.getThemesByCategory = function (category) {
        if (!themeManager) init();
        return themeManager.getThemesByCategory(category);
    };

    /**
     * 获取所有分类
     */
    SZT.getCategories = function () {
        if (!themeManager) init();
        return themeManager.getCategories();
    };

    /**
     * 随机主题
     */
    SZT.randomTheme = function (options) {
        if (!themeManager) init();
        return themeManager.randomTheme(options);
    };

    // ============================================================
    //  公共 API - 字体相关
    // ============================================================

    /**
     * 获取字体列表
     */
    SZT.getFontList = function (options) {
        if (!fontManager) init();
        return fontManager.getFontList(options);
    };

    /**
     * 获取中文字体列表
     */
    SZT.getChineseFonts = function () {
        if (!fontManager) init();
        return fontManager.getChineseFonts();
    };

    /**
     * 获取英文字体列表
     */
    SZT.getEnglishFonts = function () {
        if (!fontManager) init();
        return fontManager.getEnglishFonts();
    };

    /**
     * 设置字体
     */
    SZT.setFont = function (fontId) {
        if (!fontManager) init();
        return fontManager.setFont(fontId);
    };

    /**
     * 获取当前字体
     */
    SZT.getCurrentFont = function () {
        if (!fontManager) init();
        return fontManager.getCurrentFont();
    };

    /**
     * 设置字体大小
     */
    SZT.setFontSize = function (size) {
        if (!fontManager) init();
        return fontManager.setFontSize(size);
    };

    /**
     * 获取当前字体大小
     */
    SZT.getCurrentFontSize = function () {
        if (!fontManager) init();
        return fontManager.getCurrentFontSize();
    };

    /**
     * 设置字体粗细
     */
    SZT.setFontWeight = function (weight) {
        if (!fontManager) init();
        return fontManager.setFontWeight(weight);
    };

    /**
     * 设置行高
     */
    SZT.setLineHeight = function (lineHeight) {
        if (!fontManager) init();
        return fontManager.setLineHeight(lineHeight);
    };

    /**
     * 获取字体大小档位
     */
    SZT.getFontSizeLevels = function () {
        if (!fontManager) init();
        return fontManager.getFontSizeLevels();
    };

    /**
     * 获取字体粗细档位
     */
    SZT.getFontWeightLevels = function () {
        if (!fontManager) init();
        return fontManager.getFontWeightLevels();
    };

    /**
     * 获取行高档位
     */
    SZT.getLineHeightLevels = function () {
        if (!fontManager) init();
        return fontManager.getLineHeightLevels();
    };

    // ============================================================
    //  公共 API - 背景相关
    // ============================================================

    /**
     * 设置自定义背景
     */
    SZT.setCustomBg = function (config) {
        if (!backgroundManager) init();
        return backgroundManager.setCustomBg(config);
    };

    /**
     * 获取背景配置
     */
    SZT.getBackgroundConfig = function () {
        if (!backgroundManager) init();
        return backgroundManager.getConfig();
    };

    /**
     * 设置背景颜色
     */
    SZT.setBackgroundColor = function (color) {
        if (!backgroundManager) init();
        return backgroundManager.setBackgroundColor(color);
    };

    /**
     * 设置背景图片
     */
    SZT.setBackgroundImage = function (imageUrl) {
        if (!backgroundManager) init();
        return backgroundManager.setBackgroundImage(imageUrl);
    };

    /**
     * 上传背景图片
     */
    SZT.uploadBackgroundImage = function (file, callback) {
        if (!backgroundManager) init();
        return backgroundManager.uploadBackgroundImage(file, callback);
    };

    /**
     * 设置背景模糊度
     */
    SZT.setBackgroundBlur = function (blur) {
        if (!backgroundManager) init();
        return backgroundManager.setBlur(blur);
    };

    /**
     * 设置背景透明度
     */
    SZT.setBackgroundOpacity = function (opacity) {
        if (!backgroundManager) init();
        return backgroundManager.setOpacity(opacity);
    };

    /**
     * 设置背景亮度
     */
    SZT.setBackgroundBrightness = function (brightness) {
        if (!backgroundManager) init();
        return backgroundManager.setBrightness(brightness);
    };

    /**
     * 设置背景饱和度
     */
    SZT.setBackgroundSaturation = function (saturation) {
        if (!backgroundManager) init();
        return backgroundManager.setSaturation(saturation);
    };

    /**
     * 设置背景滤镜
     */
    SZT.setBackgroundFilter = function (filterName) {
        if (!backgroundManager) init();
        return backgroundManager.setFilter(filterName);
    };

    /**
     * 获取滤镜预设
     */
    SZT.getFilterPresets = function () {
        if (!backgroundManager) init();
        return backgroundManager.getFilterPresets();
    };

    /**
     * 获取图案类型
     */
    SZT.getPatternTypes = function () {
        if (!backgroundManager) init();
        return backgroundManager.getPatternTypes();
    };

    /**
     * 设置渐变背景
     */
    SZT.setGradient = function (gradientConfig) {
        if (!backgroundManager) init();
        return backgroundManager.setGradient(gradientConfig);
    };

    /**
     * 设置图案背景
     */
    SZT.setPattern = function (patternType) {
        if (!backgroundManager) init();
        return backgroundManager.setPattern(patternType);
    };

    /**
     * 重置背景为主题默认
     */
    SZT.resetBackground = function () {
        if (!backgroundManager) init();
        return backgroundManager.resetToTheme();
    };

    // ============================================================
    //  公共 API - 图标相关
    // ============================================================

    /**
     * 获取图标
     */
    SZT.getIcon = function (iconName, options) {
        if (!iconManager) init();
        return iconManager.getIcon(iconName, options);
    };

    /**
     * 渲染图标到元素
     */
    SZT.renderIcon = function (element, iconName, options) {
        if (!iconManager) init();
        return iconManager.renderIcon(element, iconName, options);
    };

    /**
     * 设置图标风格
     */
    SZT.setIconStyle = function (style) {
        if (!iconManager) init();
        return iconManager.setIconStyle(style);
    };

    /**
     * 获取当前图标风格
     */
    SZT.getCurrentIconStyle = function () {
        if (!iconManager) init();
        return iconManager.getCurrentStyle();
    };

    /**
     * 获取图标风格列表
     */
    SZT.getIconStyles = function () {
        if (!iconManager) init();
        return iconManager.getIconStyles();
    };

    /**
     * 设置图标大小
     */
    SZT.setIconSize = function (size) {
        if (!iconManager) init();
        return iconManager.setIconSize(size);
    };

    /**
     * 获取图标名称列表
     */
    SZT.getIconNames = function () {
        if (!iconManager) init();
        return iconManager.getIconNames();
    };

    // ============================================================
    //  公共 API - 特效相关
    // ============================================================

    /**
     * 设置粒子特效开关
     */
    SZT.setParticlesEnabled = function (enabled) {
        if (!themeEffects) init();
        return themeEffects.setParticlesEnabled(enabled);
    };

    /**
     * 设置音效风格联动开关
     */
    SZT.setSoundStyleEnabled = function (enabled) {
        if (!themeEffects) init();
        return themeEffects.setSoundStyleEnabled(enabled);
    };

    /**
     * 播放主题转场动画
     */
    SZT.playThemeTransition = function (type) {
        if (!themeEffects) init();
        return themeEffects.playTransition(type);
    };

    // ============================================================
    //  公共 API - 设置持久化
    // ============================================================

    /**
     * 导出设置
     */
    SZT.exportSettings = function () {
        if (!settingsManager) init();
        return settingsManager.exportSettings();
    };

    /**
     * 导出设置到文件
     */
    SZT.exportToFile = function () {
        if (!settingsManager) init();
        return settingsManager.exportToFile();
    };

    /**
     * 导入设置
     */
    SZT.importSettings = function (settings, options) {
        if (!settingsManager) init();
        return settingsManager.importSettings(settings, options);
    };

    /**
     * 从文件导入设置
     */
    SZT.importFromFile = function (file, callback) {
        if (!settingsManager) init();
        return settingsManager.importFromFile(file, callback);
    };

    /**
     * 重置为默认设置
     */
    SZT.resetToDefault = function () {
        if (!settingsManager) init();
        return settingsManager.resetToDefault();
    };

    /**
     * 获取所有设置
     */
    SZT.getAllSettings = function () {
        if (!settingsManager) init();
        return settingsManager.getAllSettings();
    };

    // ============================================================
    //  公共 API - 模块实例访问
    // ============================================================

    /**
     * 获取主题管理器实例
     */
    SZT.getThemeManager = function () {
        if (!themeManager) init();
        return themeManager;
    };

    /**
     * 获取字体管理器实例
     */
    SZT.getFontManager = function () {
        if (!fontManager) init();
        return fontManager;
    };

    /**
     * 获取背景管理器实例
     */
    SZT.getBackgroundManager = function () {
        if (!backgroundManager) init();
        return backgroundManager;
    };

    /**
     * 获取图标管理器实例
     */
    SZT.getIconManager = function () {
        if (!iconManager) init();
        return iconManager;
    };

    /**
     * 获取特效管理器实例
     */
    SZT.getThemeEffects = function () {
        if (!themeEffects) init();
        return themeEffects;
    };

    /**
     * 获取设置管理器实例
     */
    SZT.getSettingsManager = function () {
        if (!settingsManager) init();
        return settingsManager;
    };

    // ============================================================
    //  公共 API - 事件系统
    // ============================================================

    /**
     * 事件监听
     * 支持的事件：init, themeChange, fontChange, bgChange, iconChange, import, reset
     */
    SZT.on = function (event, callback) {
        return eventEmitter.on(event, callback);
    };

    // ============================================================
    //  数据统计信息
    // ============================================================

    /**
     * 获取统计信息
     */
    SZT.getStats = function () {
        return {
            themeCount: THEME_DATA.length,
            chineseFontCount: FONT_DATA.chinese.length,
            englishFontCount: FONT_DATA.english.length,
            totalFontCount: FONT_DATA.chinese.length + FONT_DATA.english.length,
            iconStyleCount: Object.keys(ICON_STYLES).length,
            iconCount: Object.keys(ICON_DATA).length,
            filterPresetCount: Object.keys(BG_FILTER_PRESETS).length,
            patternTypeCount: Object.keys(BG_PATTERN_TYPES).length,
            categoryCount: Object.keys(THEME_CATEGORIES).length,
            fontSizeLevels: Object.keys(FONT_SIZE_LEVELS).length,
            fontWeightLevels: Object.keys(FONT_WEIGHT_LEVELS).length,
            lineHeightLevels: Object.keys(LINE_HEIGHT_LEVELS).length
        };
    };

    /**
     * 版本信息
     */
    SZT.version = '1.0.0';

    /**
     * 自动初始化（延迟到下一个事件循环，确保DOM存在）
     */
    if (utils.isBrowser()) {
        setTimeout(function () {
            init();
        }, 0);
    } else {
        // 非浏览器环境直接初始化
        init();
    }

    // ============================================================
    //  文件结束
    // ============================================================

})(window);