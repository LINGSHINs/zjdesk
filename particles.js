/**
 * SZ.particles - 刷题应用粒子特效系统
 * 版本: 1.0.0
 * 描述: 基于Canvas API的高性能粒子特效系统
 * 包含: 背景粒子、点击特效、答题反馈、转场动画、主题专属特效等
 * 作者: SZ Team
 */

(function (window) {
    'use strict';

    // ============================================================
    //  命名空间初始化
    // ============================================================
    window.SZ = window.SZ || {};
    window.SZ.particles = window.SZ.particles || {};

    var SZP = window.SZ.particles;

    // ============================================================
    //  工具函数模块
    // ============================================================
    SZP.utils = {
        /**
         * 随机数生成
         */
        random: function (min, max) {
            return Math.random() * (max - min) + min;
        },

        randomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        randomBool: function () {
            return Math.random() > 0.5;
        },

        randomFromArray: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },

        /**
         * 颜色工具
         */
        hexToRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 255, b: 255 };
        },

        rgbToHex: function (r, g, b) {
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },

        rgba: function (hex, alpha) {
            var c = this.hexToRgb(hex);
            return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
        },

        /**
         * HSL颜色生成
         */
        hsl: function (h, s, l) {
            return 'hsl(' + h + ',' + s + '%,' + l + '%)';
        },

        hsla: function (h, s, l, a) {
            return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
        },

        /**
         * 数学工具
         */
        clamp: function (val, min, max) {
            return Math.max(min, Math.min(max, val));
        },

        lerp: function (a, b, t) {
            return a + (b - a) * t;
        },

        distance: function (x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },

        angle: function (x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1);
        },

        /**
         * 缓动函数
         */
        easeOutQuad: function (t) {
            return t * (2 - t);
        },

        easeInQuad: function (t) {
            return t * t;
        },

        easeInOutQuad: function (t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },

        easeOutCubic: function (t) {
            return (--t) * t * t + 1;
        },

        easeInCubic: function (t) {
            return t * t * t;
        },

        easeInOutCubic: function (t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },

        easeOutExpo: function (t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        },

        easeOutElastic: function (t) {
            var p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        },

        easeOutBounce: function (t) {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                t -= 1.5 / 2.75;
                return 7.5625 * t * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                t -= 2.25 / 2.75;
                return 7.5625 * t * t + 0.9375;
            } else {
                t -= 2.625 / 2.75;
                return 7.5625 * t * t + 0.984375;
            }
        },

        /**
         * 设备检测
         */
        isMobile: function () {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        isTouchDevice: function () {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        getDevicePixelRatio: function () {
            return window.devicePixelRatio || 1;
        },

        /**
         * DOM工具
         */
        createCanvas: function (width, height) {
            var canvas = document.createElement('canvas');
            canvas.width = width || window.innerWidth;
            canvas.height = height || window.innerHeight;
            return canvas;
        },

        getOffset: function (el) {
            var rect = el.getBoundingClientRect();
            return {
                left: rect.left + window.pageXOffset,
                top: rect.top + window.pageYOffset
            };
        },

        /**
         * 性能工具
         */
        now: function () {
            return (performance && performance.now) ? performance.now() : Date.now();
        },

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

        throttle: function (fn, limit) {
            var inThrottle;
            return function () {
                var args = arguments;
                var context = this;
                if (!inThrottle) {
                    fn.apply(context, args);
                    inThrottle = true;
                    setTimeout(function () {
                        inThrottle = false;
                    }, limit);
                }
            };
        },

        /**
         * 数组工具
         */
        shuffle: function (array) {
            var arr = array.slice();
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
            return arr;
        }
    };

    // ============================================================
    //  对象池系统 - 性能优化核心
    // ============================================================
    SZP.ObjectPool = function (createFn, resetFn, initialSize) {
        this.createFn = createFn;
        this.resetFn = resetFn || function (obj) { return obj; };
        this.pool = [];
        this.activeCount = 0;

        // 预分配对象
        initialSize = initialSize || 50;
        for (var i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    };

    SZP.ObjectPool.prototype = {
        constructor: SZP.ObjectPool,

        acquire: function () {
            var obj;
            if (this.pool.length > 0) {
                obj = this.pool.pop();
            } else {
                obj = this.createFn();
            }
            this.activeCount++;
            return this.resetFn(obj);
        },

        release: function (obj) {
            if (this.activeCount > 0) {
                this.activeCount--;
            }
            this.pool.push(obj);
        },

        releaseAll: function (objects) {
            for (var i = 0; i < objects.length; i++) {
                this.pool.push(objects[i]);
            }
            this.activeCount = Math.max(0, this.activeCount - objects.length);
        },

        size: function () {
            return this.pool.length;
        },

        clear: function () {
            this.pool.length = 0;
            this.activeCount = 0;
        }
    };

    // ============================================================
    //  粒子基类
    // ============================================================
    SZP.Particle = function () {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 2;
        this.color = '#ffffff';
        this.alpha = 1;
        this.life = 1;
        this.maxLife = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.gravity = 0;
        this.friction = 1;
        this.active = false;
        this.type = 'circle';
        this.extra = {};
    };

    SZP.Particle.prototype = {
        constructor: SZP.Particle,

        reset: function () {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.size = 2;
            this.color = '#ffffff';
            this.alpha = 1;
            this.life = 1;
            this.maxLife = 1;
            this.rotation = 0;
            this.rotationSpeed = 0;
            this.gravity = 0;
            this.friction = 1;
            this.active = false;
            this.type = 'circle';
            this.extra = {};
            return this;
        },

        update: function (deltaTime) {
            if (!this.active) return;

            // 应用重力
            this.vy += this.gravity * deltaTime;

            // 应用摩擦力
            this.vx *= this.friction;
            this.vy *= this.friction;

            // 更新位置
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;

            // 更新旋转
            this.rotation += this.rotationSpeed * deltaTime;

            // 更新生命周期
            this.life -= deltaTime;

            if (this.life <= 0) {
                this.active = false;
                this.life = 0;
            }
        },

        draw: function (ctx) {
            if (!this.active || this.alpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            switch (this.type) {
                case 'circle':
                    this._drawCircle(ctx);
                    break;
                case 'square':
                    this._drawSquare(ctx);
                    break;
                case 'triangle':
                    this._drawTriangle(ctx);
                    break;
                case 'star':
                    this._drawStar(ctx);
                    break;
                case 'heart':
                    this._drawHeart(ctx);
                    break;
                case 'book':
                    this._drawBook(ctx);
                    break;
                case 'sparkle':
                    this._drawSparkle(ctx);
                    break;
                case 'flame':
                    this._drawFlame(ctx);
                    break;
                case 'snowflake':
                    this._drawSnowflake(ctx);
                    break;
                case 'petal':
                    this._drawPetal(ctx);
                    break;
                case 'line':
                    this._drawLine(ctx);
                    break;
                case 'ring':
                    this._drawRing(ctx);
                    break;
                case 'image':
                    this._drawImage(ctx);
                    break;
                default:
                    this._drawCircle(ctx);
            }

            ctx.restore();
        },

        _drawCircle: function (ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        },

        _drawSquare: function (ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        },

        _drawTriangle: function (ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
            ctx.fill();
        },

        _drawStar: function (ctx) {
            var spikes = 5;
            var outerRadius = this.size;
            var innerRadius = this.size * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (var i = 0; i < spikes * 2; i++) {
                var radius = i % 2 === 0 ? outerRadius : innerRadius;
                var angle = (i * Math.PI) / spikes - Math.PI / 2;
                var x = Math.cos(angle) * radius;
                var y = Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        },

        _drawHeart: function (ctx) {
            var s = this.size;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s, -s * 0.5, -s, -s * 1.2, 0, -s * 0.5);
            ctx.bezierCurveTo(s, -s * 1.2, s, -s * 0.5, 0, s * 0.3);
            ctx.closePath();
            ctx.fill();
        },

        _drawBook: function (ctx) {
            var s = this.size;
            ctx.fillStyle = this.color;
            // 书的左页
            ctx.beginPath();
            ctx.moveTo(-s * 0.8, -s * 0.6);
            ctx.lineTo(0, -s * 0.4);
            ctx.lineTo(0, s * 0.6);
            ctx.lineTo(-s * 0.8, s * 0.8);
            ctx.closePath();
            ctx.fill();
            // 书的右页
            ctx.beginPath();
            ctx.moveTo(s * 0.8, -s * 0.6);
            ctx.lineTo(0, -s * 0.4);
            ctx.lineTo(0, s * 0.6);
            ctx.lineTo(s * 0.8, s * 0.8);
            ctx.closePath();
            ctx.fill();
            // 书页线条
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-s * 0.6, -s * 0.2);
            ctx.lineTo(-s * 0.1, -s * 0.1);
            ctx.moveTo(-s * 0.6, 0);
            ctx.lineTo(-s * 0.1, s * 0.1);
            ctx.moveTo(-s * 0.6, s * 0.2);
            ctx.lineTo(-s * 0.1, s * 0.3);
            ctx.stroke();
        },

        _drawSparkle: function (ctx) {
            var s = this.size;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = s * 2;
            // 十字星芒
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.2, -s * 0.2);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.2, s * 0.2);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.2, s * 0.2);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.2, -s * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        },

        _drawFlame: function (ctx) {
            var s = this.size;
            var gradient = ctx.createRadialGradient(0, s * 0.3, 0, 0, 0, s);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 200, 50, 0.9)');
            gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.7)');
            gradient.addColorStop(1, 'rgba(200, 30, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.6, s * 0.5, 0, s);
            ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
            ctx.fill();
        },

        _drawSnowflake: function (ctx) {
            var s = this.size;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(1, s * 0.15);
            ctx.lineCap = 'round';
            // 六个主臂
            for (var i = 0; i < 6; i++) {
                var angle = (i * Math.PI) / 3;
                var x = Math.cos(angle) * s;
                var y = Math.sin(angle) * s;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x, y);
                ctx.stroke();
                // 分叉
                var midX = x * 0.5;
                var midY = y * 0.5;
                var branchAngle = angle + Math.PI / 6;
                ctx.beginPath();
                ctx.moveTo(midX, midY);
                ctx.lineTo(midX + Math.cos(branchAngle) * s * 0.3, midY + Math.sin(branchAngle) * s * 0.3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(midX, midY);
                ctx.lineTo(midX - Math.cos(branchAngle) * s * 0.3, midY - Math.sin(branchAngle) * s * 0.3);
                ctx.stroke();
            }
        },

        _drawPetal: function (ctx) {
            var s = this.size;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.6, s, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            // 花瓣纹理
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, s * 0.6);
            ctx.quadraticCurveTo(0, 0, s * 0.3, -s * 0.6);
            ctx.stroke();
        },

        _drawLine: function (ctx) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-this.size, 0);
            ctx.lineTo(this.size, 0);
            ctx.stroke();
        },

        _drawRing: function (ctx) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.2;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.stroke();
        },

        _drawImage: function (ctx) {
            if (this.extra.image && this.extra.image.complete) {
                var s = this.size;
                ctx.drawImage(this.extra.image, -s, -s, s * 2, s * 2);
            } else {
                this._drawCircle(ctx);
            }
        }
    };

    // ============================================================
    //  粒子特效基类
    // ============================================================
    SZP.EffectBase = function (options) {
        this.options = SZP.utils.shallowExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.active = false;
        this.canvas = null;
        this.ctx = null;
        this.lastTime = 0;
        this.animationId = null;
    };

    SZP.EffectBase.prototype = {
        constructor: SZP.EffectBase,

        defaultOptions: {
            maxParticles: 200,
            fps: 60,
            enabled: true
        },

        init: function (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.active = true;
        },

        start: function () {
            if (!this.active) {
                this.active = true;
            }
        },

        stop: function () {
            this.active = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        },

        update: function (deltaTime) {
            // 子类实现
        },

        render: function () {
            // 子类实现
        },

        clear: function () {
            this.particles.length = 0;
        },

        destroy: function () {
            this.stop();
            this.clear();
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  答题反馈特效 AnswerEffects
    //  包含：彩纸飘落、震动效果、连击特效
    // ============================================================
    SZP.AnswerEffects = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
        this._shakeTarget = null;
        this._shakeIntensity = 0;
        this._shakeDuration = 0;
        this._shakeTime = 0;
        this.combo = 0;
        this._comboParticles = [];
    };

    SZP.AnswerEffects.prototype = {
        constructor: SZP.AnswerEffects,

        defaultOptions: {
            enabled: true,
            zIndex: 9998,
            position: 'fixed',
            intensity: 'medium',
            confetti: {
                count: 100,
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff9ff3', '#54a0ff', '#5f27cd'],
                shapes: ['square', 'circle', 'triangle'],
                minSize: 4,
                maxSize: 10,
                duration: 3,
                gravity: 0.15,
                wind: 0.05
            },
            shake: {
                intensity: 8,
                duration: 300,
                easing: 'easeOutQuad'
            },
            combo: {
                enabled: true,
                minCombo: 3,
                particlesPerLevel: 20,
                colors: ['#ffd700', '#ff8c00', '#ff4500', '#ff1493', '#00ffff']
            }
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = this.options.position;
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = this.options.zIndex;
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);
            }

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this.active = true;
            this._animate();

            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.4;
                case 'high': return 1.8;
                default: return 1;
            }
        },

        // 答对：彩纸飘落
        correct: function (x, y) {
            if (!this.active || !this.options.enabled) return;

            this.combo++;
            this._createConfetti(x, y);

            // 连击特效
            if (this.options.combo.enabled && this.combo >= this.options.combo.minCombo) {
                this._createComboEffect(x, y);
            }
        },

        // 答错：震动 + 红色粒子飞溅
        wrong: function (x, y) {
            if (!this.active || !this.options.enabled) return;

            this.combo = 0;
            this._createWrongSplash(x, y);
            this._shake();
        },

        // 重置连击
        resetCombo: function () {
            this.combo = 0;
        },

        // 创建彩纸
        _createConfetti: function (x, y) {
            var conf = this.options.confetti;
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(conf.count * mult);
            count = Math.min(count, 300); // 上限

            x = x || this.width / 2;
            y = y || 0;

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x + (Math.random() - 0.5) * 200;
                p.y = y - Math.random() * 100;
                p.size = SZP.utils.random(conf.minSize, conf.maxSize);
                p.vx = (Math.random() - 0.5) * 6;
                p.vy = -Math.random() * 4 - 2;
                p.color = SZP.utils.randomFromArray(conf.colors);
                p.alpha = 1;
                p.life = conf.duration * (0.7 + Math.random() * 0.6);
                p.maxLife = p.life;
                p.type = SZP.utils.randomFromArray(conf.shapes);
                p.gravity = conf.gravity;
                p.friction = 0.99;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.3;
                p.extra.wind = conf.wind * (Math.random() - 0.5);
                p.extra.flip = Math.random() * Math.PI * 2;
                p.extra.flipSpeed = 0.05 + Math.random() * 0.1;
                this.particles.push(p);
            }
        },

        // 创建答错飞溅
        _createWrongSplash: function (x, y) {
            var redColors = ['#e74c3c', '#c0392b', '#ec7063', '#f1948a', '#fadbd8', '#a93226'];
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(30 * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = 3 + Math.random() * 5;
                var angle = Math.random() * Math.PI * 2;
                var speed = 3 + Math.random() * 4;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.randomFromArray(redColors);
                p.alpha = 1;
                p.life = 0.8 + Math.random() * 0.5;
                p.maxLife = p.life;
                p.type = 'circle';
                p.gravity = 0.2;
                p.friction = 0.95;
                this.particles.push(p);
            }
        },

        // 震动效果
        _shake: function () {
            var shakeOpts = this.options.shake;
            this._shakeIntensity = shakeOpts.intensity;
            this._shakeDuration = shakeOpts.duration;
            this._shakeTime = shakeOpts.duration;
            this._shakeTarget = document.body;
        },

        _updateShake: function (delta) {
            if (this._shakeTime <= 0 || !this._shakeTarget) return;

            this._shakeTime -= delta * 16.67;
            var progress = 1 - this._shakeTime / this._shakeDuration;
            var intensity = this._shakeIntensity * (1 - SZP.utils.easeOutQuad(progress));

            var x = (Math.random() - 0.5) * intensity * 2;
            var y = (Math.random() - 0.5) * intensity * 2;

            this._shakeTarget.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            if (this._shakeTime <= 0) {
                this._shakeTarget.style.transform = '';
                this._shakeTarget = null;
            }
        },

        // 连击特效
        _createComboEffect: function (x, y) {
            var comboOpts = this.options.combo;
            var comboLevel = Math.min(this.combo - comboOpts.minCombo + 1, 10);
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(comboOpts.particlesPerLevel * comboLevel * mult);

            x = x || this.width / 2;
            y = y || this.height / 2;

            // 环形爆发
            for (var ring = 0; ring < Math.min(comboLevel, 3); ring++) {
                var ringCount = Math.floor(count / (ring + 1));
                for (var i = 0; i < ringCount; i++) {
                    var p = SZP.globalPool.acquire();
                    p.reset();
                    p.active = true;
                    p.x = x;
                    p.y = y;
                    p.size = 4 + Math.random() * 4;
                    var angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.2;
                    var speed = (3 + ring * 2) * (0.8 + Math.random() * 0.4);
                    p.vx = Math.cos(angle) * speed;
                    p.vy = Math.sin(angle) * speed;
                    var colorIndex = (comboLevel - 1 + ring) % comboOpts.colors.length;
                    p.color = comboOpts.colors[colorIndex];
                    p.alpha = 1;
                    p.life = 1 + Math.random() * 0.5;
                    p.maxLife = p.life;
                    p.type = 'star';
                    p.gravity = 0.05;
                    p.friction = 0.97;
                    p.rotation = Math.random() * Math.PI * 2;
                    p.rotationSpeed = (Math.random() - 0.5) * 0.2;
                    p.extra.glow = true;
                    this.particles.push(p);
                }
            }

            // 中心爆发光点
            for (var j = 0; j < 10; j++) {
                var p2 = SZP.globalPool.acquire();
                p2.reset();
                p2.active = true;
                p2.x = x;
                p2.y = y;
                p2.size = 6 + Math.random() * 6;
                var a2 = Math.random() * Math.PI * 2;
                var s2 = 2 + Math.random() * 3;
                p2.vx = Math.cos(a2) * s2;
                p2.vy = Math.sin(a2) * s2;
                p2.color = '#ffffff';
                p2.alpha = 1;
                p2.life = 0.5;
                p2.maxLife = 0.5;
                p2.type = 'sparkle';
                p2.friction = 0.95;
                this.particles.push(p2);
            }
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            // 更新震动
            this._updateShake(delta);

            // 更新粒子
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var p = this.particles[i];
                if (!p.active) {
                    SZP.globalPool.release(p);
                    this.particles.splice(i, 1);
                    continue;
                }

                // 风力
                if (p.extra.wind !== undefined) {
                    p.vx += p.extra.wind * delta * 0.1;
                }

                // 翻转动画
                if (p.extra.flip !== undefined) {
                    p.extra.flip += p.extra.flipSpeed * delta;
                    p.size = Math.abs(Math.cos(p.extra.flip)) * p.size * 2 || p.size * 0.5;
                }

                // 生命周期透明度
                var lifeRatio = p.life / p.maxLife;
                if (lifeRatio < 0.3) {
                    p.alpha = lifeRatio / 0.3;
                } else {
                    p.alpha = 1;
                }

                p.update(delta);

                // 超出屏幕回收
                if (p.y > this.height + p.size * 2 || p.x < -p.size * 2 || p.x > this.width + p.size * 2) {
                    p.active = false;
                }
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                if (p.extra && p.extra.glow) {
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                }
                p.draw(ctx);
                ctx.shadowBlur = 0;
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        enable: function () {
            this.options.enabled = true;
        },

        disable: function () {
            this.options.enabled = false;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            if (this._shakeTarget) {
                this._shakeTarget.style.transform = '';
            }
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  页面转场特效 PageTransitions
    // ============================================================
    SZP.PageTransitions = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
        this._transitioning = false;
        this._transitionType = 'fade';
        this._transitionProgress = 0;
        this._transitionDuration = 800;
        this._transitionStartTime = 0;
        this._onComplete = null;
        this._phase = 'out'; // 'out' | 'in'
    };

    SZP.PageTransitions.prototype = {
        constructor: SZP.PageTransitions,

        defaultOptions: {
            enabled: true,
            zIndex: 10000,
            position: 'fixed',
            intensity: 'medium',
            duration: 800,
            defaultType: 'particle-converge' // 'particle-converge' | 'particle-disperse' | 'fade'
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = this.options.position;
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = this.options.zIndex;
                canvas.style.pointerEvents = 'none';
                canvas.style.opacity = '0';
                document.body.appendChild(canvas);
            }

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this.active = true;
            this._animate();

            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        transition: function (type, onComplete) {
            if (this._transitioning) return;
            if (!this.active || !this.options.enabled) {
                if (onComplete) onComplete();
                return;
            }

            this._transitionType = type || this.options.defaultType;
            this._transitioning = true;
            this._phase = 'out';
            this._transitionStartTime = SZP.utils.now();
            this._transitionDuration = this.options.duration;
            this._onComplete = onComplete;
            this.canvas.style.opacity = '1';

            // 根据类型生成粒子
            this._generateTransitionParticles();
        },

        _generateTransitionParticles: function () {
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(150 * mult);
            var cols = Math.ceil(Math.sqrt(count * (this.width / this.height)));
            var rows = Math.ceil(count / cols);
            var cellW = this.width / cols;
            var cellH = this.height / rows;

            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    var p = SZP.globalPool.acquire();
                    p.reset();
                    p.active = true;
                    p.x = col * cellW + cellW / 2;
                    p.y = row * cellH + cellH / 2;
                    p.startX = p.x;
                    p.startY = p.y;
                    p.size = Math.max(cellW, cellH) * 0.6;
                    p.color = this._getParticleColor(col, row, cols, rows);
                    p.alpha = 1;
                    p.life = 999;
                    p.maxLife = 999;
                    p.type = 'square';

                    if (this._transitionType === 'particle-converge') {
                        // 汇聚：从四周到中心
                        var targetX = this.width / 2;
                        var targetY = this.height / 2;
                        p.extra.targetX = targetX;
                        p.extra.targetY = targetY;
                    } else if (this._transitionType === 'particle-disperse') {
                        // 散开：从中心到四周
                        var angle = Math.atan2(p.y - this.height / 2, p.x - this.width / 2);
                        var dist = SZP.utils.distance(p.x, p.y, this.width / 2, this.height / 2);
                        p.extra.targetX = p.x + Math.cos(angle) * dist * 2;
                        p.extra.targetY = p.y + Math.sin(angle) * dist * 2;
                        // 初始在中心
                        p.x = this.width / 2;
                        p.y = this.height / 2;
                    } else {
                        // 淡入淡出
                        p.extra.startAlpha = 0;
                        p.extra.endAlpha = 1;
                    }

                    p.extra.delay = Math.random() * 0.3;
                    p.extra.row = row;
                    p.extra.col = col;
                    this.particles.push(p);
                }
            }
        },

        _getParticleColor: function (col, row, cols, rows) {
            var hue = (col / cols) * 60 + 200; // 蓝色系
            var lightness = 40 + (row / rows) * 30;
            return SZP.utils.hsl(hue, 70, lightness);
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            if (!this._transitioning) return;

            var elapsed = SZP.utils.now() - this._transitionStartTime;
            var totalDuration = this._transitionDuration;
            var halfDuration = totalDuration / 2;

            // 阶段切换
            if (this._phase === 'out' && elapsed >= halfDuration) {
                this._phase = 'in';
                if (this._onComplete) {
                    this._onComplete();
                    this._onComplete = null;
                }
            }

            if (elapsed >= totalDuration) {
                this._transitioning = false;
                this.canvas.style.opacity = '0';
                // 清理粒子
                for (var i = 0; i < this.particles.length; i++) {
                    SZP.globalPool.release(this.particles[i]);
                }
                this.particles.length = 0;
                return;
            }

            var progress;
            if (this._phase === 'out') {
                progress = elapsed / halfDuration;
            } else {
                progress = 1 - (elapsed - halfDuration) / halfDuration;
            }
            progress = SZP.utils.easeInOutQuad(progress);

            // 更新粒子位置
            for (var j = 0; j < this.particles.length; j++) {
                var p = this.particles[j];
                var delayedProgress = Math.max(0, progress - p.extra.delay);
                delayedProgress = Math.min(1, delayedProgress / (1 - p.extra.delay));

                if (this._transitionType === 'particle-converge' || this._transitionType === 'particle-disperse') {
                    var easeProgress = SZP.utils.easeInOutCubic(delayedProgress);
                    p.x = p.startX + (p.extra.targetX - p.startX) * easeProgress;
                    p.y = p.startY + (p.extra.targetY - p.startY) * easeProgress;
                    p.alpha = this._phase === 'out' ? delayedProgress : (1 - delayedProgress);
                    p.size = p.size * (0.5 + 0.5 * delayedProgress);
                } else {
                    // 淡入淡出
                    p.alpha = this._phase === 'out' ? delayedProgress : (1 - delayedProgress);
                }
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            if (!this._transitioning) return;

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].draw(ctx);
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        enable: function () {
            this.options.enabled = true;
        },

        disable: function () {
            this.options.enabled = false;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // 添加工具函数：浅拷贝扩展
    SZP.utils.shallowExtend = function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };

    // 深拷贝扩展
    SZP.utils.deepExtend = function (target, source) {
        if (typeof target !== 'object' || target === null) {
            return source;
        }
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    target[key] = SZP.utils.deepExtend(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

    // ============================================================
    //  全局粒子对象池
    // ============================================================
    SZP.globalPool = new SZP.ObjectPool(
        function () { return new SZP.Particle(); },
        function (obj) { return obj.reset(); },
        500
    );

    // ============================================================
    //  离屏Canvas缓存
    // ============================================================
    SZP.offscreenCache = {
        _cache: {},

        get: function (key, width, height, drawFn) {
            if (!this._cache[key]) {
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                drawFn(ctx, width, height);
                this._cache[key] = canvas;
            }
            return this._cache[key];
        },

        clear: function () {
            this._cache = {};
        }
    };

    // ============================================================
    //  背景粒子系统 BackgroundParticles
    // ============================================================
    SZP.BackgroundParticles = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.mouse = { x: 0, y: 0, active: false };
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._resizeHandler = null;
        this._mouseMoveHandler = null;
        this._mouseLeaveHandler = null;
        this._animationId = null;
        this._frameCount = 0;
    };

    SZP.BackgroundParticles.prototype = {
        constructor: SZP.BackgroundParticles,

        defaultOptions: {
            particleCount: 80,
            particleTypes: ['circle', 'square', 'triangle'],
            minSize: 2,
            maxSize: 6,
            minSpeed: 0.3,
            maxSpeed: 1.2,
            colors: ['#ffffff', '#e0e0e0', '#c0c0c0'],
            opacity: 0.6,
            connectLines: true,
            connectDistance: 120,
            connectLineWidth: 0.5,
            connectOpacity: 0.3,
            mouseInteraction: true,
            mouseRadius: 150,
            mouseForce: 0.5,
            mouseMode: 'attract', // 'attract' | 'repel'
            gravity: 0,
            wind: 0,
            bounce: false,
            fadeIn: true,
            zIndex: -1,
            position: 'fixed',
            intensity: 'medium' // 'low' | 'medium' | 'high'
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = this.options.position;
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = this.options.zIndex;
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);
            }

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this._createParticles();
            this._bindEvents();
            this.active = true;
            this._animate();

            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _createParticles: function () {
            var count = this._getParticleCount();
            for (var i = 0; i < count; i++) {
                this._createParticle(true);
            }
        },

        _getParticleCount: function () {
            var base = this.options.particleCount;
            if (SZP.utils.isMobile()) {
                base = Math.floor(base * 0.5);
            }
            switch (this.options.intensity) {
                case 'low': return Math.floor(base * 0.5);
                case 'high': return Math.floor(base * 1.5);
                default: return base;
            }
        },

        _createParticle: function (randomPosition) {
            var p = SZP.globalPool.acquire();
            p.reset();
            p.active = true;
            p.x = randomPosition ? SZP.utils.random(0, this.width) : this.width / 2;
            p.y = randomPosition ? SZP.utils.random(0, this.height) : this.height / 2;
            p.size = SZP.utils.random(this.options.minSize, this.options.maxSize);
            var speed = SZP.utils.random(this.options.minSpeed, this.options.maxSpeed);
            var angle = SZP.utils.random(0, Math.PI * 2);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.color = SZP.utils.randomFromArray(this.options.colors);
            p.alpha = this.options.fadeIn ? 0 : this.options.opacity;
            p.maxLife = Infinity;
            p.life = Infinity;
            p.type = SZP.utils.randomFromArray(this.options.particleTypes);
            p.rotation = SZP.utils.random(0, Math.PI * 2);
            p.rotationSpeed = SZP.utils.random(-0.02, 0.02);
            p.gravity = this.options.gravity;
            p.friction = 1;
            p.extra.fadeSpeed = SZP.utils.random(0.01, 0.03);
            p.extra.wobble = SZP.utils.random(0, Math.PI * 2);
            p.extra.wobbleSpeed = SZP.utils.random(0.01, 0.03);
            p.extra.wobbleAmount = SZP.utils.random(0.5, 1.5);
            this.particles.push(p);
            return p;
        },

        _bindEvents: function () {
            var self = this;

            this._resizeHandler = SZP.utils.debounce(function () {
                self._resize();
            }, 200);
            window.addEventListener('resize', this._resizeHandler);

            if (this.options.mouseInteraction) {
                this._mouseMoveHandler = function (e) {
                    var rect = self.canvas.getBoundingClientRect();
                    self.mouse.x = e.clientX - rect.left;
                    self.mouse.y = e.clientY - rect.top;
                    self.mouse.active = true;
                };
                this._mouseLeaveHandler = function () {
                    self.mouse.active = false;
                };

                var target = this.canvas.style.pointerEvents === 'none' ? window : this.canvas;
                target.addEventListener('mousemove', this._mouseMoveHandler);
                target.addEventListener('mouseleave', this._mouseLeaveHandler);

                // 触摸事件
                if (SZP.utils.isTouchDevice()) {
                    target.addEventListener('touchmove', function (e) {
                        if (e.touches.length > 0) {
                            var rect = self.canvas.getBoundingClientRect();
                            self.mouse.x = e.touches[0].clientX - rect.left;
                            self.mouse.y = e.touches[0].clientY - rect.top;
                            self.mouse.active = true;
                        }
                    }, { passive: true });
                    target.addEventListener('touchend', function () {
                        self.mouse.active = false;
                    });
                }
            }
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2); // 限制最大delta防止跳帧
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            var particles = this.particles;
            var mouse = this.mouse;
            var opts = this.options;

            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                if (!p.active) {
                    SZP.globalPool.release(p);
                    particles.splice(i, 1);
                    continue;
                }

                // 淡入效果
                if (opts.fadeIn && p.alpha < opts.opacity) {
                    p.alpha = Math.min(p.alpha + p.extra.fadeSpeed * delta, opts.opacity);
                }

                // 摆动效果
                p.extra.wobble += p.extra.wobbleSpeed * delta;
                var wobbleX = Math.sin(p.extra.wobble) * p.extra.wobbleAmount * 0.1;

                // 风力
                p.vx += opts.wind * 0.01 * delta;

                // 鼠标交互
                if (mouse.active && opts.mouseInteraction) {
                    var dx = mouse.x - p.x;
                    var dy = mouse.y - p.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < opts.mouseRadius && dist > 0) {
                        var force = (opts.mouseRadius - dist) / opts.mouseRadius;
                        force *= opts.mouseForce * 0.1 * delta;
                        var angle = Math.atan2(dy, dx);
                        if (opts.mouseMode === 'repel') {
                            angle += Math.PI;
                        }
                        p.vx += Math.cos(angle) * force;
                        p.vy += Math.sin(angle) * force;
                    }
                }

                // 更新位置
                p.x += (p.vx + wobbleX) * delta;
                p.y += p.vy * delta;
                p.rotation += p.rotationSpeed * delta;

                // 边界处理
                if (opts.bounce) {
                    if (p.x < 0 || p.x > this.width) {
                        p.vx *= -1;
                        p.x = Math.max(0, Math.min(this.width, p.x));
                    }
                    if (p.y < 0 || p.y > this.height) {
                        p.vy *= -1;
                        p.y = Math.max(0, Math.min(this.height, p.y));
                    }
                } else {
                    // 环绕
                    if (p.x < -p.size * 2) p.x = this.width + p.size * 2;
                    if (p.x > this.width + p.size * 2) p.x = -p.size * 2;
                    if (p.y < -p.size * 2) p.y = this.height + p.size * 2;
                    if (p.y > this.height + p.size * 2) p.y = -p.size * 2;
                }

                // 速度限制
                var maxSpeed = opts.maxSpeed * 2;
                var currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (currentSpeed > maxSpeed) {
                    p.vx = (p.vx / currentSpeed) * maxSpeed;
                    p.vy = (p.vy / currentSpeed) * maxSpeed;
                }
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            var particles = this.particles;
            var opts = this.options;

            // 绘制连线
            if (opts.connectLines && particles.length > 1) {
                ctx.strokeStyle = opts.colors[0] || '#ffffff';
                ctx.lineWidth = opts.connectLineWidth;

                for (var i = 0; i < particles.length; i++) {
                    var p1 = particles[i];
                    if (!p1.active) continue;

                    for (var j = i + 1; j < particles.length; j++) {
                        var p2 = particles[j];
                        if (!p2.active) continue;

                        var dx = p2.x - p1.x;
                        var dy = p2.y - p1.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < opts.connectDistance) {
                            var alpha = (1 - dist / opts.connectDistance) * opts.connectOpacity;
                            alpha *= Math.min(p1.alpha, p2.alpha);
                            ctx.globalAlpha = alpha;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }

                    // 鼠标连线
                    if (this.mouse.active && opts.mouseInteraction) {
                        var mdx = this.mouse.x - p1.x;
                        var mdy = this.mouse.y - p1.y;
                        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                        if (mdist < opts.mouseRadius) {
                            var malpha = (1 - mdist / opts.mouseRadius) * opts.connectOpacity * 1.5;
                            ctx.globalAlpha = malpha * p1.alpha;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(this.mouse.x, this.mouse.y);
                            ctx.stroke();
                        }
                    }
                }
                ctx.globalAlpha = 1;
            }

            // 绘制粒子
            for (var k = 0; k < particles.length; k++) {
                particles[k].draw(ctx);
            }
        },

        setTheme: function (themeConfig) {
            if (themeConfig.colors) {
                this.options.colors = themeConfig.colors;
            }
            if (themeConfig.particleTypes) {
                this.options.particleTypes = themeConfig.particleTypes;
            }
            if (themeConfig.particleCount !== undefined) {
                this.options.particleCount = themeConfig.particleCount;
                // 重新调整粒子数量
                var targetCount = this._getParticleCount();
                while (this.particles.length < targetCount) {
                    this._createParticle(true);
                }
                while (this.particles.length > targetCount) {
                    var p = this.particles.pop();
                    if (p) SZP.globalPool.release(p);
                }
            }
            if (themeConfig.connectLines !== undefined) {
                this.options.connectLines = themeConfig.connectLines;
            }
            if (themeConfig.speed) {
                this.options.minSpeed = themeConfig.speed.min || this.options.minSpeed;
                this.options.maxSpeed = themeConfig.speed.max || this.options.maxSpeed;
            }
            if (themeConfig.size) {
                this.options.minSize = themeConfig.size.min || this.options.minSize;
                this.options.maxSize = themeConfig.size.max || this.options.maxSize;
            }
            // 更新现有粒子的颜色和类型
            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                p.color = SZP.utils.randomFromArray(this.options.colors);
                p.type = SZP.utils.randomFromArray(this.options.particleTypes);
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
            var targetCount = this._getParticleCount();

            while (this.particles.length < targetCount) {
                this._createParticle(true);
            }
            while (this.particles.length > targetCount) {
                var p = this.particles.pop();
                if (p) SZP.globalPool.release(p);
            }
        },

        pause: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
                this._animationId = null;
            }
        },

        resume: function () {
            if (!this.active) {
                this.active = true;
                this.lastTime = SZP.utils.now();
                this._animate();
            }
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }
            if (this._mouseMoveHandler) {
                window.removeEventListener('mousemove', this._mouseMoveHandler);
            }
            if (this._mouseLeaveHandler) {
                window.removeEventListener('mouseleave', this._mouseLeaveHandler);
            }
            // 归还所有粒子到对象池
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  点击特效系统 ClickEffects
    // ============================================================
    SZP.ClickEffects = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.ripples = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
        this._clickHandler = null;
    };

    SZP.ClickEffects.prototype = {
        constructor: SZP.ClickEffects,

        defaultOptions: {
            enabled: true,
            zIndex: 9999,
            position: 'fixed',
            intensity: 'medium',
            effects: {
                ripple: true,
                burst: true,
                firework: false,
                heart: false,
                star: false
            },
            ripple: {
                count: 3,
                maxRadius: 60,
                duration: 0.6,
                lineWidth: 2,
                color: 'rgba(255, 255, 255, 0.6)'
            },
            burst: {
                count: 12,
                speed: 3,
                size: 3,
                life: 0.8,
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6']
            },
            firework: {
                count: 30,
                speed: 4,
                size: 2,
                life: 1.2,
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9ff3', '#54a0ff']
            },
            heart: {
                count: 5,
                speed: 2,
                size: 8,
                life: 1.5,
                colors: ['#ff6b6b', '#ff8787', '#ffa8a8']
            },
            star: {
                count: 8,
                speed: 2.5,
                size: 6,
                life: 1,
                colors: ['#ffd93d', '#ffe066', '#fff3bf']
            }
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = this.options.position;
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = this.options.zIndex;
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);
            }

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this._bindEvents();
            this.active = true;
            this._animate();

            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _bindEvents: function () {
            var self = this;

            window.addEventListener('resize', SZP.utils.debounce(function () {
                self._resize();
            }, 200));

            this._clickHandler = function (e) {
                if (!self.options.enabled) return;
                var x = e.clientX;
                var y = e.clientY;
                self.trigger(x, y, 'default');
            };

            // 支持触摸设备
            this._touchHandler = function (e) {
                if (!self.options.enabled) return;
                if (e.touches && e.touches.length > 0) {
                    var touch = e.touches[0];
                    self.trigger(touch.clientX, touch.clientY, 'default');
                }
            };

            document.addEventListener('click', this._clickHandler);
            if (SZP.utils.isTouchDevice()) {
                document.addEventListener('touchstart', this._touchHandler, { passive: true });
            }
        },

        trigger: function (x, y, type, options) {
            if (!this.active || !this.options.enabled) return;

            var effects = this.options.effects;
            var opts = options || {};

            switch (type) {
                case 'ripple':
                    this._createRipple(x, y, opts);
                    break;
                case 'burst':
                    this._createBurst(x, y, opts);
                    break;
                case 'firework':
                    this._createFirework(x, y, opts);
                    break;
                case 'heart':
                    this._createHeart(x, y, opts);
                    break;
                case 'star':
                    this._createStar(x, y, opts);
                    break;
                case 'correct':
                    this._createCorrectEffect(x, y);
                    break;
                case 'wrong':
                    this._createWrongEffect(x, y);
                    break;
                case 'default':
                default:
                    if (effects.ripple) this._createRipple(x, y);
                    if (effects.burst) this._createBurst(x, y);
                    if (effects.firework) this._createFirework(x, y);
                    if (effects.heart) this._createHeart(x, y);
                    if (effects.star) this._createStar(x, y);
                    break;
            }
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        _createRipple: function (x, y, opts) {
            var rippleOpts = SZP.utils.shallowExtend({}, this.options.ripple, opts || {});
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(rippleOpts.count * mult);

            for (var i = 0; i < count; i++) {
                this.ripples.push({
                    x: x,
                    y: y,
                    radius: 0,
                    maxRadius: rippleOpts.maxRadius * (0.7 + Math.random() * 0.6),
                    life: rippleOpts.duration,
                    maxLife: rippleOpts.duration,
                    lineWidth: rippleOpts.lineWidth,
                    color: rippleOpts.color,
                    delay: i * 0.08
                });
            }
        },

        _createBurst: function (x, y, opts) {
            var burstOpts = SZP.utils.shallowExtend({}, this.options.burst, opts || {});
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(burstOpts.count * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = burstOpts.size * (0.7 + Math.random() * 0.6);
                var angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
                var speed = burstOpts.speed * (0.5 + Math.random());
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.randomFromArray(burstOpts.colors);
                p.alpha = 1;
                p.life = burstOpts.life;
                p.maxLife = burstOpts.life;
                p.type = 'circle';
                p.friction = 0.96;
                p.gravity = 0.1;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.2;
                this.particles.push(p);
            }
        },

        _createFirework: function (x, y, opts) {
            var fwOpts = SZP.utils.shallowExtend({}, this.options.firework, opts || {});
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(fwOpts.count * mult);
            var baseHue = Math.floor(Math.random() * 360);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = fwOpts.size * (0.8 + Math.random() * 0.4);
                var angle = (i / count) * Math.PI * 2;
                var speed = fwOpts.speed * (0.6 + Math.random() * 0.8);
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.hsl(baseHue + Math.random() * 30, 100, 60 + Math.random() * 20);
                p.alpha = 1;
                p.life = fwOpts.life;
                p.maxLife = fwOpts.life;
                p.type = 'circle';
                p.friction = 0.98;
                p.gravity = 0.05;
                p.extra.trail = true;
                p.extra.trailLength = 5;
                p.extra.trailPoints = [];
                this.particles.push(p);
            }
        },

        _createHeart: function (x, y, opts) {
            var heartOpts = SZP.utils.shallowExtend({}, this.options.heart, opts || {});
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(heartOpts.count * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x + (Math.random() - 0.5) * 30;
                p.y = y;
                p.size = heartOpts.size * (0.7 + Math.random() * 0.6);
                p.vx = (Math.random() - 0.5) * 1;
                p.vy = -heartOpts.speed * (0.7 + Math.random() * 0.6);
                p.color = SZP.utils.randomFromArray(heartOpts.colors);
                p.alpha = 1;
                p.life = heartOpts.life;
                p.maxLife = heartOpts.life;
                p.type = 'heart';
                p.friction = 0.99;
                p.rotation = (Math.random() - 0.5) * 0.5;
                p.rotationSpeed = (Math.random() - 0.5) * 0.05;
                p.extra.wobble = Math.random() * Math.PI * 2;
                p.extra.wobbleSpeed = 0.05 + Math.random() * 0.05;
                p.extra.wobbleAmount = 1 + Math.random() * 2;
                this.particles.push(p);
            }
        },

        _createStar: function (x, y, opts) {
            var starOpts = SZP.utils.shallowExtend({}, this.options.star, opts || {});
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(starOpts.count * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = starOpts.size * (0.6 + Math.random() * 0.8);
                var angle = Math.random() * Math.PI * 2;
                var speed = starOpts.speed * (0.5 + Math.random() * 0.8);
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed - 1;
                p.color = SZP.utils.randomFromArray(starOpts.colors);
                p.alpha = 1;
                p.life = starOpts.life;
                p.maxLife = starOpts.life;
                p.type = 'star';
                p.friction = 0.97;
                p.gravity = 0.08;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.15;
                p.extra.twinkle = Math.random() * Math.PI * 2;
                p.extra.twinkleSpeed = 0.1 + Math.random() * 0.1;
                this.particles.push(p);
            }
        },

        _createCorrectEffect: function (x, y) {
            var greenColors = ['#2ecc71', '#27ae60', '#58d68d', '#82e0aa', '#abebc6'];
            var count = 25 * this._getIntensityMultiplier();

            // 绿色爆炸粒子
            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = 4 * (0.5 + Math.random());
                var angle = Math.random() * Math.PI * 2;
                var speed = 4 * (0.5 + Math.random());
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.randomFromArray(greenColors);
                p.alpha = 1;
                p.life = 1;
                p.maxLife = 1;
                p.type = Math.random() > 0.5 ? 'circle' : 'star';
                p.friction = 0.95;
                p.gravity = 0.1;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.2;
                this.particles.push(p);
            }

            // 波纹效果
            this._createRipple(x, y, {
                count: 2,
                maxRadius: 80,
                duration: 0.5,
                lineWidth: 3,
                color: 'rgba(46, 204, 113, 0.6)'
            });

            // 上升的心形
            var p2 = SZP.globalPool.acquire();
            p2.reset();
            p2.active = true;
            p2.x = x;
            p2.y = y;
            p2.size = 15;
            p2.vx = 0;
            p2.vy = -3;
            p2.color = '#2ecc71';
            p2.alpha = 1;
            p2.life = 1.5;
            p2.maxLife = 1.5;
            p2.type = 'heart';
            p2.friction = 0.99;
            this.particles.push(p2);
        },

        _createWrongEffect: function (x, y) {
            var redColors = ['#e74c3c', '#c0392b', '#ec7063', '#f1948a', '#fadbd8'];
            var count = 20 * this._getIntensityMultiplier();

            // 红色飞溅粒子
            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = 3 * (0.5 + Math.random());
                var angle = Math.random() * Math.PI * 2;
                var speed = 3 * (0.5 + Math.random());
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.randomFromArray(redColors);
                p.alpha = 1;
                p.life = 0.8;
                p.maxLife = 0.8;
                p.type = 'circle';
                p.friction = 0.94;
                p.gravity = 0.15;
                this.particles.push(p);
            }

            // 错误标记（X形）
            for (var j = 0; j < 6; j++) {
                var p2 = SZP.globalPool.acquire();
                p2.reset();
                p2.active = true;
                p2.x = x + (Math.random() - 0.5) * 20;
                p2.y = y + (Math.random() - 0.5) * 20;
                p2.size = 8;
                p2.vx = (Math.random() - 0.5) * 2;
                p2.vy = -2 - Math.random() * 2;
                p2.color = '#e74c3c';
                p2.alpha = 1;
                p2.life = 1;
                p2.maxLife = 1;
                p2.type = 'square';
                p2.rotation = Math.PI / 4;
                p2.rotationSpeed = (Math.random() - 0.5) * 0.3;
                p2.friction = 0.97;
                p2.gravity = 0.1;
                this.particles.push(p2);
            }

            // 波纹效果
            this._createRipple(x, y, {
                count: 2,
                maxRadius: 60,
                duration: 0.4,
                lineWidth: 2,
                color: 'rgba(231, 76, 60, 0.6)'
            });
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            // 更新粒子
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var p = this.particles[i];
                if (!p.active) {
                    SZP.globalPool.release(p);
                    this.particles.splice(i, 1);
                    continue;
                }

                // 摆动效果（心形上升）
                if (p.extra.wobble !== undefined) {
                    p.extra.wobble += p.extra.wobbleSpeed * delta;
                    p.x += Math.sin(p.extra.wobble) * p.extra.wobbleAmount * 0.1 * delta;
                }

                // 闪烁效果（星星）
                if (p.extra.twinkle !== undefined) {
                    p.extra.twinkle += p.extra.twinkleSpeed * delta;
                    p.alpha = 0.5 + 0.5 * Math.abs(Math.sin(p.extra.twinkle));
                    // 同时考虑生命周期衰减
                    p.alpha *= (p.life / p.maxLife);
                } else {
                    // 生命周期透明度衰减
                    p.alpha = p.life / p.maxLife;
                }

                p.update(delta);
            }

            // 更新波纹
            for (var j = this.ripples.length - 1; j >= 0; j--) {
                var r = this.ripples[j];
                if (r.delay > 0) {
                    r.delay -= delta / 60;
                    continue;
                }
                r.life -= delta / 60;
                var progress = 1 - r.life / r.maxLife;
                r.radius = r.maxRadius * SZP.utils.easeOutQuad(progress);
                if (r.life <= 0) {
                    this.ripples.splice(j, 1);
                }
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            // 绘制波纹
            for (var i = 0; i < this.ripples.length; i++) {
                var r = this.ripples[i];
                if (r.delay > 0) continue;

                var alpha = r.life / r.maxLife;
                ctx.strokeStyle = r.color;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = r.lineWidth;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();

                // 内部渐变填充
                var gradient = ctx.createRadialGradient(r.x, r.y, r.radius * 0.7, r.x, r.y, r.radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(1, r.color.replace(/[\d.]+\)$/, (alpha * 0.2) + ')'));
                ctx.fillStyle = gradient;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // 绘制粒子
            for (var j = 0; j < this.particles.length; j++) {
                this.particles[j].draw(ctx);
            }
        },

        setEffect: function (effectName, enabled) {
            if (this.options.effects.hasOwnProperty(effectName)) {
                this.options.effects[effectName] = enabled;
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        enable: function () {
            this.options.enabled = true;
        },

        disable: function () {
            this.options.enabled = false;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            if (this._clickHandler) {
                document.removeEventListener('click', this._clickHandler);
            }
            if (this._touchHandler) {
                document.removeEventListener('touchstart', this._touchHandler);
            }
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this.ripples.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };


    // ============================================================
    //  主题特效系统 ThemeEffects
    //  包含20+种主题专属粒子效果
    // ============================================================
    SZP.ThemeEffects = {
        // 主题配置库
        themes: {},

        // 注册主题
        register: function (name, config) {
            this.themes[name] = config;
        },

        // 获取主题配置
        get: function (name) {
            return this.themes[name] || this.themes.default;
        },

        // 获取所有主题列表
        list: function () {
            return Object.keys(this.themes);
        }
    };

    // ------------------------------------------------------------
    //  1. 默认主题（简约风）
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('default', {
        name: '默认简约',
        background: {
            particleCount: 60,
            particleTypes: ['circle'],
            minSize: 2,
            maxSize: 5,
            colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
            opacity: 0.5,
            connectLines: true,
            connectDistance: 100,
            minSpeed: 0.2,
            maxSpeed: 0.8,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: false, star: false },
            burstColors: ['#667eea', '#764ba2', '#f093fb']
        }
    });

    // ------------------------------------------------------------
    //  2. 宝可梦主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('pokemon', {
        name: '宝可梦',
        background: {
            particleCount: 50,
            particleTypes: ['square', 'circle'],
            minSize: 4,
            maxSize: 8,
            colors: ['#ffcb05', '#3b4cca', '#ff0000', '#ffffff'],
            opacity: 0.7,
            connectLines: false,
            minSpeed: 0.5,
            maxSpeed: 1.5,
            mouseMode: 'repel',
            gravity: 0.02
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: false },
            burstColors: ['#ffcb05', '#3b4cca', '#ff0000', '#f85888']
        },
        special: 'pokeball'
    });

    // ------------------------------------------------------------
    //  3. 赛博朋克主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('cyberpunk', {
        name: '赛博朋克',
        background: {
            particleCount: 80,
            particleTypes: ['line', 'circle'],
            minSize: 1,
            maxSize: 4,
            colors: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#00ff80'],
            opacity: 0.8,
            connectLines: true,
            connectDistance: 150,
            connectOpacity: 0.5,
            minSpeed: 0.8,
            maxSpeed: 2,
            mouseMode: 'attract',
            wind: 2
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ff00ff', '#00ffff', '#ff0080', '#ffff00']
        },
        special: 'neon-data'
    });

    // ------------------------------------------------------------
    //  4. 星露谷主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('stardew', {
        name: '星露谷物语',
        background: {
            particleCount: 40,
            particleTypes: ['circle', 'square', 'triangle'],
            minSize: 3,
            maxSize: 7,
            colors: ['#2d5016', '#8b4513', '#daa520', '#90ee90', '#cd853f'],
            opacity: 0.7,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 1,
            mouseMode: 'attract',
            gravity: 0.05
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: true, star: true },
            burstColors: ['#90ee90', '#daa520', '#2d5016', '#ffd700']
        },
        special: 'pixel-crops'
    });

    // ------------------------------------------------------------
    //  5. 新海诚主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('shinkai', {
        name: '新海诚',
        background: {
            particleCount: 70,
            particleTypes: ['petal', 'circle'],
            minSize: 5,
            maxSize: 12,
            colors: ['#ffb7c5', '#ffc0cb', '#ff69b4', '#ffd1dc', '#fff0f5'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.5,
            maxSpeed: 1.5,
            mouseMode: 'attract',
            gravity: 0.03,
            wind: 1
        },
        click: {
            effects: { ripple: true, burst: false, firework: true, heart: true, star: true },
            burstColors: ['#ffb7c5', '#ffc0cb', '#ff69b4']
        },
        special: 'sakura-cloud'
    });

    // ------------------------------------------------------------
    //  6. 水墨风主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('ink', {
        name: '水墨风',
        background: {
            particleCount: 30,
            particleTypes: ['circle'],
            minSize: 10,
            maxSize: 30,
            colors: ['#2c2c2c', '#4a4a4a', '#696969', '#888888'],
            opacity: 0.3,
            connectLines: false,
            minSpeed: 0.2,
            maxSpeed: 0.6,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: false, firework: false, heart: false, star: false },
            rippleColor: 'rgba(50, 50, 50, 0.4)'
        },
        special: 'ink-drop'
    });

    // ------------------------------------------------------------
    //  7. 液态玻璃主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('liquid-glass', {
        name: '液态玻璃',
        background: {
            particleCount: 45,
            particleTypes: ['circle', 'ring'],
            minSize: 8,
            maxSize: 20,
            colors: ['rgba(255,255,255,0.4)', 'rgba(200,220,255,0.5)', 'rgba(180,200,240,0.3)'],
            opacity: 0.6,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 0.8,
            mouseMode: 'repel',
            gravity: -0.02
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: false, star: false },
            burstColors: ['rgba(255,255,255,0.8)', 'rgba(200,220,255,0.9)']
        },
        special: 'bubble-glow'
    });

    // ------------------------------------------------------------
    //  8. 太空主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('space', {
        name: '宇宙星空',
        background: {
            particleCount: 120,
            particleTypes: ['circle', 'star', 'sparkle'],
            minSize: 1,
            maxSize: 4,
            colors: ['#ffffff', '#e0e0ff', '#c0c0ff', '#ffe0c0', '#ffc0e0'],
            opacity: 0.9,
            connectLines: false,
            minSpeed: 0.1,
            maxSpeed: 0.4,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: false, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ffffff', '#e0e0ff', '#ffd700', '#ff69b4']
        },
        special: 'starfield'
    });

    // ------------------------------------------------------------
    //  9. 海洋主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('ocean', {
        name: '深海世界',
        background: {
            particleCount: 60,
            particleTypes: ['circle', 'ring'],
            minSize: 3,
            maxSize: 10,
            colors: ['#00d4ff', '#0099cc', '#006699', '#33ccff', '#66ffff'],
            opacity: 0.6,
            connectLines: true,
            connectDistance: 80,
            connectOpacity: 0.2,
            minSpeed: 0.3,
            maxSpeed: 1,
            mouseMode: 'attract',
            gravity: -0.01,
            wind: 0.5
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: false, star: false },
            burstColors: ['#00d4ff', '#0099cc', '#33ccff', '#66ffff']
        },
        special: 'bubble-rise'
    });

    // ------------------------------------------------------------
    //  10. 森林主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('forest', {
        name: '森林秘境',
        background: {
            particleCount: 50,
            particleTypes: ['circle', 'triangle', 'star'],
            minSize: 2,
            maxSize: 6,
            colors: ['#228b22', '#32cd32', '#90ee90', '#98fb98', '#006400'],
            opacity: 0.7,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 1,
            mouseMode: 'attract',
            gravity: 0.02
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: true, star: true },
            burstColors: ['#228b22', '#32cd32', '#90ee90', '#adff2f']
        },
        special: 'leaf-fall'
    });

    // ------------------------------------------------------------
    //  11. 糖果主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('candy', {
        name: '糖果乐园',
        background: {
            particleCount: 70,
            particleTypes: ['circle', 'heart', 'star'],
            minSize: 4,
            maxSize: 10,
            colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700', '#87ceeb', '#dda0dd'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.4,
            maxSpeed: 1.2,
            mouseMode: 'attract',
            bounce: true
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: true, star: true },
            burstColors: ['#ff69b4', '#ff1493', '#ffd700', '#87ceeb', '#dda0dd']
        },
        special: 'candy-pop'
    });

    // ------------------------------------------------------------
    //  12. 火焰主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('fire', {
        name: '烈焰燃烧',
        background: {
            particleCount: 55,
            particleTypes: ['flame', 'circle'],
            minSize: 5,
            maxSize: 12,
            colors: ['#ff4500', '#ff6347', '#ffa500', '#ffd700', '#ff0000'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.5,
            maxSpeed: 1.5,
            mouseMode: 'repel',
            gravity: -0.05
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: false },
            burstColors: ['#ff4500', '#ff6347', '#ffa500', '#ffd700']
        },
        special: 'fire-burst'
    });

    // ------------------------------------------------------------
    //  13. 冰雪主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('ice', {
        name: '冰雪奇缘',
        background: {
            particleCount: 65,
            particleTypes: ['snowflake', 'circle', 'star'],
            minSize: 4,
            maxSize: 10,
            colors: ['#ffffff', '#e0ffff', '#b0e0e6', '#87ceeb', '#add8e6'],
            opacity: 0.85,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 1,
            mouseMode: 'attract',
            gravity: 0.03,
            wind: 1
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ffffff', '#e0ffff', '#b0e0e6', '#87ceeb']
        },
        special: 'snowfall'
    });

    // ------------------------------------------------------------
    //  14. 复古像素主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('retro', {
        name: '复古像素',
        background: {
            particleCount: 50,
            particleTypes: ['square'],
            minSize: 3,
            maxSize: 8,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
            opacity: 0.7,
            connectLines: false,
            minSpeed: 0.5,
            maxSpeed: 1.5,
            mouseMode: 'repel',
            bounce: true
        },
        click: {
            effects: { ripple: false, burst: true, firework: true, heart: false, star: false },
            burstColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        },
        special: 'pixel-explosion'
    });

    // ------------------------------------------------------------
    //  15. 哈利波特主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('harrypotter', {
        name: '哈利波特',
        background: {
            particleCount: 55,
            particleTypes: ['star', 'sparkle', 'circle'],
            minSize: 2,
            maxSize: 7,
            colors: ['#ffd700', '#daa520', '#b8860b', '#8b6914', '#ffffff'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.2,
            maxSpeed: 0.8,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ffd700', '#daa520', '#b8860b', '#cd853f']
        },
        special: 'magic-sparkle'
    });

    // ------------------------------------------------------------
    //  16. 我的世界主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('minecraft', {
        name: '我的世界',
        background: {
            particleCount: 45,
            particleTypes: ['square'],
            minSize: 6,
            maxSize: 12,
            colors: ['#5d9e3a', '#8b5a2b', '#87ceeb', '#7cfc00', '#696969'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.4,
            maxSpeed: 1.2,
            mouseMode: 'repel',
            gravity: 0.05,
            bounce: true
        },
        click: {
            effects: { ripple: false, burst: true, firework: true, heart: false, star: false },
            burstColors: ['#5d9e3a', '#8b5a2b', '#7cfc00', '#ffd700']
        },
        special: 'block-break'
    });

    // ------------------------------------------------------------
    //  17. 宫崎骏主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('ghibli', {
        name: '宫崎骏',
        background: {
            particleCount: 50,
            particleTypes: ['circle', 'petal', 'star'],
            minSize: 3,
            maxSize: 8,
            colors: ['#87ceeb', '#98fb98', '#ffd700', '#f0e68c', '#dda0dd'],
            opacity: 0.7,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 0.9,
            mouseMode: 'attract',
            wind: 0.5
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: true, star: true },
            burstColors: ['#87ceeb', '#98fb98', '#ffd700', '#dda0dd']
        },
        special: 'ghibli-dust'
    });

    // ------------------------------------------------------------
    //  18. 蒸汽朋克主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('steampunk', {
        name: '蒸汽朋克',
        background: {
            particleCount: 40,
            particleTypes: ['circle', 'ring', 'square'],
            minSize: 3,
            maxSize: 9,
            colors: ['#8b4513', '#cd853f', '#daa520', '#b8860b', '#d2691e'],
            opacity: 0.7,
            connectLines: true,
            connectDistance: 100,
            connectOpacity: 0.3,
            minSpeed: 0.3,
            maxSpeed: 0.8,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: false, star: true },
            burstColors: ['#8b4513', '#cd853f', '#daa520', '#b8860b']
        },
        special: 'gear-spin'
    });

    // ------------------------------------------------------------
    //  19. 极光主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('aurora', {
        name: '极光之夜',
        background: {
            particleCount: 70,
            particleTypes: ['circle', 'star'],
            minSize: 2,
            maxSize: 6,
            colors: ['#00ff88', '#00ccff', '#8800ff', '#ff00cc', '#00ffcc'],
            opacity: 0.7,
            connectLines: true,
            connectDistance: 120,
            connectOpacity: 0.4,
            minSpeed: 0.4,
            maxSpeed: 1.2,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#00ff88', '#00ccff', '#8800ff', '#ff00cc', '#00ffcc']
        },
        special: 'aurora-wave'
    });

    // ------------------------------------------------------------
    //  20. 万圣节主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('halloween', {
        name: '万圣节',
        background: {
            particleCount: 55,
            particleTypes: ['circle', 'star', 'triangle'],
            minSize: 3,
            maxSize: 8,
            colors: ['#ff8c00', '#ff4500', '#800080', '#000000', '#32cd32'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.4,
            maxSpeed: 1.2,
            mouseMode: 'repel',
            gravity: 0.02
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ff8c00', '#ff4500', '#800080', '#32cd32']
        },
        special: 'spooky-bats'
    });

    // ------------------------------------------------------------
    //  21. 圣诞节主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('christmas', {
        name: '圣诞节',
        background: {
            particleCount: 65,
            particleTypes: ['snowflake', 'star', 'circle'],
            minSize: 3,
            maxSize: 9,
            colors: ['#ff0000', '#00ff00', '#ffffff', '#ffd700', '#c0c0c0'],
            opacity: 0.8,
            connectLines: false,
            minSpeed: 0.3,
            maxSpeed: 1,
            mouseMode: 'attract',
            gravity: 0.04,
            wind: 0.8
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: true },
            burstColors: ['#ff0000', '#00ff00', '#ffffff', '#ffd700']
        },
        special: 'snowflake-gift'
    });

    // ------------------------------------------------------------
    //  22. 彩虹主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('rainbow', {
        name: '彩虹缤纷',
        background: {
            particleCount: 80,
            particleTypes: ['circle', 'star', 'heart'],
            minSize: 3,
            maxSize: 8,
            colors: ['#ff0000', '#ff8c00', '#ffd700', '#00ff00', '#00bfff', '#0000ff', '#8b00ff'],
            opacity: 0.7,
            connectLines: true,
            connectDistance: 90,
            connectOpacity: 0.3,
            minSpeed: 0.4,
            maxSpeed: 1.2,
            mouseMode: 'attract',
            bounce: true
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: true, star: true },
            burstColors: ['#ff0000', '#ff8c00', '#ffd700', '#00ff00', '#00bfff', '#8b00ff']
        },
        special: 'rainbow-burst'
    });

    // ------------------------------------------------------------
    //  23. 学习/书本主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('study', {
        name: '学霸模式',
        background: {
            particleCount: 40,
            particleTypes: ['book', 'star', 'circle'],
            minSize: 5,
            maxSize: 10,
            colors: ['#4169e1', '#1e90ff', '#00bfff', '#ffd700', '#ffffff'],
            opacity: 0.7,
            connectLines: true,
            connectDistance: 110,
            connectOpacity: 0.3,
            minSpeed: 0.3,
            maxSpeed: 0.8,
            mouseMode: 'attract'
        },
        click: {
            effects: { ripple: true, burst: true, firework: false, heart: false, star: true },
            burstColors: ['#4169e1', '#1e90ff', '#00bfff', '#ffd700']
        },
        special: 'book-pages'
    });

    // ------------------------------------------------------------
    //  24. 科技未来主题
    // ------------------------------------------------------------
    SZP.ThemeEffects.register('tech', {
        name: '科技未来',
        background: {
            particleCount: 70,
            particleTypes: ['line', 'circle', 'ring'],
            minSize: 2,
            maxSize: 6,
            colors: ['#00ff88', '#00ccff', '#0088ff', '#0044ff', '#88ffcc'],
            opacity: 0.7,
            connectLines: true,
            connectDistance: 140,
            connectOpacity: 0.4,
            minSpeed: 0.5,
            maxSpeed: 1.5,
            mouseMode: 'attract',
            wind: 0.3
        },
        click: {
            effects: { ripple: true, burst: true, firework: true, heart: false, star: false },
            burstColors: ['#00ff88', '#00ccff', '#0088ff', '#88ffcc']
        },
        special: 'tech-grid'
    });

    // ============================================================
    //  特效管理器 ParticleManager
    //  统一管理所有粒子效果
    // ============================================================
    SZP.ParticleManager = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.effects = {};
        this.active = false;
        this.currentTheme = 'default';
        this._initialized = false;
    };

    SZP.ParticleManager.prototype = {
        constructor: SZP.ParticleManager,

        defaultOptions: {
            enabled: true,
            intensity: 'medium', // 'low' | 'medium' | 'high'
            maxFPS: 60,
            maxTotalParticles: 1000,
            autoInit: true,
            effects: {
                background: true,
                click: true,
                answer: true,
                transition: true
            },
            zIndexBase: -1
        },

        init: function () {
            if (this._initialized) return this;

            if (!this.options.enabled) {
                this._initialized = true;
                return this;
            }

            var opts = this.options;

            // 初始化背景粒子
            if (opts.effects.background) {
                this.effects.background = new SZP.BackgroundParticles({
                    intensity: opts.intensity,
                    zIndex: opts.zIndexBase
                });
                this.effects.background.init();
            }

            // 初始化点击特效
            if (opts.effects.click) {
                this.effects.click = new SZP.ClickEffects({
                    intensity: opts.intensity,
                    zIndex: opts.zIndexBase + 9999
                });
                this.effects.click.init();
            }

            // 初始化答题特效
            if (opts.effects.answer) {
                this.effects.answer = new SZP.AnswerEffects({
                    intensity: opts.intensity,
                    zIndex: opts.zIndexBase + 9998
                });
                this.effects.answer.init();
            }

            // 初始化转场特效
            if (opts.effects.transition) {
                this.effects.transition = new SZP.PageTransitions({
                    intensity: opts.intensity,
                    zIndex: opts.zIndexBase + 10000
                });
                this.effects.transition.init();
            }

            // 应用主题
            this.applyTheme(this.currentTheme);

            this._initialized = true;
            this.active = true;

            return this;
        },

        // 应用主题
        applyTheme: function (themeName) {
            var theme = SZP.ThemeEffects.get(themeName);
            if (!theme) {
                console.warn('Theme not found:', themeName);
                return;
            }

            this.currentTheme = themeName;

            // 应用到背景粒子
            if (this.effects.background && theme.background) {
                this.effects.background.setTheme(theme.background);
            }

            // 应用到点击特效
            if (this.effects.click && theme.click) {
                var clickOpts = theme.click;
                if (clickOpts.effects) {
                    for (var eff in clickOpts.effects) {
                        if (clickOpts.effects.hasOwnProperty(eff)) {
                            this.effects.click.setEffect(eff, clickOpts.effects[eff]);
                        }
                    }
                }
                if (clickOpts.burstColors) {
                    this.effects.click.options.burst.colors = clickOpts.burstColors;
                }
            }
        },

        // 设置特效强度
        setIntensity: function (level) {
            this.options.intensity = level;

            for (var key in this.effects) {
                if (this.effects.hasOwnProperty(key) && this.effects[key].setIntensity) {
                    this.effects[key].setIntensity(level);
                }
            }
        },

        // 启用/禁用所有特效
        setEnabled: function (enabled) {
            this.options.enabled = enabled;

            for (var key in this.effects) {
                if (this.effects.hasOwnProperty(key) && this.effects[key]) {
                    if (enabled) {
                        if (this.effects[key].enable) this.effects[key].enable();
                        if (this.effects[key].resume) this.effects[key].resume();
                    } else {
                        if (this.effects[key].disable) this.effects[key].disable();
                        if (this.effects[key].pause) this.effects[key].pause();
                    }
                }
            }
        },

        // 触发答对特效
        triggerCorrect: function (x, y) {
            if (this.effects.answer) {
                this.effects.answer.correct(x, y);
            }
            if (this.effects.click) {
                this.effects.click.trigger(x, y, 'correct');
            }
        },

        // 触发答错特效
        triggerWrong: function (x, y) {
            if (this.effects.answer) {
                this.effects.answer.wrong(x, y);
            }
            if (this.effects.click) {
                this.effects.click.trigger(x, y, 'wrong');
            }
        },

        // 触发页面转场
        triggerTransition: function (type, onComplete) {
            if (this.effects.transition) {
                this.effects.transition.transition(type, onComplete);
            } else if (onComplete) {
                onComplete();
            }
        },

        // 获取特效实例
        getEffect: function (name) {
            return this.effects[name] || null;
        },

        // 获取当前粒子总数
        getTotalParticles: function () {
            var total = 0;
            for (var key in this.effects) {
                if (this.effects.hasOwnProperty(key) && this.effects[key].particles) {
                    total += this.effects[key].particles.length;
                }
            }
            return total;
        },

        // 性能检查
        _checkPerformance: function () {
            var total = this.getTotalParticles();
            if (total > this.options.maxTotalParticles) {
                // 降低粒子数量
                console.warn('Particle count too high:', total, 'reducing intensity...');
                this.setIntensity('low');
            }
        },

        // 销毁所有特效
        destroy: function () {
            for (var key in this.effects) {
                if (this.effects.hasOwnProperty(key) && this.effects[key]) {
                    if (this.effects[key].destroy) {
                        this.effects[key].destroy();
                    }
                }
            }
            this.effects = {};
            this.active = false;
            this._initialized = false;
        }
    };

    // ============================================================
    //  打字机效果 TypewriterEffect
    // ============================================================
    SZP.TypewriterEffect = function (element, options) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.text = '';
        this.currentIndex = 0;
        this.timer = null;
        this.isTyping = false;
        this._particles = [];
    };

    SZP.TypewriterEffect.prototype = {
        constructor: SZP.TypewriterEffect,

        defaultOptions: {
            speed: 50,
            delay: 0,
            cursor: true,
            cursorChar: '|',
            cursorBlinkSpeed: 500,
            deleteSpeed: 30,
            loop: false,
            particleEffect: true,
            particleColor: '#667eea',
            particleCount: 3,
            onComplete: null
        },

        type: function (text) {
            if (!this.element) return;

            this.stop();
            this.text = text;
            this.currentIndex = 0;
            this.isTyping = true;
            this.element.textContent = '';

            if (this.options.cursor) {
                this._startCursorBlink();
            }

            var self = this;
            setTimeout(function () {
                self._typeNext();
            }, this.options.delay);
        },

        _typeNext: function () {
            if (!this.isTyping) return;

            if (this.currentIndex < this.text.length) {
                this.element.textContent = this.text.slice(0, this.currentIndex + 1);
                this.currentIndex++;

                // 粒子效果
                if (this.options.particleEffect && this.text[this.currentIndex - 1] !== ' ') {
                    this._emitParticles();
                }

                var self = this;
                this.timer = setTimeout(function () {
                    self._typeNext();
                }, this.options.speed);
            } else {
                this.isTyping = false;
                if (this.options.loop) {
                    var self = this;
                    setTimeout(function () {
                        self._deleteAll();
                    }, 1500);
                } else if (this.options.onComplete) {
                    this.options.onComplete();
                }
            }
        },

        _deleteAll: function () {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.element.textContent = this.text.slice(0, this.currentIndex);
                var self = this;
                this.timer = setTimeout(function () {
                    self._deleteAll();
                }, this.options.deleteSpeed);
            } else if (this.options.loop) {
                this.type(this.text);
            }
        },

        _emitParticles: function () {
            // 创建简单的文字粒子
            var rect = this.element.getBoundingClientRect();
            var x = rect.left + rect.width;
            var y = rect.top + rect.height / 2;

            for (var i = 0; i < this.options.particleCount; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y + (Math.random() - 0.5) * 10;
                p.size = 2 + Math.random() * 2;
                p.vx = 1 + Math.random() * 2;
                p.vy = (Math.random() - 0.5) * 2;
                p.color = this.options.particleColor;
                p.alpha = 1;
                p.life = 0.5;
                p.maxLife = 0.5;
                p.type = 'circle';
                p.friction = 0.95;
                this._particles.push(p);
            }
        },

        _startCursorBlink: function () {
            // 使用CSS实现光标闪烁
            this.element.style.borderRight = '2px solid currentColor';
            this.element.style.animation = 'typing-cursor-blink 1s step-end infinite';
            // 注入样式
            if (!document.getElementById('szp-typewriter-style')) {
                var style = document.createElement('style');
                style.id = 'szp-typewriter-style';
                style.textContent = '@keyframes typing-cursor-blink { 50% { border-color: transparent; } }';
                document.head.appendChild(style);
            }
        },

        stop: function () {
            this.isTyping = false;
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        },

        destroy: function () {
            this.stop();
            this._particles.length = 0;
            this.element = null;
        }
    };

    // ============================================================
    //  进度条庆祝粒子 ProgressCelebration
    // ============================================================
    SZP.ProgressCelebration = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
    };

    SZP.ProgressCelebration.prototype = {
        constructor: SZP.ProgressCelebration,

        defaultOptions: {
            enabled: true,
            intensity: 'medium',
            colors: ['#ffd700', '#ff69b4', '#00ff88', '#00bfff', '#ff8c00', '#8b00ff'],
            particleCount: 50,
            duration: 2
        },

        trigger: function (x, y, width) {
            if (!this.options.enabled) return;

            this.canvas = this.canvas || this._createCanvas();
            this.ctx = this.canvas.getContext('2d');
            this.active = true;
            this.lastTime = SZP.utils.now();

            var mult = this._getIntensityMultiplier();
            var count = Math.floor(this.options.particleCount * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x + Math.random() * (width || 200);
                p.y = y;
                p.size = 3 + Math.random() * 5;
                p.vx = (Math.random() - 0.5) * 4;
                p.vy = -3 - Math.random() * 4;
                p.color = SZP.utils.randomFromArray(this.options.colors);
                p.alpha = 1;
                p.life = this.options.duration * (0.7 + Math.random() * 0.6);
                p.maxLife = p.life;
                p.type = Math.random() > 0.5 ? 'circle' : 'star';
                p.gravity = 0.15;
                p.friction = 0.98;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.2;
                this.particles.push(p);
            }

            if (!this._animationId) {
                this._animate();
            }
        },

        _createCanvas: function () {
            var canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = 9997;
            canvas.style.pointerEvents = 'none';
            document.body.appendChild(canvas);
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            canvas.width = this.width * this.dpr;
            canvas.height = this.height * this.dpr;
            canvas.getContext('2d').scale(this.dpr, this.dpr);
            return canvas;
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var p = this.particles[i];
                if (!p.active) {
                    SZP.globalPool.release(p);
                    this.particles.splice(i, 1);
                    continue;
                }
                p.alpha = p.life / p.maxLife;
                p.update(delta);
            }

            if (this.particles.length === 0) {
                this.active = false;
                if (this._animationId) {
                    cancelAnimationFrame(this._animationId);
                    this._animationId = null;
                }
            }
        },

        _render: function () {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.width, this.height);
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].draw(this.ctx);
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  成就解锁特效 AchievementEffect
    // ============================================================
    SZP.AchievementEffect = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
    };

    SZP.AchievementEffect.prototype = {
        constructor: SZP.AchievementEffect,

        defaultOptions: {
            enabled: true,
            intensity: 'medium',
            colors: ['#ffd700', '#fff8dc', '#ffec8b', '#ffd700', '#daa520'],
            particleCount: 80,
            duration: 2.5,
            rings: 3
        },

        trigger: function (x, y) {
            if (!this.options.enabled) return;

            this.canvas = this.canvas || this._createCanvas();
            this.ctx = this.canvas.getContext('2d');
            this.active = true;
            this.lastTime = SZP.utils.now();

            var mult = this._getIntensityMultiplier();
            var count = Math.floor(this.options.particleCount * mult);

            // 金色粒子爆发
            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                p.x = x;
                p.y = y;
                p.size = 3 + Math.random() * 6;
                var angle = Math.random() * Math.PI * 2;
                var speed = 3 + Math.random() * 5;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.color = SZP.utils.randomFromArray(this.options.colors);
                p.alpha = 1;
                p.life = this.options.duration * (0.6 + Math.random() * 0.8);
                p.maxLife = p.life;
                p.type = 'star';
                p.gravity = 0.08;
                p.friction = 0.97;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.3;
                p.extra.glow = true;
                this.particles.push(p);
            }

            // 光环效果
            for (var r = 0; r < this.options.rings; r++) {
                var ring = {
                    x: x,
                    y: y,
                    radius: 10,
                    maxRadius: 150 + r * 50,
                    life: 1,
                    maxLife: 1,
                    delay: r * 0.15,
                    lineWidth: 4 - r,
                    color: 'rgba(255, 215, 0, 0.8)'
                };
                this.particles.push({
                    active: true,
                    x: x, y: y,
                    size: 0,
                    color: ring.color,
                    alpha: 1,
                    life: 1,
                    maxLife: 1,
                    type: 'ring',
                    update: function (delta) {
                        this.life -= delta * 0.02;
                        if (this.life <= 0) this.active = false;
                    },
                    draw: function (ctx) {
                        if (!this.active) return;
                        var progress = 1 - this.life / this.maxLife;
                        var r = 10 + (this.maxRadius - 10) * SZP.utils.easeOutQuad(progress);
                        ctx.strokeStyle = 'rgba(255, 215, 0,' + this.life + ')';
                        ctx.lineWidth = this.lineWidth;
                        ctx.shadowColor = '#ffd700';
                        ctx.shadowBlur = 20;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    },
                    extra: { ring: true, maxRadius: ring.maxRadius, lineWidth: ring.lineWidth, delay: ring.delay },
                    reset: function () { this.active = false; }
                });
            }

            if (!this._animationId) {
                this._animate();
            }
        },

        _createCanvas: function () {
            var canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = 9996;
            canvas.style.pointerEvents = 'none';
            document.body.appendChild(canvas);
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            canvas.width = this.width * this.dpr;
            canvas.height = this.height * this.dpr;
            canvas.getContext('2d').scale(this.dpr, this.dpr);
            return canvas;
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        _animate: function () {
            if (!this.active) return;

            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });

            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;

            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var p = this.particles[i];
                if (!p.active) {
                    if (p.reset) {
                        SZP.globalPool.release(p);
                    }
                    this.particles.splice(i, 1);
                    continue;
                }
                if (p.extra && p.extra.ring) {
                    if (p.extra.delay > 0) {
                        p.extra.delay -= delta / 60;
                    } else {
                        p.update(delta);
                    }
                } else {
                    p.alpha = p.life / p.maxLife;
                    p.update(delta);
                }
            }

            if (this.particles.length === 0) {
                this.active = false;
                if (this._animationId) {
                    cancelAnimationFrame(this._animationId);
                    this._animationId = null;
                }
            }
        },

        _render: function () {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.width, this.height);
            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                if (p.extra && p.extra.glow) {
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 15;
                }
                p.draw(this.ctx);
                this.ctx.shadowBlur = 0;
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            for (var i = 0; i < this.particles.length; i++) {
                if (this.particles[i].reset) {
                    SZP.globalPool.release(this.particles[i]);
                }
            }
            this.particles.length = 0;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  浮动提示气泡粒子 FloatingBubbles
    // ============================================================
    SZP.FloatingBubbles = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.bubbles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
    };

    SZP.FloatingBubbles.prototype = {
        constructor: SZP.FloatingBubbles,

        defaultOptions: {
            enabled: true,
            intensity: 'medium',
            maxBubbles: 20,
            colors: ['rgba(255,255,255,0.7)', 'rgba(200,220,255,0.7)', 'rgba(255,220,200,0.7)'],
            minSize: 15,
            maxSize: 40,
            speed: 1,
            spawnInterval: 800
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = 1;
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);
            }
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this.active = true;
            this._lastSpawn = 0;
            this._animate();
            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        _spawnBubble: function () {
            var mult = this._getIntensityMultiplier();
            var max = Math.floor(this.options.maxBubbles * mult);
            if (this.bubbles.length >= max) return;

            var size = SZP.utils.random(this.options.minSize, this.options.maxSize);
            var bubble = {
                x: SZP.utils.random(size, this.width - size),
                y: this.height + size,
                size: size,
                speed: this.options.speed * (0.5 + Math.random()),
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                wobbleAmount: 10 + Math.random() * 20,
                color: SZP.utils.randomFromArray(this.options.colors),
                alpha: 0.3 + Math.random() * 0.4,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
            };
            this.bubbles.push(bubble);
        },

        _animate: function () {
            if (!this.active) return;
            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });
            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;
            this._update(delta, now);
            this._render();
        },

        _update: function (delta, now) {
            // 生成气泡
            if (now - this._lastSpawn > this.options.spawnInterval / this._getIntensityMultiplier()) {
                this._spawnBubble();
                this._lastSpawn = now;
            }

            // 更新气泡
            for (var i = this.bubbles.length - 1; i >= 0; i--) {
                var b = this.bubbles[i];
                b.wobble += b.wobbleSpeed * delta;
                b.pulsePhase += b.pulseSpeed * delta;
                b.x += Math.sin(b.wobble) * b.wobbleAmount * 0.02 * delta;
                b.y -= b.speed * delta;

                if (b.y + b.size < 0) {
                    this.bubbles.splice(i, 1);
                }
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            for (var i = 0; i < this.bubbles.length; i++) {
                var b = this.bubbles[i];
                var pulseSize = b.size * (1 + 0.1 * Math.sin(b.pulsePhase));

                // 气泡渐变
                var gradient = ctx.createRadialGradient(
                    b.x - pulseSize * 0.3, b.y - pulseSize * 0.3, 0,
                    b.x, b.y, pulseSize
                );
                gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
                gradient.addColorStop(0.3, b.color);
                gradient.addColorStop(1, 'rgba(255,255,255,0.1)');

                ctx.fillStyle = gradient;
                ctx.globalAlpha = b.alpha;
                ctx.beginPath();
                ctx.arc(b.x, b.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();

                // 高光
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(b.x - pulseSize * 0.3, b.y - pulseSize * 0.3, pulseSize * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        },

        setIntensity: function (level) {
            this.options.intensity = level;
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            this.bubbles.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  闪烁星光效果 TwinkleStars
    // ============================================================
    SZP.TwinkleStars = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.stars = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
    };

    SZP.TwinkleStars.prototype = {
        constructor: SZP.TwinkleStars,

        defaultOptions: {
            enabled: true,
            intensity: 'medium',
            starCount: 100,
            colors: ['#ffffff', '#e0e0ff', '#ffe0c0', '#c0e0ff'],
            minSize: 1,
            maxSize: 3,
            twinkleSpeed: 0.02,
            twinkleAmount: 0.7
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = -2;
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);
            }
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this._createStars();
            this.active = true;
            this._animate();
            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.4;
                case 'high': return 1.6;
                default: return 1;
            }
        },

        _createStars: function () {
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(this.options.starCount * mult);

            for (var i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: SZP.utils.random(this.options.minSize, this.options.maxSize),
                    color: SZP.utils.randomFromArray(this.options.colors),
                    phase: Math.random() * Math.PI * 2,
                    speed: this.options.twinkleSpeed * (0.5 + Math.random()),
                    baseAlpha: 0.3 + Math.random() * 0.7
                });
            }
        },

        _animate: function () {
            if (!this.active) return;
            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });
            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;
            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                star.phase += star.speed * delta;
            }
        },

        _render: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                var twinkle = (1 - this.options.twinkleAmount) + this.options.twinkleAmount * Math.abs(Math.sin(star.phase));
                var alpha = star.baseAlpha * twinkle;

                ctx.globalAlpha = alpha;
                ctx.fillStyle = star.color;
                ctx.shadowColor = star.color;
                ctx.shadowBlur = star.size * 2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        },

        setIntensity: function (level) {
            this.options.intensity = level;
            // 重新生成星星
            this.stars.length = 0;
            this._createStars();
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            this.stars.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  能量环效果 EnergyRing
    // ============================================================
    SZP.EnergyRing = function (options) {
        this.options = SZP.utils.deepExtend({}, this.defaultOptions, options || {});
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.active = false;
        this.lastTime = 0;
        this.dpr = SZP.utils.getDevicePixelRatio();
        this._animationId = null;
        this._ringAngle = 0;
        this._pulsePhase = 0;
    };

    SZP.EnergyRing.prototype = {
        constructor: SZP.EnergyRing,

        defaultOptions: {
            enabled: true,
            intensity: 'medium',
            color: '#00ff88',
            glowColor: '#00ff88',
            ringRadius: 50,
            ringWidth: 4,
            rotationSpeed: 0.02,
            pulseSpeed: 0.03,
            pulseAmount: 0.2,
            particleCount: 20,
            particleSpeed: 2
        },

        init: function (canvas) {
            if (typeof canvas === 'string') {
                canvas = document.querySelector(canvas);
            }
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.position = 'absolute';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.pointerEvents = 'none';
            }
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this._resize();
            this._createParticles();
            this.active = true;
            this._animate();
            return this;
        },

        _resize: function () {
            var rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;
        },

        _getIntensityMultiplier: function () {
            switch (this.options.intensity) {
                case 'low': return 0.5;
                case 'high': return 1.5;
                default: return 1;
            }
        },

        _createParticles: function () {
            var mult = this._getIntensityMultiplier();
            var count = Math.floor(this.options.particleCount * mult);

            for (var i = 0; i < count; i++) {
                var p = SZP.globalPool.acquire();
                p.reset();
                p.active = true;
                var angle = (i / count) * Math.PI * 2;
                p.extra.baseAngle = angle;
                p.extra.angleOffset = Math.random() * Math.PI * 2;
                p.extra.orbitRadius = this.options.ringRadius * (0.8 + Math.random() * 0.4);
                p.extra.orbitSpeed = this.options.particleSpeed * 0.01 * (0.5 + Math.random());
                p.x = this.centerX + Math.cos(angle) * p.extra.orbitRadius;
                p.y = this.centerY + Math.sin(angle) * p.extra.orbitRadius;
                p.size = 2 + Math.random() * 3;
                p.color = this.options.color;
                p.alpha = 0.6 + Math.random() * 0.4;
                p.life = Infinity;
                p.maxLife = Infinity;
                p.type = 'circle';
                p.extra.glow = true;
                this.particles.push(p);
            }
        },

        _animate: function () {
            if (!this.active) return;
            var self = this;
            this._animationId = requestAnimationFrame(function () {
                self._animate();
            });
            var now = SZP.utils.now();
            var delta = Math.min((now - this.lastTime) / 16.67, 2);
            this.lastTime = now;
            this._update(delta);
            this._render();
        },

        _update: function (delta) {
            this._ringAngle += this.options.rotationSpeed * delta;
            this._pulsePhase += this.options.pulseSpeed * delta;

            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                p.extra.baseAngle += p.extra.orbitSpeed * delta;
                var pulse = 1 + this.options.pulseAmount * Math.sin(this._pulsePhase + p.extra.angleOffset);
                var r = p.extra.orbitRadius * pulse;
                p.x = this.centerX + Math.cos(p.extra.baseAngle) * r;
                p.y = this.centerY + Math.sin(p.extra.baseAngle) * r;
                p.alpha = 0.5 + 0.5 * Math.sin(this._pulsePhase * 2 + p.extra.angleOffset);
            }
        },

        _render: function () {
            var ctx = this.ctx;
            var opts = this.options;
            ctx.clearRect(0, 0, this.width, this.height);

            var pulse = 1 + opts.pulseAmount * Math.sin(this._pulsePhase);
            var radius = opts.ringRadius * pulse;

            // 外环光晕
            ctx.save();
            ctx.strokeStyle = opts.color;
            ctx.lineWidth = opts.ringWidth;
            ctx.shadowColor = opts.glowColor;
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.8;

            // 主环
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            // 旋转的装饰弧
            ctx.lineWidth = opts.ringWidth * 2;
            ctx.globalAlpha = 1;
            for (var a = 0; a < 4; a++) {
                var startAngle = this._ringAngle + (a * Math.PI / 2);
                var endAngle = startAngle + Math.PI / 4;
                ctx.beginPath();
                ctx.arc(this.centerX, this.centerY, radius, startAngle, endAngle);
                ctx.stroke();
            }

            ctx.restore();

            // 绘制粒子
            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                if (p.extra && p.extra.glow) {
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                }
                p.draw(ctx);
            }
            ctx.shadowBlur = 0;
        },

        setPosition: function (x, y) {
            this.centerX = x;
            this.centerY = y;
        },

        setColor: function (color) {
            this.options.color = color;
            this.options.glowColor = color;
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].color = color;
            }
        },

        setIntensity: function (level) {
            this.options.intensity = level;
            // 重新生成粒子
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this._createParticles();
        },

        destroy: function () {
            this.active = false;
            if (this._animationId) {
                cancelAnimationFrame(this._animationId);
            }
            for (var i = 0; i < this.particles.length; i++) {
                SZP.globalPool.release(this.particles[i]);
            }
            this.particles.length = 0;
            this.canvas = null;
            this.ctx = null;
        }
    };

    // ============================================================
    //  全局单例管理器入口
    // ============================================================
    SZP.createManager = function (options) {
        var manager = new SZP.ParticleManager(options);
        if (options && options.autoInit !== false) {
            manager.init();
        }
        return manager;
    };

    // 默认实例
    SZP.defaultManager = null;

    // 便捷初始化方法
    SZP.init = function (options) {
        if (SZP.defaultManager) {
            SZP.defaultManager.destroy();
        }
        SZP.defaultManager = SZP.createManager(options);
        return SZP.defaultManager;
    };

    // 版本号
    SZP.version = '1.0.0';

    // 特效计数
    SZP.effectCount = 0;

    // 统计所有可用特效
    SZP.getEffectList = function () {
        return [
            'BackgroundParticles - 背景粒子系统',
            'ClickEffects - 点击特效系统',
            'AnswerEffects - 答题反馈特效（彩纸/震动/连击）',
            'PageTransitions - 页面转场特效',
            'TypewriterEffect - 打字机效果',
            'ProgressCelebration - 进度条庆祝粒子',
            'AchievementEffect - 成就解锁特效',
            'FloatingBubbles - 浮动气泡粒子',
            'TwinkleStars - 闪烁星光效果',
            'EnergyRing - 能量环效果',
            'ThemeEffects - 主题特效系统（24种主题）'
        ];
    };

    // 计算特效数量
    SZP.getTotalEffectCount = function () {
        var count = 0;
        // 主系统
        count += 8; // BackgroundParticles, ClickEffects, AnswerEffects, PageTransitions, Typewriter, ProgressCelebration, Achievement, FloatingBubbles, TwinkleStars, EnergyRing
        // 点击特效子类型
        count += 7; // ripple, burst, firework, heart, star, correct, wrong
        // 主题数量
        count += Object.keys(SZP.ThemeEffects.themes).length;
        return count;
    };

    // AMD / CommonJS 支持
    if (typeof define === 'function' && define.amd) {
        define(function () { return SZP; });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SZP;
    }

})(window);
