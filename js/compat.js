/**
 * SZ.compat - 兼容性补丁
 * 提供各模块之间的API适配和缺失功能
 */

(function (window) {
    'use strict';

    window.SZ = window.SZ || {};
    window.SZ.compat = window.SZ.compat || {};

    // ============================================================
    //  EventEmitter - 简单的事件发射器实现
    // ============================================================
    function EventEmitter() {
        this._events = {};
    }

    EventEmitter.prototype.on = function (event, listener) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(listener);
        return this;
    };

    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    EventEmitter.prototype.once = function (event, listener) {
        var self = this;
        var fired = false;
        function wrapper() {
            if (!fired) {
                fired = true;
                self.removeListener(event, wrapper);
                listener.apply(self, arguments);
            }
        }
        wrapper.listener = listener;
        return this.on(event, wrapper);
    };

    EventEmitter.prototype.off = function (event, listener) {
        return this.removeListener(event, listener);
    };

    EventEmitter.prototype.removeListener = function (event, listener) {
        if (!this._events[event]) return this;
        var listeners = this._events[event];
        for (var i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i] === listener || (listeners[i].listener && listeners[i].listener === listener)) {
                listeners.splice(i, 1);
            }
        }
        if (listeners.length === 0) {
            delete this._events[event];
        }
        return this;
    };

    EventEmitter.prototype.removeAllListeners = function (event) {
        if (event) {
            delete this._events[event];
        } else {
            this._events = {};
        }
        return this;
    };

    EventEmitter.prototype.emit = function (event) {
        if (!this._events[event]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        var listeners = this._events[event].slice();
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i].apply(this, args);
            } catch (e) {
                console.error('EventEmitter listener error:', e);
            }
        }
        return true;
    };

    EventEmitter.prototype.listenerCount = function (event) {
        return this._events[event] ? this._events[event].length : 0;
    };

    EventEmitter.prototype.listeners = function (event) {
        return this._events[event] ? this._events[event].slice() : [];
    };

    // 暴露到全局，供其他模块使用
    window.EventEmitter = EventEmitter;
    SZ.compat.EventEmitter = EventEmitter;

    // ============================================================
    //  粒子系统 API 适配层
    // ============================================================
    function adaptParticles() {
        if (!SZ.particles) return;

        var P = SZ.particles;

        // 保存原始 init
        var _originalInit = P.init;
        var _manager = null;

        // 增强 init，保存 manager 引用
        P.init = function (options) {
            var result = _originalInit ? _originalInit(options) : null;
            _manager = P.defaultManager;
            return result;
        };

        // start 方法 - 启动粒子系统
        P.start = function () {
            if (_manager && typeof _manager.start === 'function') {
                _manager.start();
            } else if (P.BackgroundParticles && P.BackgroundParticles.start) {
                P.BackgroundParticles.start();
            }
            // 启动背景粒子
            if (_manager && _manager.background && _manager.background.start) {
                _manager.background.start();
            }
        };

        // stop 方法
        P.stop = function () {
            if (_manager && typeof _manager.stop === 'function') {
                _manager.stop();
            }
        };

        // trigger 方法 - 触发特效
        P.trigger = function (effectName, options) {
            options = options || {};
            var x = options.x || window.innerWidth / 2;
            var y = options.y || window.innerHeight / 2;

            if (_manager && _manager.clickEffects) {
                switch (effectName) {
                    case 'correct':
                        if (_manager.clickEffects.correctBurst) {
                            _manager.clickEffects.correctBurst(x, y);
                        } else if (_manager.answerEffects && _manager.answerEffects.correct) {
                            _manager.answerEffects.correct(x, y);
                        }
                        // 彩纸效果
                        if (_manager.answerEffects && _manager.answerEffects.confetti) {
                            _manager.answerEffects.confetti();
                        }
                        break;
                    case 'wrong':
                        if (_manager.clickEffects.wrongBurst) {
                            _manager.clickEffects.wrongBurst(x, y);
                        } else if (_manager.answerEffects && _manager.answerEffects.wrong) {
                            _manager.answerEffects.wrong(x, y);
                        }
                        // 震动效果
                        if (_manager.answerEffects && _manager.answerEffects.shake) {
                            _manager.answerEffects.shake();
                        }
                        break;
                    case 'welcome':
                    case 'panel_change':
                        // 背景粒子微调
                        break;
                    case 'ripple':
                        if (_manager.clickEffects && _manager.clickEffects.ripple) {
                            _manager.clickEffects.ripple(x, y);
                        }
                        break;
                    case 'firework':
                        if (_manager.clickEffects && _manager.clickEffects.firework) {
                            _manager.clickEffects.firework(x, y);
                        }
                        break;
                    case 'achievement':
                        if (_manager.achievementEffect) {
                            _manager.achievementEffect.trigger(x, y);
                        }
                        break;
                    case 'celebrate':
                    case 'confetti':
                        if (_manager.answerEffects && _manager.answerEffects.confetti) {
                            _manager.answerEffects.confetti(options.count || 100);
                        }
                        break;
                    default:
                        // 尝试通过名称查找
                        if (_manager.clickEffects && typeof _manager.clickEffects[effectName] === 'function') {
                            _manager.clickEffects[effectName](x, y, options);
                        }
                }
            }
        };

        // setTheme 方法 - 切换主题特效
        P.setTheme = function (themeName) {
            if (_manager && _manager.setTheme) {
                _manager.setTheme(themeName);
            }
            if (P.ThemeEffects && P.ThemeEffects.applyTheme) {
                P.ThemeEffects.applyTheme(themeName);
            }
        };

        // setIntensity 方法 - 设置特效强度
        P.setIntensity = function (level) {
            if (_manager && _manager.setIntensity) {
                _manager.setIntensity(level);
            }
        };

        // destroy 方法
        P.destroy = function () {
            if (_manager && _manager.destroy) {
                _manager.destroy();
            }
            _manager = null;
        };

        console.log('[SZ.compat] 粒子系统API适配完成');
    }

    // ============================================================
    //  音效系统 API 适配层
    // ============================================================
    function adaptSounds() {
        if (!SZ.sounds) return;

        var S = SZ.sounds;

        // 确保有 init 方法
        if (typeof S.init !== 'function') {
            S.init = function (options) {
                options = options || {};
                if (S.SoundManager) {
                    S._instance = new S.SoundManager(options);
                    return S._instance;
                }
                return null;
            };
        }

        // 确保有 play 方法
        if (typeof S.play !== 'function') {
            S.play = function (soundName, options) {
                if (S._instance && typeof S._instance.play === 'function') {
                    return S._instance.play(soundName, options);
                }
                return null;
            };
        }

        // 确保有 setVolume 方法
        if (typeof S.setVolume !== 'function') {
            S.setVolume = function (type, volume) {
                if (S._instance && typeof S._instance.setVolume === 'function') {
                    S._instance.setVolume(type, volume);
                }
            };
        }

        // 确保有 toggleMute 方法
        if (typeof S.toggleMute !== 'function') {
            S.toggleMute = function () {
                if (S._instance && typeof S._instance.toggleMute === 'function') {
                    return S._instance.toggleMute();
                }
                return false;
            };
        }

        // 便捷方法
        S.playCorrect = function () {
            var style = (S._instance && S._instance.settings && S._instance.settings.correctStyle) || 'correct_1';
            return S.play(style);
        };

        S.playWrong = function () {
            var style = (S._instance && S._instance.settings && S._instance.settings.wrongStyle) || 'wrong_1';
            return S.play(style);
        };

        S.playClick = function () {
            return S.play('click');
        };

        S.getInstance = function () {
            return S._instance;
        };

        console.log('[SZ.compat] 音效系统API适配完成');
    }

    // ============================================================
    //  统计系统 API 适配层
    // ============================================================
    function adaptStats() {
        if (!SZ.stats) return;

        var St = SZ.stats;

        // 确保有 init 方法
        if (typeof St.init !== 'function') {
            St.init = function () {
                if (St.StatsManager) {
                    St._instance = new St.StatsManager();
                    return St._instance;
                }
                return null;
            };
        }

        // 确保有 recordAnswer 方法
        if (typeof St.recordAnswer !== 'function') {
            St.recordAnswer = function (questionId, isCorrect, timeSpent) {
                if (St._instance && typeof St._instance.recordAnswer === 'function') {
                    return St._instance.recordAnswer(questionId, isCorrect, timeSpent);
                }
                if (St.StatsManager && St.StatsManager.prototype.recordAnswer) {
                    // 尝试直接调用
                }
            };
        }

        // 便捷方法代理
        var proxyMethods = [
            'getDailyStats', 'getOverallStats', 'getWrongBook', 'getFavorites',
            'isFavorite', 'toggleFavorite', 'addToWrongBook', 'removeFromWrongBook',
            'getMasteryLevel', 'getAchievements', 'getProgress'
        ];

        proxyMethods.forEach(function (method) {
            if (typeof St[method] !== 'function') {
                St[method] = function () {
                    if (St._instance && typeof St._instance[method] === 'function') {
                        return St._instance[method].apply(St._instance, arguments);
                    }
                    return null;
                };
            }
        });

        console.log('[SZ.compat] 统计系统API适配完成');
    }

    // ============================================================
    //  主题系统 API 适配层
    // ============================================================
    function adaptThemes() {
        if (!SZ.themes) return;

        var T = SZ.themes;

        // 确保有 init 方法
        if (typeof T.init !== 'function') {
            T.init = function (options) {
                if (T.ThemeManager) {
                    T._instance = new T.ThemeManager(options);
                    return T._instance;
                }
                return null;
            };
        }

        console.log('[SZ.compat] 主题系统API适配完成');
    }

    // ============================================================
    //  修复 easter-eggs.js 中的 name 属性问题
    // ============================================================
    function fixEasterEggs() {
        if (!SZ.easterEggs) return;

        var EE = SZ.easterEggs;

        // 如果有 modes 对象且包含类，修复 name 属性
        if (EE.modes && typeof EE.modes === 'object') {
            Object.keys(EE.modes).forEach(function (key) {
                var modeClass = EE.modes[key];
                if (typeof modeClass === 'function') {
                    // 确保可以设置 displayName 或其他属性
                    modeClass.displayName = modeClass.displayName || key;
                }
            });
        }

        console.log('[SZ.compat] 彩蛋模式修复完成');
    }

    // ============================================================
    //  统一初始化所有适配
    // ============================================================
    SZ.compat.init = function () {
        adaptParticles();
        adaptSounds();
        adaptStats();
        adaptThemes();
        fixEasterEggs();
        console.log('[SZ.compat] 所有兼容性补丁已应用');
    };

    // DOMContentLoaded 时初始化（defer脚本此时已全部加载完毕）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', SZ.compat.init);
    } else {
        SZ.compat.init();
    }

})(window);
