/**
 * 数卓刷题应用 - 彩蛋模式集合 (Easter Eggs Collection)
 * 版本: 1.0.0
 * 命名空间: SZ.easterEggs
 * 描述: 20种天马行空的趣味刷题模式
 *
 * 解锁方式:
 * 1. 连续点击Logo 10次
 * 2. 输入上上下下左右左右BA (科乐美秘籍)
 * 3. 完成特定成就
 * 4. 设置中手动开启
 */

(function (window) {
  'use strict';

  // ============================================================
  //  命名空间初始化
  // ============================================================
  window.SZ = window.SZ || {};
  SZ.easterEggs = SZ.easterEggs || {};

  // ============================================================
  //  工具函数集合
  // ============================================================
  var Utils = {
    /**
     * 生成随机数
     */
    random: function (min, max) {
      return Math.random() * (max - min) + min;
    },

    /**
     * 生成随机整数
     */
    randomInt: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 随机选择数组元素
     */
    randomChoice: function (arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * 打乱数组顺序 (Fisher-Yates)
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
    },

    /**
     * 深拷贝对象
     */
    deepClone: function (obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 限制数值范围
     */
    clamp: function (value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    /**
     * 格式化时间 (秒 -> mm:ss)
     */
    formatTime: function (seconds) {
      var m = Math.floor(seconds / 60);
      var s = Math.floor(seconds % 60);
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    },

    /**
     * 简单的事件绑定
     */
    on: function (el, event, handler) {
      if (el && el.addEventListener) {
        el.addEventListener(event, handler, false);
      }
    },

    /**
     * 移除事件绑定
     */
    off: function (el, event, handler) {
      if (el && el.removeEventListener) {
        el.removeEventListener(event, handler, false);
      }
    },

    /**
     * 创建DOM元素
     */
    createEl: function (tag, className, parent) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (parent) parent.appendChild(el);
      return el;
    },

    /**
     * 播放音效 (使用Web Audio API生成简单音效)
     */
    playSound: function (type) {
      try {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        var soundMap = {
          click:    { freq: 800,  type: 'sine',     duration: 0.05, volume: 0.1 },
          correct:  { freq: 660,  type: 'sine',     duration: 0.2,  volume: 0.15 },
          wrong:    { freq: 200,  type: 'sawtooth', duration: 0.3,  volume: 0.1  },
          typewriter: { freq: 1200, type: 'square', duration: 0.02, volume: 0.05 },
          levelup:  { freq: 880,  type: 'sine',     duration: 0.4,  volume: 0.15 },
          explode:  { freq: 100,  type: 'sawtooth', duration: 0.3,  volume: 0.2  },
          jump:     { freq: 500,  type: 'sine',     duration: 0.1,  volume: 0.1  },
          hit:      { freq: 150,  type: 'square',   duration: 0.08, volume: 0.1  },
          success:  { freq: 523,  type: 'sine',     duration: 0.15, volume: 0.12 },
          coin:     { freq: 988,  type: 'sine',     duration: 0.1,  volume: 0.1  }
        };

        var cfg = soundMap[type] || soundMap.click;
        oscillator.type = cfg.type;
        oscillator.frequency.setValueAtTime(cfg.freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(cfg.volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + cfg.duration);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + cfg.duration);
      } catch (e) {
        // 静默失败
      }
    },

    /**
     * 存储管理
     */
    storage: {
      get: function (key, defaultValue) {
        try {
          var val = localStorage.getItem('sz_easter_' + key);
          return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
          return defaultValue;
        }
      },
      set: function (key, value) {
        try {
          localStorage.setItem('sz_easter_' + key, JSON.stringify(value));
        } catch (e) {}
      },
      remove: function (key) {
        try {
          localStorage.removeItem('sz_easter_' + key);
        } catch (e) {}
      }
    },

    /**
     * 触发自定义事件
     */
    emit: function (eventName, data) {
      var event = new CustomEvent('sz:easter:' + eventName, { detail: data });
      document.dispatchEvent(event);
    },

    /**
     * 监听自定义事件
     */
    listen: function (eventName, handler) {
      document.addEventListener('sz:easter:' + eventName, handler);
    },

    /**
     * 获取题目数据 (与主应用集成)
     */
    getQuestion: function (difficulty) {
      // 如果主应用提供了获取题目接口，则调用
      if (SZ.quizEngine && SZ.quizEngine.getQuestion) {
        return SZ.quizEngine.getQuestion(difficulty);
      }
      // 备用模拟题目
      return this.generateMockQuestion(difficulty);
    },

    /**
     * 生成模拟题目（用于演示/测试）
     */
    generateMockQuestion: function (difficulty) {
      var questions = [
        {
          id: 1,
          type: 'single',
          question: 'JavaScript中，以下哪个不是原始数据类型？',
          options: ['String', 'Number', 'Array', 'Boolean'],
          answer: 2,
          difficulty: 1
        },
        {
          id: 2,
          type: 'single',
          question: 'CSS中，position: absolute相对于什么定位？',
          options: ['浏览器窗口', '最近的定位祖先元素', '父元素', 'body元素'],
          answer: 1,
          difficulty: 1
        },
        {
          id: 3,
          type: 'single',
          question: 'HTTP状态码404表示什么？',
          options: ['服务器错误', '请求成功', '资源未找到', '重定向'],
          answer: 2,
          difficulty: 1
        },
        {
          id: 4,
          type: 'single',
          question: '以下哪个是React的Hook？',
          options: ['useData', 'useState', 'useObject', 'useVariable'],
          answer: 1,
          difficulty: 2
        },
        {
          id: 5,
          type: 'single',
          question: 'Git中，撤销上一次提交的命令是？',
          options: ['git undo', 'git revert', 'git cancel', 'git rollback'],
          answer: 1,
          difficulty: 2
        },
        {
          id: 6,
          type: 'single',
          question: '算法的时间复杂度O(n)表示什么？',
          options: ['常数时间', '线性时间', '平方时间', '对数时间'],
          answer: 1,
          difficulty: 2
        },
        {
          id: 7,
          type: 'single',
          question: '数据库的ACID特性中，"I"代表什么？',
          options: ['Integrity', 'Isolation', 'Index', 'Interface'],
          answer: 1,
          difficulty: 3
        },
        {
          id: 8,
          type: 'single',
          question: 'TCP三次握手的目的是？',
          options: ['加密数据', '建立可靠连接', '压缩数据', '路由选择'],
          answer: 1,
          difficulty: 3
        },
        {
          id: 9,
          type: 'multi',
          question: '以下哪些是JavaScript的循环语句？（多选）',
          options: ['for', 'while', 'foreach', 'do...while'],
          answer: [0, 1, 3],
          difficulty: 2
        },
        {
          id: 10,
          type: 'single',
          question: '红黑树的时间复杂度是？',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          answer: 2,
          difficulty: 3
        },
        {
          id: 11,
          type: 'single',
          question: 'Vue3中，哪个API用于创建响应式数据？',
          options: ['reactive()', 'observable()', 'watch()', 'computed()'],
          answer: 0,
          difficulty: 2
        },
        {
          id: 12,
          type: 'single',
          question: '以下哪种排序算法的平均时间复杂度最优？',
          options: ['冒泡排序', '快速排序', '选择排序', '插入排序'],
          answer: 1,
          difficulty: 2
        },
        {
          id: 13,
          type: 'single',
          question: '什么是闭包(Closure)？',
          options: [
            '一种数据结构',
            '函数和其词法环境的组合',
            '一种设计模式',
            '一种加密算法'
          ],
          answer: 1,
          difficulty: 2
        },
        {
          id: 14,
          type: 'single',
          question: 'HTTPS相比HTTP主要增加了什么？',
          options: ['更快的速度', 'SSL/TLS加密', '更多的端口', '更大的带宽'],
          answer: 1,
          difficulty: 1
        },
        {
          id: 15,
          type: 'single',
          question: 'Promise的三种状态不包括以下哪个？',
          options: ['pending', 'fulfilled', 'rejected', 'completed'],
          answer: 3,
          difficulty: 2
        }
      ];

      // 根据难度筛选
      var filtered = difficulty
        ? questions.filter(function (q) { return q.difficulty <= difficulty; })
        : questions;

      return filtered[Math.floor(Math.random() * filtered.length)];
    },

    /**
     * 检查答案是否正确
     */
    checkAnswer: function (question, userAnswer) {
      if (question.type === 'multi' && Array.isArray(question.answer)) {
        if (!Array.isArray(userAnswer)) return false;
        if (userAnswer.length !== question.answer.length) return false;
        var sorted1 = userAnswer.slice().sort();
        var sorted2 = question.answer.slice().sort();
        return sorted1.every(function (v, i) { return v === sorted2[i]; });
      }
      return userAnswer === question.answer;
    }
  };

  // ============================================================
  //  解锁系统
  // ============================================================
  var UnlockSystem = {
    _logoClickCount: 0,
    _logoClickTimer: null,
    _konamiCode: [],
    _konamiSequence: [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ],
    _unlocked: false,
    _unlockedModes: {},

    /**
     * 初始化解锁系统
     */
    init: function () {
      this._unlocked = Utils.storage.get('unlocked', false);
      this._unlockedModes = Utils.storage.get('unlockedModes', {});
      this._bindLogoClick();
      this._bindKonamiCode();
      this._bindSettingsToggle();
    },

    /**
     * 绑定Logo点击解锁
     */
    _bindLogoClick: function () {
      var self = this;
      var logo = document.querySelector('.sz-logo, [data-sz-logo]');
      if (!logo) {
        // 如果Logo不存在，延迟绑定
        setTimeout(function () { self._bindLogoClick(); }, 1000);
        return;
      }

      Utils.on(logo, 'click', function () {
        self._logoClickCount++;
        clearTimeout(self._logoClickTimer);
        self._logoClickTimer = setTimeout(function () {
          self._logoClickCount = 0;
        }, 2000);

        if (self._logoClickCount >= 10) {
          self._logoClickCount = 0;
          if (!self._unlocked) {
            self.unlockAll();
            self._showUnlockToast('恭喜！你发现了彩蛋模式入口！');
            Utils.emit('unlocked', { method: 'logo_click' });
          }
        }

        // 进度提示
        if (self._logoClickCount > 3 && self._logoClickCount < 10) {
          self._showProgressToast('再点 ' + (10 - self._logoClickCount) + ' 次...');
        }
      });
    },

    /**
     * 绑定科乐美秘籍
     */
    _bindKonamiCode: function () {
      var self = this;
      Utils.on(document, 'keydown', function (e) {
        self._konamiCode.push(e.code);
        if (self._konamiCode.length > 10) {
          self._konamiCode.shift();
        }

        var matches = self._konamiCode.every(function (code, i) {
          return code === self._konamiSequence[i];
        });

        if (matches && self._konamiCode.length === 10) {
          self._konamiCode = [];
          if (!self._unlocked) {
            self.unlockAll();
            self._showUnlockToast('科乐美秘籍生效！彩蛋模式已解锁！');
            Utils.emit('unlocked', { method: 'konami' });
          } else {
            self._showUnlockToast('彩蛋模式已经解锁啦~');
          }
        }
      });
    },

    /**
     * 绑定设置开关
     */
    _bindSettingsToggle: function () {
      var self = this;
      Utils.listen('settings:toggle-easter', function (e) {
        if (e.detail && e.detail.enabled) {
          self.unlockAll();
        } else {
          self._unlocked = false;
          Utils.storage.set('unlocked', false);
        }
      });
    },

    /**
     * 解锁所有模式
     */
    unlockAll: function () {
      this._unlocked = true;
      Utils.storage.set('unlocked', true);
      Utils.emit('easter-unlocked', {});
    },

    /**
     * 解锁单个模式
     */
    unlockMode: function (modeId) {
      this._unlockedModes[modeId] = true;
      Utils.storage.set('unlockedModes', this._unlockedModes);
    },

    /**
     * 检查是否已解锁
     */
    isUnlocked: function () {
      return this._unlocked;
    },

    /**
     * 检查模式是否解锁
     */
    isModeUnlocked: function (modeId) {
      if (this._unlocked) return true;
      return !!this._unlockedModes[modeId];
    },

    /**
     * 通过成就解锁
     */
    unlockByAchievement: function (achievementId, modeId) {
      if (!this._unlockedModes[modeId]) {
        this.unlockMode(modeId);
        this._showUnlockToast('成就达成！新模式已解锁：' + (SZ.easterEggs.modes[modeId]?.name || modeId));
      }
    },

    /**
     * 显示解锁提示
     */
    _showUnlockToast: function (message) {
      var toast = Utils.createEl('div', 'sz-easter-toast sz-easter-toast-unlock');
      toast.innerHTML = '<div class="sz-easter-toast-icon">🎉</div>' +
                        '<div class="sz-easter-toast-text">' + message + '</div>';
      document.body.appendChild(toast);

      // 动画
      requestAnimationFrame(function () {
        toast.classList.add('sz-easter-toast-show');
      });

      setTimeout(function () {
        toast.classList.remove('sz-easter-toast-show');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 3000);
    },

    /**
     * 显示进度提示
     */
    _showProgressToast: function (message) {
      var existing = document.querySelector('.sz-easter-progress-toast');
      if (existing) {
        existing.querySelector('.sz-easter-toast-text').textContent = message;
        return;
      }

      var toast = Utils.createEl('div', 'sz-easter-toast sz-easter-progress-toast');
      toast.innerHTML = '<div class="sz-easter-toast-text">' + message + '</div>';
      document.body.appendChild(toast);

      requestAnimationFrame(function () {
        toast.classList.add('sz-easter-toast-show');
      });

      setTimeout(function () {
        toast.classList.remove('sz-easter-toast-show');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 1500);
    }
  };

  // ============================================================
  //  模式管理器
  // ============================================================
  var ModeManager = {
    _currentMode: null,
    _modeInstances: {},
    _container: null,

    /**
     * 初始化
     */
    init: function () {
      UnlockSystem.init();
      this._createContainer();
    },

    /**
     * 创建容器
     */
    _createContainer: function () {
      var container = document.getElementById('sz-easter-container');
      if (!container) {
        container = Utils.createEl('div', 'sz-easter-container');
        container.id = 'sz-easter-container';
        document.body.appendChild(container);
      }
      this._container = container;
    },

    /**
     * 获取所有可用模式
     */
    getAvailableModes: function () {
      var modes = [];
      for (var id in SZ.easterEggs.modes) {
        if (SZ.easterEggs.modes.hasOwnProperty(id)) {
          modes.push({
            id: id,
            name: SZ.easterEggs.modes[id].name,
            description: SZ.easterEggs.modes[id].description,
            icon: SZ.easterEggs.modes[id].icon,
            unlocked: UnlockSystem.isModeUnlocked(id)
          });
        }
      }
      return modes;
    },

    /**
     * 启动模式
     */
    startMode: function (modeId, options) {
      if (!UnlockSystem.isModeUnlocked(modeId)) {
        console.warn('模式未解锁:', modeId);
        return false;
      }

      // 停止当前模式
      if (this._currentMode) {
        this.stopMode();
      }

      var ModeClass = SZ.easterEggs.modes[modeId];
      if (!ModeClass) {
        console.error('模式不存在:', modeId);
        return false;
      }

      // 清空容器
      this._container.innerHTML = '';
      this._container.className = 'sz-easter-container sz-easter-mode-' + modeId.toLowerCase();

      // 创建模式实例
      var instance = new ModeClass(this._container, options || {});
      this._modeInstances[modeId] = instance;
      this._currentMode = modeId;

      // 显示容器
      this._container.style.display = 'block';

      // 启动模式
      if (typeof instance.start === 'function') {
        instance.start();
      }

      Utils.emit('mode-started', { mode: modeId });
      return true;
    },

    /**
     * 停止当前模式
     */
    stopMode: function () {
      if (this._currentMode && this._modeInstances[this._currentMode]) {
        var instance = this._modeInstances[this._currentMode];
        if (typeof instance.stop === 'function') {
          instance.stop();
        }
        if (typeof instance.destroy === 'function') {
          instance.destroy();
        }
        delete this._modeInstances[this._currentMode];
      }
      this._currentMode = null;
      this._container.style.display = 'none';
      this._container.innerHTML = '';

      Utils.emit('mode-stopped', {});
    },

    /**
     * 获取当前模式
     */
    getCurrentMode: function () {
      return this._currentMode;
    }
  };

  // ============================================================
  //  基础模式类
  // ============================================================
  var BaseMode = function (container, options) {
    this.container = container;
    this.options = options || {};
    this.score = 0;
    this.level = 1;
    this.isRunning = false;
    this.questionCount = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this._timers = [];
    this._intervals = [];
    this._animationFrames = [];
    this._eventHandlers = [];
  };

  BaseMode.prototype = {
    constructor: BaseMode,

    /**
     * 启动模式
     */
    start: function () {
      this.isRunning = true;
      this._render();
      this._bindEvents();
      this._onStart();
    },

    /**
     * 停止模式
     */
    stop: function () {
      this.isRunning = false;
      this._clearAllTimers();
      this._unbindEvents();
      this._onStop();
    },

    /**
     * 销毁模式
     */
    destroy: function () {
      this._clearAllTimers();
      this._unbindEvents();
      this.container.innerHTML = '';
    },

    /**
     * 渲染UI (子类重写)
     */
    _render: function () {},

    /**
     * 绑定事件 (子类重写)
     */
    _bindEvents: function () {},

    /**
     * 解绑事件
     */
    _unbindEvents: function () {
      for (var i = 0; i < this._eventHandlers.length; i++) {
        var handler = this._eventHandlers[i];
        Utils.off(handler.el, handler.event, handler.fn);
      }
      this._eventHandlers = [];
    },

    /**
     * 启动时回调 (子类重写)
     */
    _onStart: function () {},

    /**
     * 停止时回调 (子类重写)
     */
    _onStop: function () {},

    /**
     * 设置定时器
     */
    _setTimeout: function (fn, delay) {
      var self = this;
      var timer = setTimeout(function () {
        fn();
        var idx = self._timers.indexOf(timer);
        if (idx > -1) self._timers.splice(idx, 1);
      }, delay);
      this._timers.push(timer);
      return timer;
    },

    /**
     * 设置间隔器
     */
    _setInterval: function (fn, interval) {
      var timer = setInterval(fn, interval);
      this._intervals.push(timer);
      return timer;
    },

    /**
     * 设置动画帧
     */
    _requestAnimationFrame: function (fn) {
      var self = this;
      function frame(time) {
        if (!self.isRunning) return;
        fn(time);
      }
      var id = requestAnimationFrame(frame);
      this._animationFrames.push(id);
      return id;
    },

    /**
     * 清除所有定时器
     */
    _clearAllTimers: function () {
      for (var i = 0; i < this._timers.length; i++) {
        clearTimeout(this._timers[i]);
      }
      this._timers = [];

      for (var j = 0; j < this._intervals.length; j++) {
        clearInterval(this._intervals[j]);
      }
      this._intervals = [];

      for (var k = 0; k < this._animationFrames.length; k++) {
        cancelAnimationFrame(this._animationFrames[k]);
      }
      this._animationFrames = [];
    },

    /**
     * 添加事件监听（自动管理）
     */
    _addEventListener: function (el, event, fn) {
      Utils.on(el, event, fn);
      this._eventHandlers.push({ el: el, event: event, fn: fn });
    },

    /**
     * 获取下一道题
     */
    _getNextQuestion: function (difficulty) {
      return Utils.getQuestion(difficulty || this.level);
    },

    /**
     * 检查答案
     */
    _checkAnswer: function (question, answer) {
      var correct = Utils.checkAnswer(question, answer);
      this.questionCount++;
      if (correct) {
        this.correctCount++;
        Utils.playSound('correct');
      } else {
        this.wrongCount++;
        Utils.playSound('wrong');
      }
      return correct;
    },

    /**
     * 更新分数
     */
    _addScore: function (points) {
      this.score += points;
      this._updateScoreUI();
    },

    /**
     * 更新分数UI (子类重写)
     */
    _updateScoreUI: function () {},

    /**
     * 显示结果
     */
    _showResult: function () {
      var result = Utils.createEl('div', 'sz-easter-result-overlay');
      result.innerHTML =
        '<div class="sz-easter-result-card">' +
          '<h2 class="sz-easter-result-title">挑战结束</h2>' +
          '<div class="sz-easter-result-stats">' +
            '<div class="sz-easter-stat"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value">' + this.score + '</span></div>' +
            '<div class="sz-easter-stat"><span class="sz-easter-stat-label">答题数</span><span class="sz-easter-stat-value">' + this.questionCount + '</span></div>' +
            '<div class="sz-easter-stat"><span class="sz-easter-stat-label">正确率</span><span class="sz-easter-stat-value">' +
              (this.questionCount > 0 ? Math.round(this.correctCount / this.questionCount * 100) : 0) + '%</span></div>' +
          '</div>' +
          '<div class="sz-easter-result-actions">' +
            '<button class="sz-easter-btn sz-easter-btn-primary" data-action="restart">再来一次</button>' +
            '<button class="sz-easter-btn" data-action="exit">退出</button>' +
          '</div>' +
        '</div>';

      this.container.appendChild(result);

      var self = this;
      result.querySelector('[data-action="restart"]').onclick = function () {
        result.remove();
        self.score = 0;
        self.level = 1;
        self.questionCount = 0;
        self.correctCount = 0;
        self.wrongCount = 0;
        self._render();
      };

      result.querySelector('[data-action="exit"]').onclick = function () {
        ModeManager.stopMode();
      };
    }
  };

  // ============================================================
  //  导出
  // ============================================================
  SZ.easterEggs.Utils = Utils;
  SZ.easterEggs.UnlockSystem = UnlockSystem;
  SZ.easterEggs.ModeManager = ModeManager;
  SZ.easterEggs.BaseMode = BaseMode;
  SZ.easterEggs.modes = {};

  // ============================================================
  //  模式1: 打字机模式 (TypewriterMode)
  // ============================================================
  /**
   * 打字机模式
   * 题目文字逐字显示（打字机效果）
   * 选项也逐个出现
   * 配合打字音效
   * 速度可调
   */
  var TypewriterMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.typingSpeed = this.options.speed || 80; // 打字速度(ms/字)
    this.currentQuestion = null;
    this.typedText = '';
    this.typingIndex = 0;
    this.isTyping = false;
    this.canAnswer = false;
    this._questionEl = null;
    this._optionsEl = null;
    this._speedControl = null;
    this.comboCount = 0;
    this.maxCombo = 0;
  };

  TypewriterMode.prototype = Object.create(BaseMode.prototype);
  TypewriterMode.prototype.constructor = TypewriterMode;

  TypewriterMode.displayName = '打字机模式';
  TypewriterMode.description = '题目文字逐字显示，像打字机一样输出，考验你的阅读速度和反应力';
  TypewriterMode.icon = '⌨️';
  TypewriterMode.uiClass = 'sz-easter-typewriter';

  TypewriterMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-typewriter-header">' +
        '<div class="sz-easter-typewriter-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
        '</div>' +
        '<div class="sz-easter-typewriter-speed-control">' +
          '<label>打字速度：</label>' +
          '<input type="range" class="sz-easter-speed-slider" min="20" max="200" value="80" step="10">' +
          '<span class="sz-easter-speed-value">80ms</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-typewriter-main">' +
        '<div class="sz-easter-typewriter-question" data-role="question">' +
          '<span class="sz-easter-typewriter-cursor">|</span>' +
        '</div>' +
        '<div class="sz-easter-typewriter-options" data-role="options"></div>' +
      '</div>' +
      '<div class="sz-easter-typewriter-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-skip" data-action="skip">跳过打字</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');
    this._speedControl = this.container.querySelector('.sz-easter-speed-slider');

    this._loadNextQuestion();
  };

  TypewriterMode.prototype._bindEvents = function () {
    var self = this;

    // 速度调节
    if (this._speedControl) {
      this._addEventListener(this._speedControl, 'input', function (e) {
        self.typingSpeed = parseInt(e.target.value, 10);
        var valEl = self.container.querySelector('.sz-easter-speed-value');
        if (valEl) valEl.textContent = self.typingSpeed + 'ms';
      });
    }

    // 跳过打字
    var skipBtn = this.container.querySelector('[data-action="skip"]');
    if (skipBtn) {
      this._addEventListener(skipBtn, 'click', function () {
        self._skipTyping();
      });
    }

    // 退出
    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 键盘快捷键
    this._addEventListener(document, 'keydown', function (e) {
      if (!self.isRunning || !self.canAnswer) return;
      var key = e.key;
      if (key >= '1' && key <= '4') {
        var idx = parseInt(key, 10) - 1;
        var optionBtns = self._optionsEl.querySelectorAll('.sz-easter-typewriter-option');
        if (optionBtns[idx]) {
          optionBtns[idx].click();
        }
      }
      if (key === ' ' && self.isTyping) {
        e.preventDefault();
        self._skipTyping();
      }
    });
  };

  TypewriterMode.prototype._loadNextQuestion = function () {
    this.canAnswer = false;
    this.isTyping = true;
    this.currentQuestion = this._getNextQuestion();
    this.typedText = '';
    this.typingIndex = 0;
    this._questionEl.innerHTML = '<span class="sz-easter-typewriter-question-text"></span><span class="sz-easter-typewriter-cursor">|</span>';
    this._optionsEl.innerHTML = '';
    this._typeQuestion();
  };

  TypewriterMode.prototype._typeQuestion = function () {
    var self = this;
    var text = this.currentQuestion.question;
    var textEl = this._questionEl.querySelector('.sz-easter-typewriter-question-text');

    function typeChar() {
      if (!self.isRunning || !self.isTyping) return;

      if (self.typingIndex < text.length) {
        self.typedText += text[self.typingIndex];
        textEl.textContent = self.typedText;
        self.typingIndex++;
        Utils.playSound('typewriter');
        self._setTimeout(typeChar, self.typingSpeed);
      } else {
        self.isTyping = false;
        self._showOptions();
      }
    }

    typeChar();
  };

  TypewriterMode.prototype._skipTyping = function () {
    if (!this.isTyping) return;
    this.isTyping = false;
    this.typedText = this.currentQuestion.question;
    var textEl = this._questionEl.querySelector('.sz-easter-typewriter-question-text');
    if (textEl) textEl.textContent = this.typedText;
    this._showOptions();
  };

  TypewriterMode.prototype._showOptions = function () {
    var self = this;
    var options = this.currentQuestion.options;
    this._optionsEl.innerHTML = '';

    options.forEach(function (opt, idx) {
      self._setTimeout(function () {
        if (!self.isRunning) return;
        var btn = Utils.createEl('div', 'sz-easter-typewriter-option', self._optionsEl);
        btn.setAttribute('data-index', idx);
        btn.innerHTML =
          '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
          '<span class="sz-easter-option-text">' + opt + '</span>';

        btn.style.opacity = '0';
        btn.style.transform = 'translateX(-20px)';
        requestAnimationFrame(function () {
          btn.style.transition = 'all 0.3s ease';
          btn.style.opacity = '1';
          btn.style.transform = 'translateX(0)';
        });

        Utils.playSound('typewriter');

        btn.onclick = function () {
          if (!self.canAnswer) return;
          self._submitAnswer(idx);
        };
      }, idx * 200);
    });

    // 所有选项显示完后才能答题
    this._setTimeout(function () {
      self.canAnswer = true;
    }, options.length * 200);
  };

  TypewriterMode.prototype._submitAnswer = function (answerIdx) {
    if (!this.canAnswer) return;
    this.canAnswer = false;

    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-typewriter-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) {
        btn.classList.add('sz-easter-correct');
      } else if (idx === answerIdx && !correct) {
        btn.classList.add('sz-easter-wrong');
      }
    }.bind(this));

    if (correct) {
      this.comboCount++;
      this.maxCombo = Math.max(this.maxCombo, this.comboCount);
      var bonus = Math.floor(this.comboCount * 5);
      var baseScore = 10 + bonus;
      this._addScore(baseScore);

      // 连击特效
      if (this.comboCount >= 3) {
        this._showComboEffect();
      }

      // 每5题升级
      if (this.correctCount > 0 && this.correctCount % 5 === 0) {
        this.level++;
        this._updateLevelUI();
      }
    } else {
      this.comboCount = 0;
    }

    this._updateComboUI();

    var self = this;
    this._setTimeout(function () {
      if (self.questionCount >= 20) {
        self._showResult();
      } else {
        self._loadNextQuestion();
      }
    }, 1200);
  };

  TypewriterMode.prototype._showComboEffect = function () {
    var combo = Utils.createEl('div', 'sz-easter-combo-effect');
    combo.textContent = this.comboCount + ' 连击!';
    combo.style.top = '30%';
    combo.style.left = '50%';
    this.container.appendChild(combo);

    requestAnimationFrame(function () {
      combo.style.transition = 'all 0.8s ease-out';
      combo.style.transform = 'translate(-50%, -50%) scale(1.5)';
      combo.style.opacity = '0';
    });

    var self = this;
    setTimeout(function () {
      if (combo.parentNode) combo.parentNode.removeChild(combo);
    }, 800);
  };

  TypewriterMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) {
      el.textContent = this.score;
      el.classList.add('sz-easter-score-pop');
      var self = this;
      setTimeout(function () {
        if (el) el.classList.remove('sz-easter-score-pop');
      }, 300);
    }
  };

  TypewriterMode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this.comboCount;
  };

  TypewriterMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this.level;
    Utils.playSound('levelup');
  };

  SZ.easterEggs.modes.TypewriterMode = TypewriterMode;


  // ============================================================
  //  模式2: 重力模式 (GravityMode)
  // ============================================================
  /**
   * 重力模式
   * 选项像有重力一样会下落
   * 需要在规定时间内点击正确选项
   * 选错会被"砸到"并扣分
   * 难度递增，下落越来越快
   */
  var GravityMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.fallSpeed = this.options.fallSpeed || 1.5; // 初始下落速度
    this.lives = 3;
    this.maxLives = 3;
    this.currentQuestion = null;
    this._gameArea = null;
    this._fallingOptions = [];
    this._lastTime = 0;
    this._spawnTimer = 0;
    this._spawnInterval = 2000;
    this._groundY = 0;
    this.gameWidth = 0;
    this.gameHeight = 0;
    this._caughtCorrect = false;
  };

  GravityMode.prototype = Object.create(BaseMode.prototype);
  GravityMode.prototype.constructor = GravityMode;

  GravityMode.displayName = '重力模式';
  GravityMode.description = '选项从天而降，快速点击正确答案，被错误选项砸到会扣血！';
  GravityMode.icon = '⬇️';
  GravityMode.uiClass = 'sz-easter-gravity';

  GravityMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-gravity-header">' +
        '<div class="sz-easter-gravity-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">生命</span><span class="sz-easter-stat-value" data-stat="lives">❤️❤️❤️</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
        '</div>' +
        '<div class="sz-easter-gravity-question" data-role="question-bar">' +
          '<span class="sz-easter-gravity-question-text">准备开始...</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-gravity-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-gravity-ground"></div>' +
      '</div>' +
      '<div class="sz-easter-gravity-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._gameArea = this.container.querySelector('[data-role="gamearea"]');

    var self = this;
    this._setTimeout(function () {
      self._initGameArea();
      self._loadNextQuestion();
      self._gameLoop();
    }, 100);
  };

  GravityMode.prototype._bindEvents = function () {
    var self = this;
    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 窗口大小变化
    this._addEventListener(window, 'resize', function () {
      self._initGameArea();
    });
  };

  GravityMode.prototype._initGameArea = function () {
    if (!this._gameArea) return;
    var rect = this._gameArea.getBoundingClientRect();
    this.gameWidth = rect.width;
    this.gameHeight = rect.height;
    this._groundY = this.gameHeight - 60; // 地面高度
  };

  GravityMode.prototype._loadNextQuestion = function () {
    this.currentQuestion = this._getNextQuestion(this.level);
    this._caughtCorrect = false;
    var qBar = this.container.querySelector('.sz-easter-gravity-question-text');
    if (qBar) qBar.textContent = this.currentQuestion.question;

    // 准备要下落的选项列表（打乱顺序）
    this._pendingOptions = Utils.shuffle(this.currentQuestion.options.map(function (opt, idx) {
      return { text: opt, index: idx, isCorrect: idx === this.currentQuestion.answer };
    }.bind(this)));
    this._spawnIndex = 0;
    this._spawnTimer = 0;
  };

  GravityMode.prototype._spawnOption = function () {
    if (this._spawnIndex >= this._pendingOptions.length) {
      // 所有选项都已生成，生成额外干扰项
      if (Math.random() < 0.3) {
        var fakeOpt = {
          text: Utils.randomChoice(this.currentQuestion.options),
          index: -1,
          isCorrect: false,
          isFake: true
        };
        this._createFallingOption(fakeOpt);
      }
      return;
    }

    var opt = this._pendingOptions[this._spawnIndex];
    this._createFallingOption(opt);
    this._spawnIndex++;
  };

  GravityMode.prototype._createFallingOption = function (optData) {
    var el = Utils.createEl('div', 'sz-easter-gravity-option', this._gameArea);
    if (optData.isFake) el.classList.add('sz-easter-gravity-fake');

    var x = Utils.random(20, this.gameWidth - 140);
    el.style.left = x + 'px';
    el.style.top = '-60px';
    el.textContent = optData.text;

    var fallingObj = {
      el: el,
      x: x,
      y: -60,
      speed: this.fallSpeed + Utils.random(-0.3, 0.5) + this.level * 0.2,
      data: optData
    };

    this._fallingOptions.push(fallingObj);

    var self = this;
    el.onclick = function () {
      self._onOptionClick(fallingObj);
    };
  };

  GravityMode.prototype._onOptionClick = function (fallingObj) {
    if (!this.isRunning) return;

    var optData = fallingObj.data;
    this._removeFallingOption(fallingObj);

    if (optData.isFake) {
      // 干扰项，扣分
      this._addScore(-5);
      this._showFloatingText(fallingObj.x, fallingObj.y, '-5', 'wrong');
      Utils.playSound('wrong');
      return;
    }

    var correct = optData.isCorrect;
    this._checkAnswer(this.currentQuestion, optData.index);

    if (correct) {
      this._caughtCorrect = true;
      var baseScore = 20 + this.level * 5;
      this._addScore(baseScore);
      this._showFloatingText(fallingObj.x, fallingObj.y, '+' + baseScore, 'correct');
      Utils.playSound('correct');

      // 下一题
      var self = this;
      this._setTimeout(function () {
        // 清空剩余选项
        self._clearAllOptions();
        self._levelUpCheck();
        self._loadNextQuestion();
      }, 500);
    } else {
      this._addScore(-10);
      this._showFloatingText(fallingObj.x, fallingObj.y, '-10', 'wrong');
      Utils.playSound('hit');
    }
  };

  GravityMode.prototype._removeFallingOption = function (fallingObj) {
    var idx = this._fallingOptions.indexOf(fallingObj);
    if (idx > -1) {
      this._fallingOptions.splice(idx, 1);
    }
    if (fallingObj.el && fallingObj.el.parentNode) {
      fallingObj.el.parentNode.removeChild(fallingObj.el);
    }
  };

  GravityMode.prototype._clearAllOptions = function () {
    for (var i = this._fallingOptions.length - 1; i >= 0; i--) {
      var opt = this._fallingOptions[i];
      if (opt.el && opt.el.parentNode) {
        opt.el.parentNode.removeChild(opt.el);
      }
    }
    this._fallingOptions = [];
  };

  GravityMode.prototype._gameLoop = function (timestamp) {
    if (!this.isRunning) return;

    if (!this._lastTime) this._lastTime = timestamp;
    var delta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    // 更新下落
    for (var i = this._fallingOptions.length - 1; i >= 0; i--) {
      var opt = this._fallingOptions[i];
      opt.y += opt.speed * (delta / 16);
      opt.el.style.top = opt.y + 'px';

      // 碰到地面
      if (opt.y >= this._groundY) {
        if (opt.data.isCorrect && !this._caughtCorrect) {
          // 正确答案落地，扣血
          this._loseLife();
        }
        if (!opt.data.isFake) {
          // 普通选项落地，有震动效果
          this._shakeGround();
        }
        this._removeFallingOption(opt);
      }
    }

    // 生成新选项
    this._spawnTimer += delta;
    var spawnInterval = Math.max(600, this._spawnInterval - this.level * 100);
    if (this._spawnTimer >= spawnInterval) {
      this._spawnTimer = 0;
      this._spawnOption();
    }

    var self = this;
    this._animationFrameId = requestAnimationFrame(function (t) {
      self._gameLoop(t);
    });
  };

  GravityMode.prototype._loseLife = function () {
    this.lives--;
    this._updateLivesUI();
    Utils.playSound('hit');

    // 屏幕震动
    this._gameArea.classList.add('sz-easter-shake');
    var self = this;
    setTimeout(function () {
      if (self._gameArea) self._gameArea.classList.remove('sz-easter-shake');
    }, 300);

    if (this.lives <= 0) {
      this._gameOver();
    }
  };

  GravityMode.prototype._shakeGround = function () {
    var ground = this._gameArea.querySelector('.sz-easter-gravity-ground');
    if (ground) {
      ground.classList.add('sz-easter-ground-shake');
      setTimeout(function () {
        if (ground) ground.classList.remove('sz-easter-ground-shake');
      }, 200);
    }
  };

  GravityMode.prototype._levelUpCheck = function () {
    if (this.correctCount > 0 && this.correctCount % 3 === 0) {
      this.level++;
      this.fallSpeed += 0.3;
      this._updateLevelUI();
      Utils.playSound('levelup');
    }
  };

  GravityMode.prototype._showFloatingText = function (x, y, text, type) {
    var floatEl = Utils.createEl('div', 'sz-easter-floating-text sz-easter-float-' + type, this._gameArea);
    floatEl.textContent = text;
    floatEl.style.left = x + 'px';
    floatEl.style.top = y + 'px';

    requestAnimationFrame(function () {
      floatEl.style.transition = 'all 0.8s ease-out';
      floatEl.style.transform = 'translateY(-60px)';
      floatEl.style.opacity = '0';
    });

    setTimeout(function () {
      if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, 800);
  };

  GravityMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  GravityMode.prototype._updateLivesUI = function () {
    var el = this.container.querySelector('[data-stat="lives"]');
    if (el) {
      var hearts = '';
      for (var i = 0; i < this.maxLives; i++) {
        hearts += i < this.lives ? '❤️' : '🖤';
      }
      el.textContent = hearts;
    }
  };

  GravityMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this.level;
  };

  GravityMode.prototype._gameOver = function () {
    this.isRunning = false;
    this._clearAllOptions();
    this._showResult();
  };

  GravityMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
    }
    this._clearAllOptions();
  };

  SZ.easterEggs.modes.GravityMode = GravityMode;


  // ============================================================
  //  模式3: 消消乐模式 (Match3Mode)
  // ============================================================
  /**
   * 消消乐模式
   * 答对题目后触发消消乐小游戏
   * 连续答对获得额外奖励分
   * 消除特效
   */
  var Match3Mode = function (container, options) {
    BaseMode.call(this, container, options);
    this.gridSize = 6;
    this._grid = [];
    this._gridEl = null;
    this._gemTypes = ['💎', '🔮', '⭐', '🌟', '💫', '🎯'];
    this._selectedGem = null;
    this.combo = 0;
    this._processing = false;
    this._matchScore = 0;
    this.currentQuestion = null;
    this._phase = 'question'; // question | match3
    this._questionEl = null;
    this._optionsEl = null;
    this._match3Overlay = null;
    this._matchTime = 10;
    this._matchTimer = null;
    this._matchTimeLeft = 0;
  };

  Match3Mode.prototype = Object.create(BaseMode.prototype);
  Match3Mode.prototype.constructor = Match3Mode;

  Match3Mode.displayName = '消消乐模式';
  Match3Mode.description = '答对题目触发消消乐小游戏，连击消除获得超多奖励分！';
  Match3Mode.icon = '💎';
  Match3Mode.uiClass = 'sz-easter-match3';

  Match3Mode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-match3-header">' +
        '<div class="sz-easter-match3-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">总分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-match3-main">' +
        '<div class="sz-easter-match3-question-area" data-role="question-area">' +
          '<div class="sz-easter-match3-question" data-role="question"></div>' +
          '<div class="sz-easter-match3-options" data-role="options"></div>' +
        '</div>' +
        '<div class="sz-easter-match3-overlay" data-role="match3-overlay" style="display:none">' +
          '<div class="sz-easter-match3-panel">' +
            '<div class="sz-easter-match3-panel-header">' +
              '<h3>消消乐奖励时间！</h3>' +
              '<div class="sz-easter-match3-timer">⏱️ <span data-role="match-time">10</span>s</div>' +
              '<div class="sz-easter-match3-score">奖励分: <span data-role="match-score">0</span></div>' +
            '</div>' +
            '<div class="sz-easter-match3-grid" data-role="grid"></div>' +
            '<div class="sz-easter-match3-panel-footer">' +
              '<button class="sz-easter-btn sz-easter-btn-primary" data-action="continue">继续答题</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-match3-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');
    this._match3Overlay = this.container.querySelector('[data-role="match3-overlay"]');
    this._gridEl = this.container.querySelector('[data-role="grid"]');

    this._loadNextQuestion();
  };

  Match3Mode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var continueBtn = this.container.querySelector('[data-action="continue"]');
    if (continueBtn) {
      this._addEventListener(continueBtn, 'click', function () {
        self._endMatch3Phase();
      });
    }
  };

  Match3Mode.prototype._loadNextQuestion = function () {
    this._phase = 'question';
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-match3-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  Match3Mode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-match3-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      this._addScore(10);
      this.combo++;
      this._updateComboUI();
      this._startMatch3Phase();
    } else {
      this.combo = 0;
      this._updateComboUI();
      var self = this;
      this._setTimeout(function () {
        self._nextQuestionOrEnd();
      }, 1000);
    }
  };

  Match3Mode.prototype._startMatch3Phase = function () {
    this._phase = 'match3';
    this._matchScore = 0;
    this._matchTimeLeft = 10 + this.level;
    this._match3Overlay.style.display = 'flex';
    this._updateMatchScoreUI();
    this._updateMatchTimeUI();

    this._initGrid();
    this._startMatchTimer();
  };

  Match3Mode.prototype._initGrid = function () {
    this._grid = [];
    this._gridEl.innerHTML = '';
    this._gridEl.style.gridTemplateColumns = 'repeat(' + this.gridSize + ', 1fr)';

    for (var row = 0; row < this.gridSize; row++) {
      this._grid[row] = [];
      for (var col = 0; col < this.gridSize; col++) {
        var gemType = Utils.randomInt(0, this._gemTypes.length - 1);
        // 确保初始没有三连
        while (
          (col >= 2 && this._grid[row][col-1] === gemType && this._grid[row][col-2] === gemType) ||
          (row >= 2 && this._grid[row-1][col] === gemType && this._grid[row-2][col] === gemType)
        ) {
          gemType = Utils.randomInt(0, this._gemTypes.length - 1);
        }
        this._grid[row][col] = gemType;
        this._createGemElement(row, col, gemType);
      }
    }
  };

  Match3Mode.prototype._createGemElement = function (row, col, gemType) {
    var gem = Utils.createEl('div', 'sz-easter-match3-gem', this._gridEl);
    gem.setAttribute('data-row', row);
    gem.setAttribute('data-col', col);
    gem.textContent = this._gemTypes[gemType];
    gem.style.animationDelay = (row * 0.05 + col * 0.03) + 's';

    var self = this;
    gem.onclick = function () {
      self._onGemClick(row, col);
    };

    return gem;
  };

  Match3Mode.prototype._onGemClick = function (row, col) {
    if (this._processing || this._phase !== 'match3') return;

    if (this._selectedGem === null) {
      this._selectedGem = { row: row, col: col };
      var gem = this._getGemEl(row, col);
      if (gem) gem.classList.add('sz-easter-gem-selected');
    } else {
      var selected = this._selectedGem;
      var prevGem = this._getGemEl(selected.row, selected.col);
      if (prevGem) prevGem.classList.remove('sz-easter-gem-selected');

      // 检查是否相邻
      var isAdjacent =
        (Math.abs(selected.row - row) === 1 && selected.col === col) ||
        (Math.abs(selected.col - col) === 1 && selected.row === row);

      if (isAdjacent) {
        this._swapGems(selected.row, selected.col, row, col);
      }

      this._selectedGem = null;
    }
  };

  Match3Mode.prototype._getGemEl = function (row, col) {
    return this._gridEl.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
  };

  Match3Mode.prototype._swapGems = function (r1, c1, r2, c2) {
    this._processing = true;

    // 交换数据
    var temp = this._grid[r1][c1];
    this._grid[r1][c1] = this._grid[r2][c2];
    this._grid[r2][c2] = temp;

    // 检查是否有消除
    var matches = this._findMatches();
    if (matches.length === 0) {
      // 没有消除，换回来
      var temp2 = this._grid[r1][c1];
      this._grid[r1][c1] = this._grid[r2][c2];
      this._grid[r2][c2] = temp2;
      this._processing = false;
      return;
    }

    // 更新显示
    this._updateGridDisplay();
    this._processMatches();
  };

  Match3Mode.prototype._findMatches = function () {
    var matches = [];
    var size = this.gridSize;

    // 横向检查
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size - 2; col++) {
        var type = this._grid[row][col];
        if (type === null) continue;
        var matchLen = 1;
        while (col + matchLen < size && this._grid[row][col + matchLen] === type) {
          matchLen++;
        }
        if (matchLen >= 3) {
          for (var i = 0; i < matchLen; i++) {
            matches.push({ row: row, col: col + i });
          }
          col += matchLen - 1;
        }
      }
    }

    // 纵向检查
    for (var c = 0; c < size; c++) {
      for (var r = 0; r < size - 2; r++) {
        var t = this._grid[r][c];
        if (t === null) continue;
        var mLen = 1;
        while (r + mLen < size && this._grid[r + mLen][c] === t) {
          mLen++;
        }
        if (mLen >= 3) {
          for (var j = 0; j < mLen; j++) {
            matches.push({ row: r + j, col: c });
          }
          r += mLen - 1;
        }
      }
    }

    // 去重
    var unique = [];
    var seen = {};
    for (var k = 0; k < matches.length; k++) {
      var key = matches[k].row + ',' + matches[k].col;
      if (!seen[key]) {
        seen[key] = true;
        unique.push(matches[k]);
      }
    }

    return unique;
  };

  Match3Mode.prototype._processMatches = function () {
    var self = this;
    var comboLevel = 0;

    function processStep() {
      var matches = self._findMatches();
      if (matches.length === 0) {
        self._processing = false;
        return;
      }

      comboLevel++;
      var points = matches.length * 2 * comboLevel;
      self._matchScore += points;
      self._addScore(points);
      self._updateMatchScoreUI();
      Utils.playSound('coin');

      // 消除动画
      matches.forEach(function (m) {
        var gem = self._getGemEl(m.row, m.col);
        if (gem) {
          gem.classList.add('sz-easter-gem-matching');
        }
        self._grid[m.row][m.col] = null;
      });

      self._setTimeout(function () {
        self._dropGems();
        self._fillGems();
        self._updateGridDisplay();
        processStep();
      }, 300);
    }

    processStep();
  };

  Match3Mode.prototype._dropGems = function () {
    var size = this.gridSize;
    for (var col = 0; col < size; col++) {
      var writeRow = size - 1;
      for (var row = size - 1; row >= 0; row--) {
        if (this._grid[row][col] !== null) {
          if (row !== writeRow) {
            this._grid[writeRow][col] = this._grid[row][col];
            this._grid[row][col] = null;
          }
          writeRow--;
        }
      }
    }
  };

  Match3Mode.prototype._fillGems = function () {
    var size = this.gridSize;
    for (var col = 0; col < size; col++) {
      for (var row = 0; row < size; row++) {
        if (this._grid[row][col] === null) {
          this._grid[row][col] = Utils.randomInt(0, this._gemTypes.length - 1);
        }
      }
    }
  };

  Match3Mode.prototype._updateGridDisplay = function () {
    var size = this.gridSize;
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        var gem = this._getGemEl(row, col);
        if (gem) {
          gem.textContent = this._gemTypes[this._grid[row][col]];
          gem.classList.remove('sz-easter-gem-matching', 'sz-easter-gem-selected');
        }
      }
    }
  };

  Match3Mode.prototype._startMatchTimer = function () {
    var self = this;
    this._matchInterval = this._setInterval(function () {
      self._matchTimeLeft--;
      self._updateMatchTimeUI();
      if (self._matchTimeLeft <= 0) {
        clearInterval(self._matchInterval);
        self._endMatch3Phase();
      }
    }, 1000);
  };

  Match3Mode.prototype._endMatch3Phase = function () {
    if (this._matchInterval) {
      clearInterval(this._matchInterval);
      this._matchInterval = null;
    }
    this._match3Overlay.style.display = 'none';
    this._phase = 'question';
    this._processing = false;

    // 每答对3题升级
    if (this.correctCount > 0 && this.correctCount % 3 === 0) {
      this.level++;
      this._updateLevelUI();
    }

    this._nextQuestionOrEnd();
  };

  Match3Mode.prototype._nextQuestionOrEnd = function () {
    if (this.questionCount >= 15) {
      this._showResult();
    } else {
      this._loadNextQuestion();
    }
  };

  Match3Mode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  Match3Mode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this.combo;
  };

  Match3Mode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this.level;
  };

  Match3Mode.prototype._updateMatchScoreUI = function () {
    var el = this.container.querySelector('[data-role="match-score"]');
    if (el) el.textContent = this._matchScore;
  };

  Match3Mode.prototype._updateMatchTimeUI = function () {
    var el = this.container.querySelector('[data-role="match-time"]');
    if (el) el.textContent = this._matchTimeLeft;
  };

  SZ.easterEggs.modes.Match3Mode = Match3Mode;


  // ============================================================
  //  模式4: 跑酷模式 (ParkourMode)
  // ============================================================
  /**
   * 跑酷模式
   * 角色自动向前跑
   * 遇到障碍时弹出题目
   * 答对跳过障碍，答错撞上
   * 生命值系统
   */
  var ParkourMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.lives = 3;
    this.maxLives = 3;
    this.distance = 0;
    this.speed = 3;
    this._playerY = 0;
    this._playerVelocity = 0;
    this._isJumping = false;
    this._groundY = 0;
    this._obstacles = [];
    this._gameWidth = 0;
    this._gameHeight = 0;
    this._gameArea = null;
    this._playerEl = null;
    this._obstacleTimer = 0;
    this._obstacleInterval = 3000;
    this._questionModal = null;
    this._currentObstacle = null;
    this._paused = false;
    this._backgroundOffset = 0;
  };

  ParkourMode.prototype = Object.create(BaseMode.prototype);
  ParkourMode.prototype.constructor = ParkourMode;

  ParkourMode.displayName = '跑酷模式';
  ParkourMode.description = '角色不停奔跑，遇到障碍时答题跳过，答错就撞上啦！';
  ParkourMode.icon = '🏃';
  ParkourMode.uiClass = 'sz-easter-parkour';

  ParkourMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-parkour-header">' +
        '<div class="sz-easter-parkour-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">生命</span><span class="sz-easter-stat-value" data-stat="lives">❤️❤️❤️</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">距离</span><span class="sz-easter-stat-value" data-stat="distance">0m</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-parkour-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-parkour-sky"></div>' +
        '<div class="sz-easter-parkour-ground"></div>' +
        '<div class="sz-easter-parkour-player" data-role="player">🏃</div>' +
        '<div class="sz-easter-parkour-clouds">' +
          '<div class="sz-easter-parkour-cloud" style="left:10%;top:15%">☁️</div>' +
          '<div class="sz-easter-parkour-cloud" style="left:40%;top:10%">☁️</div>' +
          '<div class="sz-easter-parkour-cloud" style="left:70%;top:20%">☁️</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-parkour-question-modal" data-role="question-modal" style="display:none">' +
        '<div class="sz-easter-parkour-modal-content">' +
          '<div class="sz-easter-parkour-modal-title">⚠️ 前方障碍！答题跳过！</div>' +
          '<div class="sz-easter-parkour-modal-question" data-role="question"></div>' +
          '<div class="sz-easter-parkour-modal-options" data-role="options"></div>' +
          '<div class="sz-easter-parkour-modal-timer"><span data-role="modal-timer">5</span>s</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-parkour-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._gameArea = this.container.querySelector('[data-role="gamearea"]');
    this._playerEl = this.container.querySelector('[data-role="player"]');
    this._questionModal = this.container.querySelector('[data-role="question-modal"]');

    var self = this;
    this._setTimeout(function () {
      self._initGame();
      self._gameLoop();
    }, 100);
  };

  ParkourMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 点击/空格跳跃（仅在非答题时）
    this._addEventListener(this._gameArea, 'click', function () {
      if (self.isRunning && !self._paused) {
        self._jump();
      }
    });

    this._addEventListener(document, 'keydown', function (e) {
      if (!self.isRunning) return;
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !self._paused) {
        e.preventDefault();
        self._jump();
      }
    });

    this._addEventListener(window, 'resize', function () {
      self._initGame();
    });
  };

  ParkourMode.prototype._initGame = function () {
    var rect = this._gameArea.getBoundingClientRect();
    this._gameWidth = rect.width;
    this._gameHeight = rect.height;
    this._groundY = this._gameHeight - 80;
    this._playerY = this._groundY;

    if (this._playerEl) {
      this._playerEl.style.bottom = (this._gameHeight - this._groundY) + 'px';
    }
  };

  ParkourMode.prototype._jump = function () {
    if (this._isJumping) return;
    this._isJumping = true;
    this._playerVelocity = -14;
    Utils.playSound('jump');
  };

  ParkourMode.prototype._gameLoop = function (timestamp) {
    if (!this.isRunning) return;
    if (this._paused) {
      var self = this;
      this._animationFrameId = requestAnimationFrame(function (t) {
        self._gameLoop(t);
      });
      return;
    }

    if (!this._lastTime) this._lastTime = timestamp;
    var delta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    // 更新玩家位置
    if (this._isJumping) {
      this._playerVelocity += 0.8; // 重力
      this._playerY += this._playerVelocity;

      if (this._playerY >= this._groundY) {
        this._playerY = this._groundY;
        this._playerVelocity = 0;
        this._isJumping = false;
      }

      if (this._playerEl) {
        this._playerEl.style.bottom = (this._gameHeight - this._playerY) + 'px';
      }
    }

    // 更新距离
    this.distance += this.speed * (delta / 16) * 0.1;
    this._updateDistanceUI();

    // 更新背景
    this._backgroundOffset -= this.speed * (delta / 16) * 0.5;
    if (this._backgroundOffset < -200) this._backgroundOffset = 0;

    // 更新障碍物
    for (var i = this._obstacles.length - 1; i >= 0; i--) {
      var obs = this._obstacles[i];
      obs.x -= this.speed * (delta / 16);
      obs.el.style.left = obs.x + 'px';

      // 碰撞检测
      if (!obs.passed && !obs.triggered) {
        var playerLeft = 60;
        var playerRight = 110;
        var obsLeft = obs.x;
        var obsRight = obs.x + obs.width;

        if (playerRight > obsLeft && playerLeft < obsRight) {
          // 检查是否跳过
          var playerBottom = this._playerY;
          var obsHeight = obs.height;
          if (playerBottom < this._groundY - obsHeight + 20) {
            // 成功跳过
            obs.passed = true;
            this._addScore(5);
          } else {
            // 触发题目
            obs.triggered = true;
            this._triggerQuestion(obs);
          }
        }
      }

      // 移除出界障碍物
      if (obs.x < -100) {
        if (obs.el && obs.el.parentNode) obs.el.parentNode.removeChild(obs.el);
        this._obstacles.splice(i, 1);
      }
    }

    // 生成障碍物
    this._obstacleTimer += delta;
    var currentInterval = Math.max(1500, this._obstacleInterval - this.level * 200);
    if (this._obstacleTimer >= currentInterval) {
      this._obstacleTimer = 0;
      this._spawnObstacle();
    }

    var self = this;
    this._animationFrameId = requestAnimationFrame(function (t) {
      self._gameLoop(t);
    });
  };

  ParkourMode.prototype._spawnObstacle = function () {
    var types = [
      { emoji: '🧱', height: 40, width: 40, difficulty: 1 },
      { emoji: '🌵', height: 60, width: 35, difficulty: 1 },
      { emoji: '🪨', height: 35, width: 45, difficulty: 1 },
      { emoji: '🔥', height: 50, width: 40, difficulty: 2 },
      { emoji: '⚡', height: 70, width: 30, difficulty: 3 }
    ];

    var availableTypes = types.filter(function (t) { return t.difficulty <= this.level; }.bind(this));
    var type = Utils.randomChoice(availableTypes);

    var obsEl = Utils.createEl('div', 'sz-easter-parkour-obstacle', this._gameArea);
    obsEl.textContent = type.emoji;
    obsEl.style.fontSize = type.height + 'px';
    obsEl.style.left = this._gameWidth + 'px';

    var obstacle = {
      el: obsEl,
      x: this._gameWidth,
      width: type.width,
      height: type.height,
      type: type,
      passed: false,
      triggered: false
    };

    this._obstacles.push(obstacle);
  };

  ParkourMode.prototype._triggerQuestion = function (obstacle) {
    this._paused = true;
    this._currentObstacle = obstacle;
    this._currentQuestion = this._getNextQuestion(obstacle.type.difficulty);

    var qEl = this._questionModal.querySelector('[data-role="question"]');
    var optsEl = this._questionModal.querySelector('[data-role="options"]');
    qEl.textContent = this._currentQuestion.question;
    optsEl.innerHTML = '';

    var self = this;
    this._currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-parkour-option', optsEl);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';
      btn.onclick = function () {
        self._answerQuestion(idx);
      };
    });

    this._questionModal.style.display = 'flex';

    // 倒计时
    this._modalTimeLeft = 5;
    this._updateModalTimerUI();
    this._modalInterval = this._setInterval(function () {
      self._modalTimeLeft--;
      self._updateModalTimerUI();
      if (self._modalTimeLeft <= 0) {
        clearInterval(self._modalInterval);
        self._answerQuestion(-1); // 超时算错
      }
    }, 1000);
  };

  ParkourMode.prototype._answerQuestion = function (answerIdx) {
    if (this._modalInterval) {
      clearInterval(this._modalInterval);
      this._modalInterval = null;
    }

    var correct = answerIdx >= 0 && this._checkAnswer(this._currentQuestion, answerIdx);

    if (correct) {
      this._addScore(15);
      // 跳跃过障碍
      this._currentObstacle.passed = true;
      this._jump();
      Utils.playSound('success');
    } else {
      // 撞上障碍
      this._loseLife();
    }

    var self = this;
    this._setTimeout(function () {
      self._questionModal.style.display = 'none';
      self._paused = false;
      self._currentObstacle = null;

      // 每跑500米升级
      if (Math.floor(self.distance / 500) > self.level - 1) {
        self.level = Math.floor(self.distance / 500) + 1;
        self.speed = 3 + self.level * 0.5;
        self._updateLevelUI();
      }
    }, 800);
  };

  ParkourMode.prototype._loseLife = function () {
    this.lives--;
    this._updateLivesUI();
    Utils.playSound('hit');

    this._gameArea.classList.add('sz-easter-shake');
    var self = this;
    setTimeout(function () {
      if (self._gameArea) self._gameArea.classList.remove('sz-easter-shake');
    }, 300);

    if (this.lives <= 0) {
      this._gameOver();
    }
  };

  ParkourMode.prototype._gameOver = function () {
    this.isRunning = false;
    this._showResult();
  };

  ParkourMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  ParkourMode.prototype._updateLivesUI = function () {
    var el = this.container.querySelector('[data-stat="lives"]');
    if (el) {
      var hearts = '';
      for (var i = 0; i < this.maxLives; i++) {
        hearts += i < this.lives ? '❤️' : '🖤';
      }
      el.textContent = hearts;
    }
  };

  ParkourMode.prototype._updateDistanceUI = function () {
    var el = this.container.querySelector('[data-stat="distance"]');
    if (el) el.textContent = Math.floor(this.distance) + 'm';
  };

  ParkourMode.prototype._updateLevelUI = function () {
    // 距离代替等级显示
  };

  ParkourMode.prototype._updateModalTimerUI = function () {
    var el = this._questionModal.querySelector('[data-role="modal-timer"]');
    if (el) el.textContent = this._modalTimeLeft;
  };

  ParkourMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
    }
    if (this._modalInterval) {
      clearInterval(this._modalInterval);
    }
  };

  SZ.easterEggs.modes.ParkourMode = ParkourMode;


  // ============================================================
  //  模式5: 打地鼠模式 (WhackAMoleMode)
  // ============================================================
  /**
   * 打地鼠模式
   * 选项随机出现在不同位置的洞里
   * 需要快速点击正确选项
   * 限时模式，比反应速度
   */
  var WhackAMoleMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.holeCount = 9; // 3x3
    this._holes = [];
    this._activeMoles = [];
    this._moleTimer = 0;
    this._moleInterval = 1500;
    this._moleDuration = 2000;
    this.currentQuestion = null;
    this._questionEl = null;
    this._timeLeft = 60;
    this._gameTimer = null;
    this._combo = 0;
    this._maxCombo = 0;
    this._hammerEl = null;
  };

  WhackAMoleMode.prototype = Object.create(BaseMode.prototype);
  WhackAMoleMode.prototype.constructor = WhackAMoleMode;

  WhackAMoleMode.displayName = '打地鼠模式';
  WhackAMoleMode.description = '选项从洞里冒出来，快速敲击正确答案，比比谁的反应更快！';
  WhackAMoleMode.icon = '🔨';
  WhackAMoleMode.uiClass = 'sz-easter-whack';

  WhackAMoleMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-whack-header">' +
        '<div class="sz-easter-whack-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">时间</span><span class="sz-easter-stat-value" data-stat="time">60s</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
        '</div>' +
        '<div class="sz-easter-whack-question" data-role="question">' +
          '点击正确的选项！' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-whack-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-whack-grid" data-role="grid"></div>' +
      '</div>' +
      '<div class="sz-easter-whack-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._gridEl = this.container.querySelector('[data-role="grid"]');

    this._initGrid();
    this._loadNextQuestion();
    this._startGameTimer();
    this._startMoleLoop();
  };

  WhackAMoleMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 锤子跟随鼠标
    var gamearea = this.container.querySelector('[data-role="gamearea"]');
    this._addEventListener(gamearea, 'mousemove', function (e) {
      self._updateHammerPosition(e);
    });

    this._addEventListener(gamearea, 'mousedown', function () {
      if (self._hammerEl) {
        self._hammerEl.classList.add('sz-easter-hammer-hit');
        setTimeout(function () {
          if (self._hammerEl) self._hammerEl.classList.remove('sz-easter-hammer-hit');
        }, 100);
      }
    });
  };

  WhackAMoleMode.prototype._initGrid = function () {
    this._gridEl.innerHTML = '';
    this._holes = [];

    for (var i = 0; i < this.holeCount; i++) {
      var hole = Utils.createEl('div', 'sz-easter-whack-hole', this._gridEl);
      hole.setAttribute('data-index', i);
      hole.innerHTML =
        '<div class="sz-easter-whack-hole-top"></div>' +
        '<div class="sz-easter-whack-mole" data-role="mole"></div>' +
        '<div class="sz-easter-whack-hole-bottom"></div>';

      this._holes.push({
        el: hole,
        moleEl: hole.querySelector('[data-role="mole"]'),
        active: false,
        optionIndex: -1
      });

      var self = this;
      hole.onclick = function (idx) {
        return function () {
          self._onHoleClick(idx);
        };
      }(i);
    }

    // 添加锤子光标
    this._hammerEl = Utils.createEl('div', 'sz-easter-whack-hammer', this._gridEl);
    this._hammerEl.textContent = '🔨';
  };

  WhackAMoleMode.prototype._updateHammerPosition = function (e) {
    if (!this._hammerEl) return;
    var rect = this._gridEl.getBoundingClientRect();
    var x = e.clientX - rect.left - 20;
    var y = e.clientY - rect.top - 20;
    this._hammerEl.style.left = x + 'px';
    this._hammerEl.style.top = y + 'px';
  };

  WhackAMoleMode.prototype._loadNextQuestion = function () {
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;
  };

  WhackAMoleMode.prototype._startGameTimer = function () {
    var self = this;
    this._gameInterval = this._setInterval(function () {
      self._timeLeft--;
      self._updateTimeUI();
      if (self._timeLeft <= 0) {
        self._gameOver();
      }
    }, 1000);
  };

  WhackAMoleMode.prototype._startMoleLoop = function () {
    var self = this;
    this._moleInterval = Math.max(500, 1500 - this.level * 100);

    this._moleSpawnInterval = this._setInterval(function () {
      self._spawnMole();
    }, this._moleInterval);

    // 初始生成几个
    for (var i = 0; i < 2; i++) {
      this._setTimeout(function () { self._spawnMole(); }, i * 500);
    }
  };

  WhackAMoleMode.prototype._spawnMole = function () {
    if (!this.isRunning) return;

    // 找空闲的洞
    var availableHoles = this._holes.filter(function (h) { return !h.active; });
    if (availableHoles.length === 0) return;

    var hole = Utils.randomChoice(availableHoles);
    var optIdx = Utils.randomInt(0, this.currentQuestion.options.length - 1);

    hole.active = true;
    hole.optionIndex = optIdx;
    hole.moleEl.textContent = this.currentQuestion.options[optIdx];
    hole.moleEl.classList.add('sz-easter-mole-up');
    hole.el.classList.add('sz-easter-hole-active');

    var isCorrect = optIdx === this.currentQuestion.answer;
    if (isCorrect) {
      hole.moleEl.classList.add('sz-easter-mole-correct');
    }

    var self = this;
    hole._hideTimer = setTimeout(function () {
      if (hole.active) {
        self._hideMole(hole);
        // 如果正确选项消失了且没人点，换题目
        if (isCorrect) {
          self._loadNextQuestion();
        }
      }
    }, this._moleDuration);
  };

  WhackAMoleMode.prototype._hideMole = function (hole) {
    hole.active = false;
    hole.optionIndex = -1;
    hole.moleEl.classList.remove('sz-easter-mole-up', 'sz-easter-mole-correct', 'sz-easter-mole-hit');
    hole.el.classList.remove('sz-easter-hole-active');
    if (hole._hideTimer) {
      clearTimeout(hole._hideTimer);
      hole._hideTimer = null;
    }
  };

  WhackAMoleMode.prototype._onHoleClick = function (holeIdx) {
    var hole = this._holes[holeIdx];
    if (!hole.active) return;

    var isCorrect = hole.optionIndex === this.currentQuestion.answer;

    if (isCorrect) {
      this._combo++;
      this._maxCombo = Math.max(this._maxCombo, this._combo);
      var comboBonus = Math.floor(this._combo * 2);
      var baseScore = 10 + comboBonus;
      this._addScore(baseScore);
      Utils.playSound('correct');

      // 命中效果
      hole.moleEl.classList.add('sz-easter-mole-hit');
      this._showFloatingScore(hole.el, '+' + baseScore, 'correct');

      // 每答对5题升级
      if (this.correctCount > 0 && this.correctCount % 5 === 0) {
        this.level++;
        this._updateMoleSpeed();
      }

      this._checkAnswer(this.currentQuestion, hole.optionIndex);
      this._loadNextQuestion();
    } else {
      this._combo = 0;
      this._addScore(-5);
      Utils.playSound('wrong');
      this._showFloatingScore(hole.el, '-5', 'wrong');
      this.questionCount++;
      this.wrongCount++;
    }

    this._updateComboUI();

    var self = this;
    this._setTimeout(function () {
      self._hideMole(hole);
    }, 200);
  };

  WhackAMoleMode.prototype._updateMoleSpeed = function () {
    if (this._moleSpawnInterval) {
      clearInterval(this._moleSpawnInterval);
    }
    this._moleInterval = Math.max(400, 1500 - this.level * 150);
    this._moleDuration = Math.max(800, 2000 - this.level * 150);

    var self = this;
    this._moleSpawnInterval = this._setInterval(function () {
      self._spawnMole();
    }, this._moleInterval);
  };

  WhackAMoleMode.prototype._showFloatingScore = function (el, text, type) {
    var float = Utils.createEl('div', 'sz-easter-floating-score sz-easter-float-' + type);
    float.textContent = text;
    el.appendChild(float);

    requestAnimationFrame(function () {
      float.style.transition = 'all 0.6s ease-out';
      float.style.transform = 'translateY(-40px)';
      float.style.opacity = '0';
    });

    setTimeout(function () {
      if (float.parentNode) float.parentNode.removeChild(float);
    }, 600);
  };

  WhackAMoleMode.prototype._gameOver = function () {
    this.isRunning = false;
    this._showResult();
  };

  WhackAMoleMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  WhackAMoleMode.prototype._updateTimeUI = function () {
    var el = this.container.querySelector('[data-stat="time"]');
    if (el) el.textContent = this._timeLeft + 's';
    if (this._timeLeft <= 10) {
      el.classList.add('sz-easter-time-warning');
    }
  };

  WhackAMoleMode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this._combo;
  };

  WhackAMoleMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._gameInterval) clearInterval(this._gameInterval);
    if (this._moleSpawnInterval) clearInterval(this._moleSpawnInterval);
    this._holes.forEach(function (h) {
      if (h._hideTimer) clearTimeout(h._hideTimer);
    });
  };

  SZ.easterEggs.modes.WhackAMoleMode = WhackAMoleMode;


  // ============================================================
  //  模式6: 盲打模式 (BlindMode)
  // ============================================================
  /**
   * 盲打模式
   * 题目显示3秒后消失
   * 凭记忆选择答案
   * 难度逐渐增加（显示时间缩短）
   * 记忆力训练
   */
  var BlindMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.showTime = 3; // 初始显示时间(秒)
    this.minShowTime = 1;
    this.currentQuestion = null;
    this._phase = 'showing'; // showing | hidden | answered
    this._timeLeft = 0;
    this._questionEl = null;
    this._optionsEl = null;
    this._timerEl = null;
    this._memoryCombo = 0;
    this._hintUsed = false;
    this._hintCount = 3;
  };

  BlindMode.prototype = Object.create(BaseMode.prototype);
  BlindMode.prototype.constructor = BlindMode;

  BlindMode.displayName = '盲打模式';
  BlindMode.description = '题目只显示几秒钟就消失，凭记忆选择答案，挑战你的记忆力！';
  BlindMode.icon = '👁️';
  BlindMode.uiClass = 'sz-easter-blind';

  BlindMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-blind-header">' +
        '<div class="sz-easter-blind-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">提示</span><span class="sz-easter-stat-value" data-stat="hints">💡💡💡</span></div>' +
        '</div>' +
        '<div class="sz-easter-blind-timer-bar">' +
          '<div class="sz-easter-blind-timer-fill" data-role="timer-fill"></div>' +
          '<span class="sz-easter-blind-timer-text" data-role="timer-text">3.0s</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-blind-main">' +
        '<div class="sz-easter-blind-question-area">' +
          '<div class="sz-easter-blind-question" data-role="question">' +
            '<span class="sz-easter-blind-question-text">准备好了吗？</span>' +
          '</div>' +
          '<div class="sz-easter-blind-status" data-role="status">题目即将出现...</div>' +
        '</div>' +
        '<div class="sz-easter-blind-options" data-role="options"></div>' +
      '</div>' +
      '<div class="sz-easter-blind-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-hint" data-action="hint">使用提示</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');
    this._statusEl = this.container.querySelector('[data-role="status"]');

    var self = this;
    this._setTimeout(function () {
      self._loadNextQuestion();
    }, 1000);
  };

  BlindMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var hintBtn = this.container.querySelector('[data-action="hint"]');
    if (hintBtn) {
      this._addEventListener(hintBtn, 'click', function () {
        self._useHint();
      });
    }
  };

  BlindMode.prototype._loadNextQuestion = function () {
    this._phase = 'showing';
    this._hintUsed = false;
    this.currentQuestion = this._getNextQuestion(this.level);

    // 显示题目
    var qText = this._questionEl.querySelector('.sz-easter-blind-question-text');
    qText.textContent = this.currentQuestion.question;
    this._questionEl.classList.remove('sz-easter-blind-hidden');
    this._statusEl.textContent = '记住题目！';
    this._statusEl.className = 'sz-easter-blind-status sz-easter-status-show';

    // 显示选项
    this._optionsEl.innerHTML = '';
    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-blind-option sz-easter-option-disabled', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';
    });

    // 开始倒计时
    this._timeLeft = Math.max(this.minShowTime, this.showTime - (this.level - 1) * 0.3);
    this._totalShowTime = this._timeLeft;
    this._startShowTimer();
  };

  BlindMode.prototype._startShowTimer = function () {
    var self = this;
    var startTime = Date.now();
    var totalMs = this._totalShowTime * 1000;

    function update() {
      if (!self.isRunning || self._phase !== 'showing') return;

      var elapsed = Date.now() - startTime;
      var remaining = Math.max(0, totalMs - elapsed);
      self._timeLeft = remaining / 1000;

      self._updateTimerUI(remaining / totalMs);

      if (remaining <= 0) {
        self._hideQuestion();
      } else {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  };

  BlindMode.prototype._hideQuestion = function () {
    this._phase = 'hidden';
    this._questionEl.classList.add('sz-easter-blind-hidden');
    this._statusEl.textContent = '凭记忆选择答案！';
    this._statusEl.className = 'sz-easter-blind-status sz-easter-status-hidden';

    // 启用选项
    var options = this._optionsEl.querySelectorAll('.sz-easter-blind-option');
    var self = this;
    options.forEach(function (btn, idx) {
      btn.classList.remove('sz-easter-option-disabled');
      btn.onclick = function () {
        if (self._phase !== 'hidden') return;
        self._submitAnswer(idx);
      };
    });
  };

  BlindMode.prototype._submitAnswer = function (answerIdx) {
    if (this._phase === 'answered') return;
    this._phase = 'answered';

    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-blind-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    // 重新显示题目
    this._questionEl.classList.remove('sz-easter-blind-hidden');
    this._statusEl.textContent = correct ? '回答正确！' : '回答错误...';
    this._statusEl.className = 'sz-easter-blind-status ' + (correct ? 'sz-easter-status-correct' : 'sz-easter-status-wrong');

    if (correct) {
      this._memoryCombo++;
      var baseScore = 15 + this._memoryCombo * 3;
      if (this._hintUsed) baseScore = Math.floor(baseScore * 0.5);
      this._addScore(baseScore);

      // 每5题升级
      if (this.correctCount > 0 && this.correctCount % 5 === 0) {
        this.level++;
        this._updateLevelUI();
      }
    } else {
      this._memoryCombo = 0;
    }

    var self = this;
    this._setTimeout(function () {
      if (self.questionCount >= 15) {
        self._showResult();
      } else {
        self._loadNextQuestion();
      }
    }, 1500);
  };

  BlindMode.prototype._useHint = function () {
    if (this._hintCount <= 0 || this._hintUsed) return;
    if (this._phase !== 'hidden') return;

    this._hintCount--;
    this._hintUsed = true;
    this._updateHintsUI();

    // 短暂显示题目
    this._questionEl.classList.remove('sz-easter-blind-hidden');
    Utils.playSound('coin');

    var self = this;
    this._setTimeout(function () {
      if (self._phase === 'hidden') {
        self._questionEl.classList.add('sz-easter-blind-hidden');
      }
    }, 1000);
  };

  BlindMode.prototype._updateTimerUI = function (percent) {
    var fill = this.container.querySelector('[data-role="timer-fill"]');
    var text = this.container.querySelector('[data-role="timer-text"]');
    if (fill) fill.style.width = (percent * 100) + '%';
    if (text) text.textContent = this._timeLeft.toFixed(1) + 's';

    if (percent < 0.3) {
      fill.classList.add('sz-easter-timer-warning');
    } else {
      fill.classList.remove('sz-easter-timer-warning');
    }
  };

  BlindMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  BlindMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this.level;
    Utils.playSound('levelup');
  };

  BlindMode.prototype._updateHintsUI = function () {
    var el = this.container.querySelector('[data-stat="hints"]');
    if (el) {
      var hints = '';
      for (var i = 0; i < 3; i++) {
        hints += i < this._hintCount ? '💡' : '⚫';
      }
      el.textContent = hints;
    }
  };

  SZ.easterEggs.modes.BlindMode = BlindMode;


  // ============================================================
  //  模式7: 反向模式 (ReverseMode)
  // ============================================================
  /**
   * 反向模式
   * 显示答案，要选择对应的题目
   * 反向思维训练
   * 难度更高
   */
  var ReverseMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.currentAnswer = null;
    this._questionPool = [];
    this._optionCount = 4;
    this._answerEl = null;
    this._optionsEl = null;
    this._reverseCombo = 0;
    this._difficulty = 1;
  };

  ReverseMode.prototype = Object.create(BaseMode.prototype);
  ReverseMode.prototype.constructor = ReverseMode;

  ReverseMode.displayName = '反向模式';
  ReverseMode.description = '显示答案，选择对应的题目！反过来的思维，你还能hold住吗？';
  ReverseMode.icon = '🔄';
  ReverseMode.uiClass = 'sz-easter-reverse';

  ReverseMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-reverse-header">' +
        '<div class="sz-easter-reverse-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-reverse-main">' +
        '<div class="sz-easter-reverse-answer-area">' +
          '<div class="sz-easter-reverse-label">💡 这是答案，选出对应的题目：</div>' +
          '<div class="sz-easter-reverse-answer" data-role="answer"></div>' +
        '</div>' +
        '<div class="sz-easter-reverse-options" data-role="options"></div>' +
        '<div class="sz-easter-reverse-hint">提示：从选项中找出能得到这个答案的问题</div>' +
      '</div>' +
      '<div class="sz-easter-reverse-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._answerEl = this.container.querySelector('[data-role="answer"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._initQuestionPool();
    this._loadNextRound();
  };

  ReverseMode.prototype._bindEvents = function () {
    var self = this;
    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }
  };

  ReverseMode.prototype._initQuestionPool = function () {
    // 生成多道题用作选项池
    this._questionPool = [];
    for (var i = 0; i < 20; i++) {
      this._questionPool.push(Utils.getQuestion(this.level));
    }
  };

  ReverseMode.prototype._loadNextRound = function () {
    // 确保题库足够
    if (this._questionPool.length < this._optionCount) {
      for (var i = 0; i < 10; i++) {
        this._questionPool.push(Utils.getQuestion(this.level));
      }
    }

    // 随机选择正确的题目
    var correctIdx = Utils.randomInt(0, this._questionPool.length - 1);
    var correctQ = this._questionPool[correctIdx];
    this._correctQuestion = correctQ;

    // 显示答案
    this._answerEl.textContent = correctQ.options[correctQ.answer];

    // 生成选项（正确题目 + 干扰题目）
    var optionQuestions = [correctQ];
    var usedIndices = [correctIdx];

    while (optionQuestions.length < this._optionCount) {
      var randIdx = Utils.randomInt(0, this._questionPool.length - 1);
      if (usedIndices.indexOf(randIdx) === -1) {
        usedIndices.push(randIdx);
        optionQuestions.push(this._questionPool[randIdx]);
      }
      // 防止死循环
      if (usedIndices.length >= this._questionPool.length) break;
    }

    // 打乱选项
    optionQuestions = Utils.shuffle(optionQuestions);
    this._currentOptions = optionQuestions;

    // 渲染选项
    this._optionsEl.innerHTML = '';
    var self = this;
    optionQuestions.forEach(function (q, idx) {
      var btn = Utils.createEl('div', 'sz-easter-reverse-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-number">' + (idx + 1) + '</span>' +
        '<span class="sz-easter-option-text">' + q.question + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  ReverseMode.prototype._submitAnswer = function (selectedIdx) {
    var selectedQ = this._currentOptions[selectedIdx];
    var correct = selectedQ === this._correctQuestion;

    this.questionCount++;
    if (correct) {
      this.correctCount++;
      this._reverseCombo++;
      var baseScore = 20 + this._reverseCombo * 5;
      this._addScore(baseScore);
      Utils.playSound('correct');

      // 每答对4题升级
      if (this.correctCount > 0 && this.correctCount % 4 === 0) {
        this.level++;
        this._optionCount = Math.min(6, 4 + Math.floor(this.level / 2));
        this._updateLevelUI();
      }
    } else {
      this.wrongCount++;
      this._reverseCombo = 0;
      Utils.playSound('wrong');
    }

    // 显示结果
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-reverse-option');
    optionBtns.forEach(function (btn, idx) {
      var q = self._currentOptions[idx];
      btn.classList.add(idx === selectedIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (q === self._correctQuestion) btn.classList.add('sz-easter-correct');
      if (idx === selectedIdx && !correct) btn.classList.add('sz-easter-wrong');
    });

    var self = this;
    this._setTimeout(function () {
      if (self.questionCount >= 15) {
        self._showResult();
      } else {
        self._loadNextRound();
      }
    }, 1500);
  };

  ReverseMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  ReverseMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this.level;
    Utils.playSound('levelup');
  };

  ReverseMode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this._reverseCombo;
  };

  SZ.easterEggs.modes.ReverseMode = ReverseMode;


  // ============================================================
  //  模式8: 连连看模式 (LinkLinkMode)
  // ============================================================
  /**
   * 连连看模式
   * 左侧显示题目，右侧显示打乱的答案
   * 画线连接正确的题目和答案
   * 限时完成
   */
  var LinkLinkMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._questions = [];
    this._answers = [];
    this._connections = []; // {qIdx, aIdx, correct}
    this._selectedQuestion = null;
    this._selectedAnswer = null;
    this._svgEl = null;
    this._timeLeft = 90;
    this._roundCount = 0;
    this._totalRounds = 5;
    this._matchedCount = 0;
    this._questionCount = 4; // 每轮题数
  };

  LinkLinkMode.prototype = Object.create(BaseMode.prototype);
  LinkLinkMode.prototype.constructor = LinkLinkMode;

  LinkLinkMode.displayName = '连连看模式';
  LinkLinkMode.description = '左边是题目，右边是答案，画线把它们连起来！全部连对才能过关~';
  LinkLinkMode.icon = '🔗';
  LinkLinkMode.uiClass = 'sz-easter-linklink';

  LinkLinkMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-linklink-header">' +
        '<div class="sz-easter-linklink-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">时间</span><span class="sz-easter-stat-value" data-stat="time">90s</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">进度</span><span class="sz-easter-stat-value" data-stat="progress">1/5</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-linklink-main">' +
        '<div class="sz-easter-linklink-gamearea" data-role="gamearea">' +
          '<svg class="sz-easter-linklink-lines" data-role="svg"></svg>' +
          '<div class="sz-easter-linklink-left">' +
            '<div class="sz-easter-linklink-column-title">题目</div>' +
            '<div class="sz-easter-linklink-items" data-role="questions"></div>' +
          '</div>' +
          '<div class="sz-easter-linklink-right">' +
            '<div class="sz-easter-linklink-column-title">答案</div>' +
            '<div class="sz-easter-linklink-items" data-role="answers"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-linklink-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-reset" data-action="reset">重置连线</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionsEl = this.container.querySelector('[data-role="questions"]');
    this._answersEl = this.container.querySelector('[data-role="answers"]');
    this._svgEl = this.container.querySelector('[data-role="svg"]');

    this._startRound();
    this._startTimer();
  };

  LinkLinkMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var resetBtn = this.container.querySelector('[data-action="reset"]');
    if (resetBtn) {
      this._addEventListener(resetBtn, 'click', function () {
        self._resetConnections();
      });
    }
  };

  LinkLinkMode.prototype._startRound = function () {
    this._roundCount++;
    this._connections = [];
    this._selectedQuestion = null;
    this._selectedAnswer = null;
    this._matchedCount = 0;
    this._questionCount = Math.min(6, 3 + Math.floor(this.level / 2));

    // 生成题目
    this._questions = [];
    for (var i = 0; i < this._questionCount; i++) {
      this._questions.push(Utils.getQuestion(this.level));
    }

    // 打乱答案顺序
    this._answerOrder = Utils.shuffle(this._questions.map(function (q, i) { return i; }));

    this._renderItems();
    this._updateProgressUI();
  };

  LinkLinkMode.prototype._renderItems = function () {
    var self = this;
    this._questionsEl.innerHTML = '';
    this._answersEl.innerHTML = '';
    this._svgEl.innerHTML = '';

    this._questions.forEach(function (q, idx) {
      var item = Utils.createEl('div', 'sz-easter-linklink-item sz-easter-linklink-q', self._questionsEl);
      item.setAttribute('data-qidx', idx);
      item.innerHTML =
        '<span class="sz-easter-linklink-num">' + (idx + 1) + '</span>' +
        '<span class="sz-easter-linklink-text">' + q.question + '</span>';

      item.onclick = function () {
        self._onQuestionClick(idx);
      };
    });

    this._answerOrder.forEach(function (qIdx, ansIdx) {
      var q = self._questions[qIdx];
      var answerText = q.options[q.answer];
      var item = Utils.createEl('div', 'sz-easter-linklink-item sz-easter-linklink-a', self._answersEl);
      item.setAttribute('data-aidx', ansIdx);
      item.setAttribute('data-qidx', qIdx);
      item.innerHTML =
        '<span class="sz-easter-linklink-text">' + answerText + '</span>';

      item.onclick = function () {
        self._onAnswerClick(ansIdx, qIdx);
      };
    });
  };

  LinkLinkMode.prototype._onQuestionClick = function (qIdx) {
    // 检查是否已连接
    var existing = this._connections.find(function (c) { return c.qIdx === qIdx; });
    if (existing) {
      // 取消连接
      this._removeConnection(existing);
      return;
    }

    this._selectedQuestion = qIdx;

    // 高亮选中
    var qItems = this._questionsEl.querySelectorAll('.sz-easter-linklink-q');
    qItems.forEach(function (el) {
      el.classList.remove('sz-easter-item-selected');
    });
    var selected = this._questionsEl.querySelector('[data-qidx="' + qIdx + '"]');
    if (selected) selected.classList.add('sz-easter-item-selected');

    Utils.playSound('click');

    // 如果已经选了答案，尝试连接
    if (this._selectedAnswer !== null) {
      this._tryConnect(qIdx, this._selectedAnswer);
    }
  };

  LinkLinkMode.prototype._onAnswerClick = function (ansIdx, qIdx) {
    // 检查是否已连接
    var existing = this._connections.find(function (c) { return c.ansIdx === ansIdx; });
    if (existing) {
      this._removeConnection(existing);
      return;
    }

    this._selectedAnswer = ansIdx;
    this._selectedAnswerQIdx = qIdx;

    // 高亮选中
    var aItems = this._answersEl.querySelectorAll('.sz-easter-linklink-a');
    aItems.forEach(function (el) {
      el.classList.remove('sz-easter-item-selected');
    });
    var selected = this._answersEl.querySelector('[data-aidx="' + ansIdx + '"]');
    if (selected) selected.classList.add('sz-easter-item-selected');

    Utils.playSound('click');

    // 如果已经选了题目，尝试连接
    if (this._selectedQuestion !== null) {
      this._tryConnect(this._selectedQuestion, ansIdx);
    }
  };

  LinkLinkMode.prototype._tryConnect = function (qIdx, ansIdx) {
    var correctQIdx = this._answerOrder[ansIdx];
    var correct = qIdx === correctQIdx;

    this._connections.push({
      qIdx: qIdx,
      ansIdx: ansIdx,
      correct: correct
    });

    this._drawConnection(qIdx, ansIdx, correct);

    if (correct) {
      this._matchedCount++;
      this._addScore(15);
      Utils.playSound('correct');

      // 标记已匹配
      var qEl = this._questionsEl.querySelector('[data-qidx="' + qIdx + '"]');
      var aEl = this._answersEl.querySelector('[data-aidx="' + ansIdx + '"]');
      if (qEl) qEl.classList.add('sz-easter-item-matched');
      if (aEl) aEl.classList.add('sz-easter-item-matched');
    } else {
      this._addScore(-5);
      Utils.playSound('wrong');
    }

    // 清除选中状态
    this._selectedQuestion = null;
    this._selectedAnswer = null;
    var allItems = this.container.querySelectorAll('.sz-easter-linklink-item');
    allItems.forEach(function (el) {
      el.classList.remove('sz-easter-item-selected');
    });

    // 检查是否全部匹配
    var self = this;
    if (this._matchedCount >= this._questionCount) {
      this._addScore(50); // 完成奖励
      Utils.playSound('success');

      this._setTimeout(function () {
        if (self._roundCount >= self._totalRounds) {
          self._showResult();
        } else {
          self._startRound();
        }
      }, 1000);
    }
  };

  LinkLinkMode.prototype._drawConnection = function (qIdx, ansIdx, correct) {
    var qEl = this._questionsEl.querySelector('[data-qidx="' + qIdx + '"]');
    var aEl = this._answersEl.querySelector('[data-aidx="' + ansIdx + '"]');
    var gamearea = this.container.querySelector('[data-role="gamearea"]');

    if (!qEl || !aEl || !gamearea) return;

    var gameRect = gamearea.getBoundingClientRect();
    var qRect = qEl.getBoundingClientRect();
    var aRect = aEl.getBoundingClientRect();

    var x1 = qRect.right - gameRect.left;
    var y1 = qRect.top + qRect.height / 2 - gameRect.top;
    var x2 = aRect.left - gameRect.left;
    var y2 = aRect.top + aRect.height / 2 - gameRect.top;

    // 贝塞尔曲线
    var midX = (x1 + x2) / 2;
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + midX + ' ' + y1 + ', ' + midX + ' ' + y2 + ', ' + x2 + ' ' + y2);
    path.setAttribute('class', 'sz-easter-linklink-line ' + (correct ? 'sz-easter-line-correct' : 'sz-easter-line-wrong'));
    path.setAttribute('data-qidx', qIdx);
    path.setAttribute('data-aidx', ansIdx);

    this._svgEl.appendChild(path);

    // 动画
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    requestAnimationFrame(function () {
      path.style.transition = 'stroke-dashoffset 0.3s ease';
      path.style.strokeDashoffset = 0;
    });
  };

  LinkLinkMode.prototype._removeConnection = function (conn) {
    var idx = this._connections.indexOf(conn);
    if (idx > -1) this._connections.splice(idx, 1);

    // 移除线
    var line = this._svgEl.querySelector('[data-qidx="' + conn.qIdx + '"][data-aidx="' + conn.ansIdx + '"]');
    if (line) line.remove();

    // 移除匹配状态
    var qEl = this._questionsEl.querySelector('[data-qidx="' + conn.qIdx + '"]');
    var aEl = this._answersEl.querySelector('[data-aidx="' + conn.ansIdx + '"]');
    if (qEl) qEl.classList.remove('sz-easter-item-matched');
    if (aEl) aEl.classList.remove('sz-easter-item-matched');

    if (conn.correct) {
      this._matchedCount--;
      this._addScore(-10);
    }
  };

  LinkLinkMode.prototype._resetConnections = function () {
    this._connections = [];
    this._matchedCount = 0;
    this._selectedQuestion = null;
    this._selectedAnswer = null;
    this._svgEl.innerHTML = '';

    var allItems = this.container.querySelectorAll('.sz-easter-linklink-item');
    allItems.forEach(function (el) {
      el.classList.remove('sz-easter-item-matched', 'sz-easter-item-selected');
    });
  };

  LinkLinkMode.prototype._startTimer = function () {
    var self = this;
    this._timerInterval = this._setInterval(function () {
      self._timeLeft--;
      self._updateTimeUI();
      if (self._timeLeft <= 0) {
        self._showResult();
      }
    }, 1000);
  };

  LinkLinkMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  LinkLinkMode.prototype._updateTimeUI = function () {
    var el = this.container.querySelector('[data-stat="time"]');
    if (el) el.textContent = this._timeLeft + 's';
  };

  LinkLinkMode.prototype._updateProgressUI = function () {
    var el = this.container.querySelector('[data-stat="progress"]');
    if (el) el.textContent = this._roundCount + '/' + this._totalRounds;
  };

  LinkLinkMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._timerInterval) clearInterval(this._timerInterval);
  };

  SZ.easterEggs.modes.LinkLinkMode = LinkLinkMode;


  // ============================================================
  //  模式9: 拼图模式 (PuzzleMode)
  // ============================================================
  /**
   * 拼图模式
   * 题目被切成几块拼图
   * 答对一题解锁一块拼图
   * 全部答对完成完整图片
   * 每张图是一个知识点
   */
  var PuzzleMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._puzzleSize = 3; // 3x3
    this._totalPieces = 9;
    this._unlockedPieces = 0;
    this._currentPuzzle = null;
    this._puzzles = [
      { id: 1, name: '数据结构', emoji: '🌳', pieces: ['根', '叶', '枝', '节', '点', '链', '栈', '堆', '图'] },
      { id: 2, name: '算法思想', emoji: '🧠', pieces: ['递归', '分治', '贪心', 'DP', '回溯', 'BFS', 'DFS', '二分', '排序'] },
      { id: 3, name: '前端技术', emoji: '💻', pieces: ['HTML', 'CSS', 'JS', 'Vue', 'React', 'Node', 'TS', 'Webpack', 'Vite'] },
      { id: 4, name: '网络协议', emoji: '🌐', pieces: ['HTTP', 'TCP', 'IP', 'DNS', 'HTTPS', 'UDP', 'WS', 'FTP', 'SSH'] },
      { id: 5, name: '数据库', emoji: '🗄️', pieces: ['SQL', '索引', '事务', '锁', '缓存', '主从', '分库', '分表', 'NOSQL'] }
    ];
    this._puzzleIndex = 0;
    this._puzzleEl = null;
    this._questionEl = null;
    this._optionsEl = null;
  };

  PuzzleMode.prototype = Object.create(BaseMode.prototype);
  PuzzleMode.prototype.constructor = PuzzleMode;

  PuzzleMode.displayName = '拼图模式';
  PuzzleMode.description = '答对一题解锁一块拼图，集齐所有碎片完成知识点图谱！';
  PuzzleMode.icon = '🧩';
  PuzzleMode.uiClass = 'sz-easter-puzzle';

  PuzzleMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-puzzle-header">' +
        '<div class="sz-easter-puzzle-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">拼图</span><span class="sz-easter-stat-value" data-stat="puzzle">1/5</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">进度</span><span class="sz-easter-stat-value" data-stat="progress">0/9</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-puzzle-main">' +
        '<div class="sz-easter-puzzle-board-wrap">' +
          '<div class="sz-easter-puzzle-title" data-role="puzzle-title">??? - 待解锁</div>' +
          '<div class="sz-easter-puzzle-board" data-role="puzzle-board"></div>' +
        '</div>' +
        '<div class="sz-easter-puzzle-question-area">' +
          '<div class="sz-easter-puzzle-question" data-role="question"></div>' +
          '<div class="sz-easter-puzzle-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-puzzle-footer">' +
        '<div class="sz-easter-puzzle-hint">答对题目解锁拼图碎片</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._puzzleBoard = this.container.querySelector('[data-role="puzzle-board"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._initPuzzle();
    this._loadNextQuestion();
  };

  PuzzleMode.prototype._bindEvents = function () {
    var self = this;
    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }
  };

  PuzzleMode.prototype._initPuzzle = function () {
    this._currentPuzzle = this._puzzles[this._puzzleIndex % this._puzzles.length];
    this._unlockedPieces = 0;
    this._puzzleBoard.innerHTML = '';
    this._puzzleBoard.style.gridTemplateColumns = 'repeat(' + this._puzzleSize + ', 1fr)';

    for (var i = 0; i < this._totalPieces; i++) {
      var piece = Utils.createEl('div', 'sz-easter-puzzle-piece', this._puzzleBoard);
      piece.setAttribute('data-index', i);
      piece.innerHTML = '<div class="sz-easter-puzzle-piece-inner"><span class="sz-easter-piece-hidden">?</span><span class="sz-easter-piece-revealed">' + this._currentPuzzle.pieces[i] + '</span></div>';
    }

    this._updatePuzzleTitle();
    this._updateProgressUI();
  };

  PuzzleMode.prototype._updatePuzzleTitle = function () {
    var titleEl = this.container.querySelector('[data-role="puzzle-title"]');
    if (titleEl) {
      if (this._unlockedPieces >= this._totalPieces) {
        titleEl.textContent = this._currentPuzzle.emoji + ' ' + this._currentPuzzle.name + ' - 完成！';
        titleEl.classList.add('sz-easter-puzzle-complete');
      } else {
        titleEl.textContent = '第 ' + (this._puzzleIndex + 1) + ' 张拼图 - 解锁中...';
      }
    }
  };

  PuzzleMode.prototype._loadNextQuestion = function () {
    // 找出下一个未解锁的拼图块
    var nextPiece = -1;
    var pieces = this._puzzleBoard.querySelectorAll('.sz-easter-puzzle-piece');
    for (var i = 0; i < pieces.length; i++) {
      if (!pieces[i].classList.contains('sz-easter-piece-unlocked')) {
        nextPiece = i;
        break;
      }
    }

    if (nextPiece === -1) {
      // 当前拼图完成，进入下一张
      this._nextPuzzle();
      return;
    }

    this._nextPieceIndex = nextPiece;
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-puzzle-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  PuzzleMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-puzzle-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      this._addScore(15);
      this._unlockPiece(this._nextPieceIndex);
      Utils.playSound('correct');
    } else {
      Utils.playSound('wrong');
    }

    var self = this;
    this._setTimeout(function () {
      self._loadNextQuestion();
    }, 1000);
  };

  PuzzleMode.prototype._unlockPiece = function (pieceIdx) {
    var pieces = this._puzzleBoard.querySelectorAll('.sz-easter-puzzle-piece');
    var piece = pieces[pieceIdx];
    if (piece) {
      piece.classList.add('sz-easter-piece-unlocked');
      this._unlockedPieces++;
      this._updateProgressUI();
      this._updatePuzzleTitle();

      // 完成检查
      if (this._unlockedPieces >= this._totalPieces) {
        this._onPuzzleComplete();
      }
    }
  };

  PuzzleMode.prototype._onPuzzleComplete = function () {
    this._addScore(100); // 完成拼图奖励
    Utils.playSound('success');

    // 庆祝动画
    var board = this._puzzleBoard;
    board.classList.add('sz-easter-puzzle-complete-anim');

    var self = this;
    this._setTimeout(function () {
      board.classList.remove('sz-easter-puzzle-complete-anim');
      self._puzzleIndex++;
      self.level++;
      self._updateLevelUI();
      self._initPuzzle();
      self._loadNextQuestion();
    }, 2000);
  };

  PuzzleMode.prototype._nextPuzzle = function () {
    this._puzzleIndex++;
    if (this._puzzleIndex >= this._puzzles.length * 2) {
      // 完成两轮，结束
      this._showResult();
      return;
    }
    this._initPuzzle();
    this._loadNextQuestion();
  };

  PuzzleMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  PuzzleMode.prototype._updateProgressUI = function () {
    var el = this.container.querySelector('[data-stat="progress"]');
    if (el) el.textContent = this._unlockedPieces + '/' + this._totalPieces;
  };

  PuzzleMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="puzzle"]');
    if (el) el.textContent = Math.min(this._puzzleIndex + 1, this._puzzles.length) + '/' + this._puzzles.length;
    Utils.playSound('levelup');
  };

  SZ.easterEggs.modes.PuzzleMode = PuzzleMode;


  // ============================================================
  //  模式10: 打怪模式 (MonsterMode)
  // ============================================================
  /**
   * 打怪模式
   * 每个错题是一个"怪物"
   * 答对题目造成伤害
   * 答错怪物反击扣血
   * BOSS题（难题）血量更高
   * 升级系统
   */
  var MonsterMode = function (container, options) {
    BaseMode.call(this, container, options);
    this.playerHP = 100;
    this.playerMaxHP = 100;
    this.playerLevel = 1;
    this.playerExp = 0;
    this.expToNextLevel = 50;
    this.currentMonster = null;
    this._monsterEl = null;
    this._playerEl = null;
    this._questionEl = null;
    this._optionsEl = null;
    this._monstersDefeated = 0;
    this._wave = 1;
    this._monsterTypes = [
      { name: '史莱姆', emoji: '🟢', hp: 20, damage: 5, exp: 15, difficulty: 1 },
      { name: '哥布林', emoji: '👺', hp: 35, damage: 10, exp: 25, difficulty: 1 },
      { name: '骷髅兵', emoji: '💀', hp: 50, damage: 15, exp: 35, difficulty: 2 },
      { name: '狼人', emoji: '🐺', hp: 70, damage: 20, exp: 50, difficulty: 2 },
      { name: '巫师', emoji: '🧙', hp: 60, damage: 25, exp: 55, difficulty: 3 },
      { name: '巨龙', emoji: '🐉', hp: 150, damage: 30, exp: 100, difficulty: 3, isBoss: true }
    ];
    this._battlePhase = 'fighting'; // fighting | victory | defeat
    this._damageTexts = [];
  };

  MonsterMode.prototype = Object.create(BaseMode.prototype);
  MonsterMode.prototype.constructor = MonsterMode;

  MonsterMode.displayName = '打怪模式';
  MonsterMode.description = '题目是怪物！答对攻击，答错被反击，升级变强，挑战BOSS！';
  MonsterMode.icon = '⚔️';
  MonsterMode.uiClass = 'sz-easter-monster';

  MonsterMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-monster-header">' +
        '<div class="sz-easter-monster-player-info">' +
          '<div class="sz-easter-player-avatar">🧑‍🎓</div>' +
          '<div class="sz-easter-player-stats">' +
            '<div class="sz-easter-player-name">勇者 Lv.' + this.playerLevel + '</div>' +
            '<div class="sz-easter-hp-bar">' +
              '<div class="sz-easter-hp-fill" data-role="player-hp" style="width:100%"></div>' +
              '<span class="sz-easter-hp-text">100/100</span>' +
            '</div>' +
            '<div class="sz-easter-exp-bar">' +
              '<div class="sz-easter-exp-fill" data-role="player-exp" style="width:0%"></div>' +
              '<span class="sz-easter-exp-text">0/50 EXP</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sz-easter-monster-wave-info">第 ' + this._wave + ' 波 | 击败: ' + this._monstersDefeated + '</div>' +
      '</div>' +
      '<div class="sz-easter-monster-battlefield">' +
        '<div class="sz-easter-monster-area" data-role="monster-area">' +
          '<div class="sz-easter-monster-sprite" data-role="monster-sprite">👾</div>' +
          '<div class="sz-easter-monster-name" data-role="monster-name">怪物</div>' +
          '<div class="sz-easter-monster-hp-bar">' +
            '<div class="sz-easter-monster-hp-fill" data-role="monster-hp" style="width:100%"></div>' +
            '<span class="sz-easter-monster-hp-text" data-role="monster-hp-text">20/20</span>' +
          '</div>' +
        '</div>' +
        '<div class="sz-easter-battle-effects" data-role="effects"></div>' +
      '</div>' +
      '<div class="sz-easter-monster-question-area">' +
        '<div class="sz-easter-monster-question" data-role="question"></div>' +
        '<div class="sz-easter-monster-options" data-role="options"></div>' +
      '</div>' +
      '<div class="sz-easter-monster-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">逃跑</button>' +
      '</div>';

    this._monsterSprite = this.container.querySelector('[data-role="monster-sprite"]');
    this._monsterNameEl = this.container.querySelector('[data-role="monster-name"]');
    this._monsterHpFill = this.container.querySelector('[data-role="monster-hp"]');
    this._monsterHpText = this.container.querySelector('[data-role="monster-hp-text"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');
    this._effectsEl = this.container.querySelector('[data-role="effects"]');

    this._spawnMonster();
  };

  MonsterMode.prototype._bindEvents = function () {
    var self = this;
    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }
  };

  MonsterMode.prototype._spawnMonster = function () {
    // 选择怪物类型
    var available = this._monsterTypes.filter(function (m) {
      return m.difficulty <= Math.ceil(this._wave / 2);
    }.bind(this));

    // 每5波出现BOSS
    var isBossWave = this._wave % 5 === 0;
    if (isBossWave) {
      available = this._monsterTypes.filter(function (m) { return m.isBoss; });
    }

    var type = Utils.randomChoice(available);
    var waveBonus = 1 + (this._wave - 1) * 0.1;

    this.currentMonster = {
      type: type,
      name: type.name,
      emoji: type.emoji,
      maxHP: Math.floor(type.hp * waveBonus),
      currentHP: Math.floor(type.hp * waveBonus),
      damage: Math.floor(type.damage * waveBonus),
      exp: Math.floor(type.exp * waveBonus),
      isBoss: type.isBoss || false
    };

    // 更新怪物显示
    this._monsterSprite.textContent = type.emoji;
    this._monsterNameEl.textContent = type.name + (type.isBoss ? ' (BOSS)' : '');
    this._updateMonsterHP();

    if (type.isBoss) {
      this._monsterSprite.classList.add('sz-easter-monster-boss');
      Utils.playSound('explode');
    } else {
      this._monsterSprite.classList.remove('sz-easter-monster-boss');
    }

    this._loadNextQuestion();
  };

  MonsterMode.prototype._loadNextQuestion = function () {
    this._battlePhase = 'fighting';
    var difficulty = this.currentMonster.type.difficulty + Math.floor(this._wave / 5);
    this.currentQuestion = this._getNextQuestion(difficulty);
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-monster-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  MonsterMode.prototype._submitAnswer = function (answerIdx) {
    if (this._battlePhase !== 'fighting') return;

    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-monster-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      // 玩家攻击
      var baseDamage = 10 + this.playerLevel * 3;
      var isCritical = Math.random() < 0.2;
      if (isCritical) baseDamage = Math.floor(baseDamage * 1.5);

      this._dealDamageToMonster(baseDamage, isCritical);
      Utils.playSound('hit');

      var self = this;
      this._setTimeout(function () {
        if (self.currentMonster.currentHP <= 0) {
          self._onMonsterDefeated();
        } else {
          // 怪物反击
          self._monsterAttack();
        }
      }, 500);
    } else {
      // 直接被反击
      this._monsterAttack();
    }
  };

  MonsterMode.prototype._dealDamageToMonster = function (damage, isCritical) {
    this.currentMonster.currentHP = Math.max(0, this.currentMonster.currentHP - damage);
    this._updateMonsterHP();

    // 伤害数字
    this._showDamageText(damage, isCritical, 'monster');

    // 怪物受击动画
    this._monsterSprite.classList.add('sz-easter-monster-hit');
    var sprite = this._monsterSprite;
    setTimeout(function () {
      if (sprite) sprite.classList.remove('sz-easter-monster-hit');
    }, 200);
  };

  MonsterMode.prototype._monsterAttack = function () {
    var damage = this.currentMonster.damage;
    this.playerHP = Math.max(0, this.playerHP - damage);
    this._updatePlayerHP();
    this._showDamageText(damage, false, 'player');
    Utils.playSound('wrong');

    var self = this;
    this._setTimeout(function () {
      if (self.playerHP <= 0) {
        self._onPlayerDefeated();
      } else {
        self._loadNextQuestion();
      }
    }, 800);
  };

  MonsterMode.prototype._onMonsterDefeated = function () {
    this._battlePhase = 'victory';
    this._monstersDefeated++;
    this._addScore(20 + this._wave * 5);

    // 获得经验
    this.playerExp += this.currentMonster.exp;
    this._checkLevelUp();

    // 死亡动画
    this._monsterSprite.classList.add('sz-easter-monster-defeated');
    Utils.playSound('success');

    var self = this;
    this._setTimeout(function () {
      self._monsterSprite.classList.remove('sz-easter-monster-defeated');
      self._wave++;
      self._spawnMonster();
    }, 1500);
  };

  MonsterMode.prototype._onPlayerDefeated = function () {
    this._battlePhase = 'defeat';
    Utils.playSound('explode');
    this._showResult();
  };

  MonsterMode.prototype._checkLevelUp = function () {
    while (this.playerExp >= this.expToNextLevel) {
      this.playerExp -= this.expToNextLevel;
      this.playerLevel++;
      this.playerMaxHP += 20;
      this.playerHP = this.playerMaxHP; // 升级回满血
      this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
      Utils.playSound('levelup');

      // 升级特效
      var levelUp = Utils.createEl('div', 'sz-easter-levelup-effect', this._effectsEl);
      levelUp.textContent = 'LEVEL UP!';
      setTimeout(function () {
        if (levelUp.parentNode) levelUp.parentNode.removeChild(levelUp);
      }, 1500);
    }
    this._updatePlayerHP();
    this._updatePlayerEXP();
    this._updatePlayerLevelUI();
  };

  MonsterMode.prototype._showDamageText = function (damage, isCritical, target) {
    var dmgEl = Utils.createEl('div', 'sz-easter-damage-text sz-easter-damage-' + target, this._effectsEl);
    dmgEl.textContent = (isCritical ? '暴击! ' : '') + '-' + damage;
    if (isCritical) dmgEl.classList.add('sz-easter-damage-critical');

    requestAnimationFrame(function () {
      dmgEl.style.transition = 'all 0.8s ease-out';
      dmgEl.style.transform = 'translateY(-50px)';
      dmgEl.style.opacity = '0';
    });

    setTimeout(function () {
      if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
    }, 800);
  };

  MonsterMode.prototype._updateMonsterHP = function () {
    var percent = (this.currentMonster.currentHP / this.currentMonster.maxHP) * 100;
    this._monsterHpFill.style.width = percent + '%';
    this._monsterHpText.textContent = this.currentMonster.currentHP + '/' + this.currentMonster.maxHP;

    if (percent < 30) {
      this._monsterHpFill.classList.add('sz-easter-hp-low');
    }
  };

  MonsterMode.prototype._updatePlayerHP = function () {
    var fill = this.container.querySelector('[data-role="player-hp"]');
    var text = this.container.querySelector('.sz-easter-hp-text');
    var percent = (this.playerHP / this.playerMaxHP) * 100;
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = this.playerHP + '/' + this.playerMaxHP;
  };

  MonsterMode.prototype._updatePlayerEXP = function () {
    var fill = this.container.querySelector('[data-role="player-exp"]');
    var text = this.container.querySelector('.sz-easter-exp-text');
    var percent = (this.playerExp / this.expToNextLevel) * 100;
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = this.playerExp + '/' + this.expToNextLevel + ' EXP';
  };

  MonsterMode.prototype._updatePlayerLevelUI = function () {
    var nameEl = this.container.querySelector('.sz-easter-player-name');
    if (nameEl) nameEl.textContent = '勇者 Lv.' + this.playerLevel;
  };

  MonsterMode.prototype._updateScoreUI = function () {
    // 分数显示在波次信息中
    var waveInfo = this.container.querySelector('.sz-easter-monster-wave-info');
    if (waveInfo) {
      waveInfo.textContent = '第 ' + this._wave + ' 波 | 击败: ' + this._monstersDefeated + ' | 分数: ' + this.score;
    }
  };

  SZ.easterEggs.modes.MonsterMode = MonsterMode;


  // ============================================================
  //  模式11: 太空模式 (SpaceMode)
  // ============================================================
  /**
   * 太空模式
   * 背景是星空，题目是行星
   * 用火箭（鼠标/手指）瞄准正确选项
   * 发射导弹击中正确答案
   * 特效炫酷
   */
  var SpaceMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._stars = [];
    this._planets = [];
    this._rocket = { x: 0, y: 0, angle: 0 };
    this._missiles = [];
    this._explosions = [];
    this._gameArea = null;
    this._rocketEl = null;
    this._currentQuestion = null;
    this._questionEl = null;
    this._scoreEl = null;
    this._ammo = 5;
    this._maxAmmo = 5;
    this._reloadTime = 2000;
    this._isReloading = false;
    this._level = 1;
    this._planetsDestroyed = 0;
  };

  SpaceMode.prototype = Object.create(BaseMode.prototype);
  SpaceMode.prototype.constructor = SpaceMode;

  SpaceMode.displayName = '太空模式';
  SpaceMode.description = '浩瀚星海中，用火箭瞄准正确答案的行星，发射导弹击毁它！';
  SpaceMode.icon = '🚀';
  SpaceMode.uiClass = 'sz-easter-space';

  SpaceMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-space-header">' +
        '<div class="sz-easter-space-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">弹药</span><span class="sz-easter-stat-value" data-stat="ammo">🚀🚀🚀🚀🚀</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">关卡</span><span class="sz-easter-stat-value" data-stat="level">1</span></div>' +
        '</div>' +
        '<div class="sz-easter-space-question" data-role="question">瞄准正确答案的行星！</div>' +
      '</div>' +
      '<div class="sz-easter-space-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-space-stars" data-role="stars"></div>' +
        '<div class="sz-easter-space-planets" data-role="planets"></div>' +
        '<div class="sz-easter-space-missiles" data-role="missiles"></div>' +
        '<div class="sz-easter-space-explosions" data-role="explosions"></div>' +
        '<div class="sz-easter-space-rocket" data-role="rocket">🚀</div>' +
      '</div>' +
      '<div class="sz-easter-space-footer">' +
        '<div class="sz-easter-space-hint">移动鼠标瞄准，点击发射导弹</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">返回基地</button>' +
      '</div>';

    this._gameArea = this.container.querySelector('[data-role="gamearea"]');
    this._rocketEl = this.container.querySelector('[data-role="rocket"]');
    this._planetsEl = this.container.querySelector('[data-role="planets"]');
    this._missilesEl = this.container.querySelector('[data-role="missiles"]');
    this._explosionsEl = this.container.querySelector('[data-role="explosions"]');
    this._starsEl = this.container.querySelector('[data-role="stars"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');

    this._initStars();
    this._loadNewWave();
    this._startGameLoop();
  };

  SpaceMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 鼠标移动 - 火箭瞄准
    this._addEventListener(this._gameArea, 'mousemove', function (e) {
      self._aimRocket(e);
    });

    // 点击发射
    this._addEventListener(this._gameArea, 'click', function (e) {
      self._fireMissile(e);
    });
  };

  SpaceMode.prototype._initStars = function () {
    this._starsEl.innerHTML = '';
    for (var i = 0; i < 100; i++) {
      var star = Utils.createEl('div', 'sz-easter-space-star', this._starsEl);
      star.style.left = Utils.random(0, 100) + '%';
      star.style.top = Utils.random(0, 100) + '%';
      star.style.width = Utils.random(1, 3) + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Utils.random(0, 3) + 's';
      star.style.animationDuration = Utils.random(1, 3) + 's';
    }
  };

  SpaceMode.prototype._aimRocket = function (e) {
    if (!this._gameArea || !this._rocketEl) return;
    var rect = this._gameArea.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // 火箭在底部中央
    var rocketX = rect.width / 2;
    var rocketY = rect.height - 60;

    // 计算角度
    var angle = Math.atan2(y - rocketY, x - rocketX) * (180 / Math.PI) + 90;
    this._rocketEl.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';

    this._rocket.x = rocketX;
    this._rocket.y = rocketY;
    this._rocket.angle = angle;
  };

  SpaceMode.prototype._fireMissile = function (e) {
    if (this._ammo <= 0 || this._isReloading) return;

    this._ammo--;
    this._updateAmmoUI();
    Utils.playSound('hit');

    var rect = this._gameArea.getBoundingClientRect();
    var targetX = e.clientX - rect.left;
    var targetY = e.clientY - rect.top;

    var missile = {
      el: Utils.createEl('div', 'sz-easter-space-missile', this._missilesEl),
      x: this._rocket.x,
      y: this._rocket.y,
      targetX: targetX,
      targetY: targetY,
      speed: 8,
      active: true
    };

    // 计算方向
    var dx = targetX - missile.x;
    var dy = targetY - missile.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    missile.vx = (dx / dist) * missile.speed;
    missile.vy = (dy / dist) * missile.speed;

    // 设置导弹角度
    var angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    missile.el.style.transform = 'rotate(' + angle + 'deg)';

    this._missiles.push(missile);

    // 检查弹药，自动装填
    if (this._ammo <= 0) {
      this._startReload();
    }
  };

  SpaceMode.prototype._startReload = function () {
    this._isReloading = true;
    var self = this;
    this._reloadInterval = this._setInterval(function () {
      if (self._ammo < self._maxAmmo) {
        self._ammo++;
        self._updateAmmoUI();
      }
      if (self._ammo >= self._maxAmmo) {
        clearInterval(self._reloadInterval);
        self._isReloading = false;
      }
    }, 500);
  };

  SpaceMode.prototype._loadNewWave = function () {
    this.currentQuestion = this._getNextQuestion(this._level);
    this._questionEl.textContent = this.currentQuestion.question;

    // 清空现有行星
    this._planetsEl.innerHTML = '';
    this._planets = [];

    var rect = this._gameArea.getBoundingClientRect();
    var options = this.currentQuestion.options;
    var planetEmojis = ['🪐', '🌍', '🌙', '☀️', '⭐', '🌟'];

    options.forEach(function (opt, idx) {
      var isCorrect = idx === this.currentQuestion.answer;
      var planet = {
        el: Utils.createEl('div', 'sz-easter-space-planet', this._planetsEl),
        x: Utils.random(60, rect.width - 60),
        y: Utils.random(40, rect.height * 0.4),
        index: idx,
        isCorrect: isCorrect,
        text: opt,
        size: isCorrect ? 70 : 55 + Utils.random(-10, 10),
        orbitSpeed: Utils.random(0.3, 0.8),
        orbitRadius: Utils.random(10, 30),
        orbitOffset: Utils.random(0, Math.PI * 2),
        baseX: 0,
        baseY: 0
      };

      planet.baseX = planet.x;
      planet.baseY = planet.y;
      planet.el.textContent = planetEmojis[idx % planetEmojis.length];
      planet.el.style.fontSize = planet.size + 'px';
      planet.el.setAttribute('data-idx', idx);

      // 添加选项文字
      var label = Utils.createEl('div', 'sz-easter-planet-label');
      label.textContent = opt;
      planet.el.appendChild(label);

      if (isCorrect) {
        planet.el.classList.add('sz-easter-planet-correct');
      }

      this._planets.push(planet);
    }.bind(this));
  };

  SpaceMode.prototype._startGameLoop = function () {
    var self = this;
    var lastTime = 0;

    function loop(timestamp) {
      if (!self.isRunning) return;

      if (!lastTime) lastTime = timestamp;
      var delta = timestamp - lastTime;
      lastTime = timestamp;

      // 更新行星轨道运动
      self._planets.forEach(function (planet) {
        planet.orbitOffset += planet.orbitSpeed * 0.01;
        planet.x = planet.baseX + Math.cos(planet.orbitOffset) * planet.orbitRadius;
        planet.y = planet.baseY + Math.sin(planet.orbitOffset) * planet.orbitRadius * 0.5;
        planet.el.style.left = planet.x + 'px';
        planet.el.style.top = planet.y + 'px';
      });

      // 更新导弹
      for (var i = self._missiles.length - 1; i >= 0; i--) {
        var missile = self._missiles[i];
        if (!missile.active) continue;

        missile.x += missile.vx;
        missile.y += missile.vy;
        missile.el.style.left = missile.x + 'px';
        missile.el.style.top = missile.y + 'px';

        // 碰撞检测
        for (var j = 0; j < self._planets.length; j++) {
          var planet = self._planets[j];
          var dx = missile.x - planet.x - planet.size / 2;
          var dy = missile.y - planet.y - planet.size / 2;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < planet.size / 2) {
            self._onPlanetHit(planet, missile);
            missile.active = false;
            break;
          }
        }

        // 出界移除
        if (missile.x < -20 || missile.x > self._gameArea.offsetWidth + 20 ||
            missile.y < -20 || missile.y > self._gameArea.offsetHeight + 20) {
          missile.active = false;
        }

        if (!missile.active) {
          if (missile.el.parentNode) missile.el.parentNode.removeChild(missile.el);
          self._missiles.splice(i, 1);
        }
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  };

  SpaceMode.prototype._onPlanetHit = function (planet, missile) {
    var correct = planet.isCorrect;

    // 爆炸特效
    this._createExplosion(planet.x + planet.size / 2, planet.y + planet.size / 2, correct);

    // 移除行星
    planet.el.remove();
    var idx = this._planets.indexOf(planet);
    if (idx > -1) this._planets.splice(idx, 1);

    if (correct) {
      this._addScore(20 + this._level * 5);
      this._planetsDestroyed++;
      Utils.playSound('explode');

      // 每击毁5个正确行星升级
      if (this._planetsDestroyed > 0 && this._planetsDestroyed % 3 === 0) {
        this._level++;
        this._updateLevelUI();
      }

      // 下一波
      var self = this;
      this._setTimeout(function () {
        if (self.questionCount >= 15) {
          self._showResult();
        } else {
          self._loadNewWave();
        }
      }, 800);
    } else {
      this._addScore(-10);
      Utils.playSound('wrong');
      this._checkAnswer(this.currentQuestion, planet.index);
    }

    this.questionCount++;
    if (correct) this.correctCount++; else this.wrongCount++;
  };

  SpaceMode.prototype._createExplosion = function (x, y, isCorrect) {
    var explosion = Utils.createEl('div', 'sz-easter-space-explosion', this._explosionsEl);
    explosion.style.left = (x - 25) + 'px';
    explosion.style.top = (y - 25) + 'px';
    explosion.textContent = isCorrect ? '💥' : '❌';

    requestAnimationFrame(function () {
      explosion.style.transition = 'all 0.5s ease-out';
      explosion.style.transform = 'scale(2)';
      explosion.style.opacity = '0';
    });

    setTimeout(function () {
      if (explosion.parentNode) explosion.parentNode.removeChild(explosion);
    }, 500);
  };

  SpaceMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  SpaceMode.prototype._updateAmmoUI = function () {
    var el = this.container.querySelector('[data-stat="ammo"]');
    if (el) {
      var ammo = '';
      for (var i = 0; i < this._maxAmmo; i++) {
        ammo += i < this._ammo ? '🚀' : '⚫';
      }
      el.textContent = ammo;
    }
  };

  SpaceMode.prototype._updateLevelUI = function () {
    var el = this.container.querySelector('[data-stat="level"]');
    if (el) el.textContent = this._level;
    Utils.playSound('levelup');
  };

  SpaceMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._reloadInterval) clearInterval(this._reloadInterval);
  };

  SZ.easterEggs.modes.SpaceMode = SpaceMode;


  // ============================================================
  //  模式12: 音乐模式 (RhythmMode)
  // ============================================================
  /**
   * 音乐模式
   * 按照节奏点击选项
   * 节拍点出现时点击正确选项
   * 类似音乐游戏
   * Perfect/Good/Miss判定
   */
  var RhythmMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._bpm = 100;
    this._beatInterval = 600; // ms per beat
    this._notes = [];
    this._tracks = [];
    this._scoreMultiplier = 1;
    this._combo = 0;
    this._maxCombo = 0;
    this._perfectCount = 0;
    this._goodCount = 0;
    this._missCount = 0;
    this._judgeLineY = 0;
    this._noteSpeed = 3;
    this._gameArea = null;
    this._currentQuestion = null;
    this._questionEl = null;
    this._trackCount = 4;
    this._songProgress = 0;
    this._songDuration = 60;
    this._lastBeatTime = 0;
    this._beatCount = 0;
  };

  RhythmMode.prototype = Object.create(BaseMode.prototype);
  RhythmMode.prototype.constructor = RhythmMode;

  RhythmMode.displayName = '音乐模式';
  RhythmMode.description = '跟着节拍点击正确选项！Perfect/Good/Miss，考验你的节奏感！';
  RhythmMode.icon = '🎵';
  RhythmMode.uiClass = 'sz-easter-rhythm';

  RhythmMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-rhythm-header">' +
        '<div class="sz-easter-rhythm-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">判定</span><span class="sz-easter-stat-value" data-stat="judge">--</span></div>' +
        '</div>' +
        '<div class="sz-easter-rhythm-question" data-role="question">准备开始...</div>' +
      '</div>' +
      '<div class="sz-easter-rhythm-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-rhythm-tracks" data-role="tracks"></div>' +
        '<div class="sz-easter-rhythm-judge-line"></div>' +
        '<div class="sz-easter-rhythm-notes" data-role="notes"></div>' +
        '<div class="sz-easter-rhythm-effects" data-role="effects"></div>' +
      '</div>' +
      '<div class="sz-easter-rhythm-footer">' +
        '<div class="sz-easter-rhythm-keys">' +
          '<span class="sz-easter-key">D</span>' +
          '<span class="sz-easter-key">F</span>' +
          '<span class="sz-easter-key">J</span>' +
          '<span class="sz-easter-key">K</span>' +
        '</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._gameArea = this.container.querySelector('[data-role="gamearea"]');
    this._tracksEl = this.container.querySelector('[data-role="tracks"]');
    this._notesEl = this.container.querySelector('[data-role="notes"]');
    this._effectsEl = this.container.querySelector('[data-role="effects"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');

    this._initTracks();
    this._loadNewQuestion();
    this._startGameLoop();
    this._startBeatGenerator();
  };

  RhythmMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 键盘按键 D F J K 对应四个轨道
    this._addEventListener(document, 'keydown', function (e) {
      if (!self.isRunning) return;
      var keyMap = { 'KeyD': 0, 'KeyF': 1, 'KeyJ': 2, 'KeyK': 3 };
      if (keyMap.hasOwnProperty(e.code)) {
        e.preventDefault();
        self._hitTrack(keyMap[e.code]);
      }
    });

    // 点击轨道
    this._addEventListener(this._tracksEl, 'click', function (e) {
      var track = e.target.closest('.sz-easter-rhythm-track');
      if (track) {
        var idx = parseInt(track.getAttribute('data-track'), 10);
        self._hitTrack(idx);
      }
    });
  };

  RhythmMode.prototype._initTracks = function () {
    this._tracksEl.innerHTML = '';
    var labels = ['D', 'F', 'J', 'K'];
    for (var i = 0; i < this._trackCount; i++) {
      var track = Utils.createEl('div', 'sz-easter-rhythm-track', this._tracksEl);
      track.setAttribute('data-track', i);
      track.innerHTML = '<span class="sz-easter-rhythm-track-key">' + labels[i] + '</span>';
    }
  };

  RhythmMode.prototype._loadNewQuestion = function () {
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;

    // 给每个轨道分配一个选项
    var shuffledIndices = Utils.shuffle([0, 1, 2, 3]);
    this._trackAnswers = shuffledIndices.slice(0, 4);
    // 如果选项少于4个，补充
    while (this._trackAnswers.length < 4) {
      this._trackAnswers.push(Utils.randomInt(0, this.currentQuestion.options.length - 1));
    }

    // 更新轨道标签
    var tracks = this._tracksEl.querySelectorAll('.sz-easter-rhythm-track');
    var self = this;
    tracks.forEach(function (track, idx) {
      var optIdx = self._trackAnswers[idx];
      var opt = self.currentQuestion.options[optIdx] || ('选项' + (optIdx + 1));
      var label = track.querySelector('.sz-easter-rhythm-track-label');
      if (!label) {
        label = Utils.createEl('div', 'sz-easter-rhythm-track-label');
        track.appendChild(label);
      }
      label.textContent = opt;

      // 标记正确答案轨道
      if (optIdx === self.currentQuestion.answer) {
        track.classList.add('sz-easter-track-correct');
      } else {
        track.classList.remove('sz-easter-track-correct');
      }
    });
  };

  RhythmMode.prototype._startBeatGenerator = function () {
    var self = this;
    this._beatInterval = 60000 / this._bpm;

    this._beatIntervalTimer = this._setInterval(function () {
      if (!self.isRunning) return;
      self._spawnNote();
      self._beatCount++;

      // 每8拍换一道题
      if (self._beatCount > 0 && self._beatCount % 8 === 0) {
        self._loadNewQuestion();
      }
    }, this._beatInterval);
  };

  RhythmMode.prototype._spawnNote = function () {
    // 随机选择轨道，正确轨道出现概率更高
    var correctTrack = -1;
    for (var i = 0; i < this._trackAnswers.length; i++) {
      if (this._trackAnswers[i] === this.currentQuestion.answer) {
        correctTrack = i;
        break;
      }
    }

    var trackIdx;
    if (Math.random() < 0.4 && correctTrack >= 0) {
      // 40%概率生成正确答案
      trackIdx = correctTrack;
    } else {
      trackIdx = Utils.randomInt(0, this._trackCount - 1);
    }

    var note = {
      el: Utils.createEl('div', 'sz-easter-rhythm-note', this._notesEl),
      track: trackIdx,
      y: -40,
      speed: this._noteSpeed + this.level * 0.3,
      isCorrect: trackIdx === correctTrack,
      hit: false
    };

    // 计算轨道x位置
    var trackWidth = this._gameArea.offsetWidth / this._trackCount;
    note.x = trackIdx * trackWidth + trackWidth / 2 - 25;
    note.el.style.left = note.x + 'px';
    note.el.style.top = note.y + 'px';

    if (note.isCorrect) {
      note.el.classList.add('sz-easter-note-correct');
    }

    this._notes.push(note);
  };

  RhythmMode.prototype._startGameLoop = function () {
    var self = this;
    var lastTime = 0;

    function loop(timestamp) {
      if (!self.isRunning) return;

      if (!lastTime) lastTime = timestamp;
      var delta = timestamp - lastTime;
      lastTime = timestamp;

      var gameHeight = self._gameArea.offsetHeight;
      self._judgeLineY = gameHeight - 80;

      // 更新音符位置
      for (var i = self._notes.length - 1; i >= 0; i--) {
        var note = self._notes[i];
        if (note.hit) continue;

        note.y += note.speed * (delta / 16);
        note.el.style.top = note.y + 'px';

        // 超出判定线（Miss）
        if (note.y > self._judgeLineY + 50) {
          if (note.isCorrect) {
            self._onMiss();
          }
          note.el.remove();
          self._notes.splice(i, 1);
        }
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  };

  RhythmMode.prototype._hitTrack = function (trackIdx) {
    // 找到该轨道最接近判定线的音符
    var closestNote = null;
    var closestDist = Infinity;

    for (var i = 0; i < this._notes.length; i++) {
      var note = this._notes[i];
      if (note.track !== trackIdx || note.hit) continue;

      var dist = Math.abs(note.y - this._judgeLineY);
      if (dist < closestDist && dist < 80) {
        closestDist = dist;
        closestNote = note;
      }
    }

    if (closestNote) {
      closestNote.hit = true;
      closestNote.el.remove();
      var idx = this._notes.indexOf(closestNote);
      if (idx > -1) this._notes.splice(idx, 1);

      // 判定
      var judge = '';
      var points = 0;

      if (closestDist < 15) {
        judge = 'PERFECT';
        points = 100;
        this._perfectCount++;
      } else if (closestDist < 40) {
        judge = 'GOOD';
        points = 50;
        this._goodCount++;
      } else {
        judge = 'BAD';
        points = 10;
        this._missCount++;
      }

      // 正确/错误判断
      if (closestNote.isCorrect) {
        this._combo++;
        this._maxCombo = Math.max(this._maxCombo, this._combo);
        var comboBonus = Math.floor(this._combo / 10) * 10;
        this._addScore(points + comboBonus);
        this._showJudgeEffect(trackIdx, judge, 'correct');
      } else {
        this._combo = 0;
        this._addScore(-20);
        this._showJudgeEffect(trackIdx, 'WRONG', 'wrong');
      }

      this._updateComboUI();
    } else {
      // 空击
      this._combo = 0;
      this._updateComboUI();
    }
  };

  RhythmMode.prototype._onMiss = function () {
    this._combo = 0;
    this._missCount++;
    this._addScore(-10);
    this._updateComboUI();
  };

  RhythmMode.prototype._showJudgeEffect = function (trackIdx, text, type) {
    var trackWidth = this._gameArea.offsetWidth / this._trackCount;
    var x = trackIdx * trackWidth + trackWidth / 2;

    var effect = Utils.createEl('div', 'sz-easter-rhythm-judge sz-easter-judge-' + type, this._effectsEl);
    effect.textContent = text;
    effect.style.left = x + 'px';
    effect.style.top = this._judgeLineY - 40 + 'px';

    requestAnimationFrame(function () {
      effect.style.transition = 'all 0.5s ease-out';
      effect.style.transform = 'translateY(-30px) scale(1.2)';
      effect.style.opacity = '0';
    });

    setTimeout(function () {
      if (effect.parentNode) effect.parentNode.removeChild(effect);
    }, 500);
  };

  RhythmMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  RhythmMode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this._combo;
  };

  RhythmMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._beatIntervalTimer) clearInterval(this._beatIntervalTimer);
  };

  SZ.easterEggs.modes.RhythmMode = RhythmMode;


  // ============================================================
  //  模式13: 侦探模式 (DetectiveMode)
  // ============================================================
  /**
   * 侦探模式
   * 题目是案件，选项是线索
   * 需要找出所有正确线索（多选题）
   * 有提示系统（消耗侦探点数）
   * 破案等级评定
   */
  var DetectiveMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._detectivePoints = 100;
    this._casesSolved = 0;
    this._currentCase = null;
    this._selectedClues = [];
    this._phase = 'investigating'; // investigating | revealed
    this._hintCount = 3;
    this._caseDifficulty = 1;
    this._rank = '实习侦探';
    this._ranks = [
      { name: '实习侦探', minScore: 0 },
      { name: '助理侦探', minScore: 100 },
      { name: '正式侦探', minScore: 300 },
      { name: '高级侦探', minScore: 600 },
      { name: '名侦探', minScore: 1000 },
      { name: '神探', minScore: 2000 }
    ];
    this._questionEl = null;
    this._optionsEl = null;
    this._clueBoard = null;
  };

  DetectiveMode.prototype = Object.create(BaseMode.prototype);
  DetectiveMode.prototype.constructor = DetectiveMode;

  DetectiveMode.displayName = '侦探模式';
  DetectiveMode.description = '案件推理！找出所有正确线索，用侦探点数获取提示，破案升级！';
  DetectiveMode.icon = '🔍';
  DetectiveMode.uiClass = 'sz-easter-detective';

  DetectiveMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-detective-header">' +
        '<div class="sz-easter-detective-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">积分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">侦探点</span><span class="sz-easter-stat-value" data-stat="points">100</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">等级</span><span class="sz-easter-stat-value" data-stat="rank">实习侦探</span></div>' +
        '</div>' +
        '<div class="sz-easter-detective-case-info">' +
          '<span class="sz-easter-case-number">案件 #' + (this._casesSolved + 1) + '</span>' +
          '<span class="sz-easter-case-difficulty">难度: ' + '⭐'.repeat(this._caseDifficulty) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-detective-main">' +
        '<div class="sz-easter-detective-case">' +
          '<div class="sz-easter-detective-case-title">📋 案件档案</div>' +
          '<div class="sz-easter-detective-question" data-role="question"></div>' +
        '</div>' +
        '<div class="sz-easter-detective-clues-area">' +
          '<div class="sz-easter-detective-clues-title">🔎 线索收集（找出所有正确线索）</div>' +
          '<div class="sz-easter-detective-clues" data-role="clues"></div>' +
        '</div>' +
        '<div class="sz-easter-detective-selected">' +
          '<div class="sz-easter-detective-selected-title">📝 已选线索: <span data-role="selected-count">0</span> 个</div>' +
          '<button class="sz-easter-btn sz-easter-btn-submit" data-action="submit">提交推理</button>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-detective-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-hint" data-action="hint">💡 使用提示 (20点)</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._cluesEl = this.container.querySelector('[data-role="clues"]');

    this._loadNewCase();
  };

  DetectiveMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var submitBtn = this.container.querySelector('[data-action="submit"]');
    if (submitBtn) {
      this._addEventListener(submitBtn, 'click', function () {
        self._submitCase();
      });
    }

    var hintBtn = this.container.querySelector('[data-action="hint"]');
    if (hintBtn) {
      this._addEventListener(hintBtn, 'click', function () {
        self._useHint();
      });
    }
  };

  DetectiveMode.prototype._loadNewCase = function () {
    this._phase = 'investigating';
    this._selectedClues = [];
    this.currentQuestion = this._getNextQuestion(this._caseDifficulty);

    // 确保是多选题或转换为多选
    var correctCount = Array.isArray(this.currentQuestion.answer)
      ? this.currentQuestion.answer.length
      : 1;

    this._questionEl.textContent = '案件：' + this.currentQuestion.question +
      '（共 ' + correctCount + ' 个正确线索）';

    // 渲染线索
    this._cluesEl.innerHTML = '';
    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var clue = Utils.createEl('div', 'sz-easter-detective-clue', self._cluesEl);
      clue.setAttribute('data-index', idx);
      clue.innerHTML =
        '<div class="sz-easter-clue-checkbox">☐</div>' +
        '<div class="sz-easter-clue-text">' + opt + '</div>';

      clue.onclick = function () {
        self._toggleClue(idx);
      };
    });

    this._updateSelectedCount();
  };

  DetectiveMode.prototype._toggleClue = function (idx) {
    if (this._phase !== 'investigating') return;

    var clueEl = this._cluesEl.querySelector('[data-index="' + idx + '"]');
    var checkbox = clueEl.querySelector('.sz-easter-clue-checkbox');

    var pos = this._selectedClues.indexOf(idx);
    if (pos > -1) {
      this._selectedClues.splice(pos, 1);
      clueEl.classList.remove('sz-easter-clue-selected');
      checkbox.textContent = '☐';
    } else {
      this._selectedClues.push(idx);
      clueEl.classList.add('sz-easter-clue-selected');
      checkbox.textContent = '☑';
    }

    this._updateSelectedCount();
    Utils.playSound('click');
  };

  DetectiveMode.prototype._submitCase = function () {
    if (this._phase !== 'investigating') return;
    if (this._selectedClues.length === 0) return;

    this._phase = 'revealed';
    this.questionCount++;

    // 计算正确答案
    var correctAnswers = Array.isArray(this.currentQuestion.answer)
      ? this.currentQuestion.answer.slice()
      : [this.currentQuestion.answer];

    var selectedSet = this._selectedClues.slice().sort();
    var correctSet = correctAnswers.slice().sort();

    // 计算正确数量和错误数量
    var correctCount = 0;
    var wrongCount = 0;

    selectedSet.forEach(function (idx) {
      if (correctSet.indexOf(idx) > -1) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    var missedCount = correctSet.length - correctCount;
    var totalCorrect = correctSet.length;

    // 评分
    var accuracy = correctCount / (correctCount + wrongCount + missedCount);
    var isPerfect = correctCount === totalCorrect && wrongCount === 0;

    // 显示结果
    var clueEls = this._cluesEl.querySelectorAll('.sz-easter-detective-clue');
    clueEls.forEach(function (el, idx) {
      var checkbox = el.querySelector('.sz-easter-clue-checkbox');
      var isCorrect = correctSet.indexOf(idx) > -1;
      var isSelected = selectedSet.indexOf(idx) > -1;

      if (isCorrect && isSelected) {
        el.classList.add('sz-easter-clue-correct');
        checkbox.textContent = '✅';
      } else if (isCorrect && !isSelected) {
        el.classList.add('sz-easter-clue-missed');
        checkbox.textContent = '🔍';
      } else if (!isCorrect && isSelected) {
        el.classList.add('sz-easter-clue-wrong');
        checkbox.textContent = '❌';
      }
    });

    // 计算得分
    var baseScore = correctCount * 20 - wrongCount * 10 - missedCount * 5;
    if (isPerfect) baseScore += 50; // 完美破案奖励
    baseScore = Math.max(0, baseScore);
    this._addScore(baseScore);

    // 侦探点数奖励/消耗
    if (isPerfect) {
      this._detectivePoints += 30;
    } else if (accuracy >= 0.7) {
      this._detectivePoints += 10;
    }

    this._updatePointsUI();

    // 更新等级
    this._updateRank();

    // 破案计数
    if (isPerfect || accuracy >= 0.5) {
      this._casesSolved++;
    }

    // 难度调整
    if (isPerfect && this._casesSolved % 3 === 0) {
      this._caseDifficulty = Math.min(5, this._caseDifficulty + 1);
    }

    var self = this;
    this._setTimeout(function () {
      if (self._casesSolved >= 10) {
        self._showResult();
      } else {
        self._loadNewCase();
        self._updateCaseInfo();
      }
    }, 2500);
  };

  DetectiveMode.prototype._useHint = function () {
    if (this._detectivePoints < 20 || this._phase !== 'investigating') return;

    this._detectivePoints -= 20;
    this._updatePointsUI();

    // 揭示一个未选的正确答案
    var correctAnswers = Array.isArray(this.currentQuestion.answer)
      ? this.currentQuestion.answer.slice()
      : [this.currentQuestion.answer];

    var unrevealedCorrect = correctAnswers.filter(function (idx) {
      return this._selectedClues.indexOf(idx) === -1;
    }.bind(this));

    if (unrevealedCorrect.length > 0) {
      var hintIdx = Utils.randomChoice(unrevealedCorrect);
      var clueEl = this._cluesEl.querySelector('[data-index="' + hintIdx + '"]');
      if (clueEl) {
        clueEl.classList.add('sz-easter-clue-hint');
        clueEl.classList.add('sz-easter-clue-selected');
        var checkbox = clueEl.querySelector('.sz-easter-clue-checkbox');
        checkbox.textContent = '💡';
        if (this._selectedClues.indexOf(hintIdx) === -1) {
          this._selectedClues.push(hintIdx);
          this._updateSelectedCount();
        }
      }
    }

    Utils.playSound('coin');
  };

  DetectiveMode.prototype._updateRank = function () {
    for (var i = this._ranks.length - 1; i >= 0; i--) {
      if (this.score >= this._ranks[i].minScore) {
        if (this._rank !== this._ranks[i].name) {
          this._rank = this._ranks[i].name;
          Utils.playSound('levelup');
        }
        break;
      }
    }
    this._updateRankUI();
  };

  DetectiveMode.prototype._updateCaseInfo = function () {
    var caseNum = this.container.querySelector('.sz-easter-case-number');
    var caseDiff = this.container.querySelector('.sz-easter-case-difficulty');
    if (caseNum) caseNum.textContent = '案件 #' + (this._casesSolved + 1);
    if (caseDiff) caseDiff.textContent = '难度: ' + '⭐'.repeat(this._caseDifficulty);
  };

  DetectiveMode.prototype._updateSelectedCount = function () {
    var el = this.container.querySelector('[data-role="selected-count"]');
    if (el) el.textContent = this._selectedClues.length;
  };

  DetectiveMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  DetectiveMode.prototype._updatePointsUI = function () {
    var el = this.container.querySelector('[data-stat="points"]');
    if (el) el.textContent = this._detectivePoints;
  };

  DetectiveMode.prototype._updateRankUI = function () {
    var el = this.container.querySelector('[data-stat="rank"]');
    if (el) el.textContent = this._rank;
  };

  SZ.easterEggs.modes.DetectiveMode = DetectiveMode;


  // ============================================================
  //  模式14: 末日模式 (ZombieMode)
  // ============================================================
  /**
   * 末日模式
   * 僵尸潮来袭，每答对一题击退一波
   * 答错僵尸靠近
   * 有各种道具（炸弹、冰冻、加血）
   * 波次递增难度
   */
  var ZombieMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._wave = 1;
    this._zombies = [];
    this._zombieCount = 0;
    this._zombiesKilled = 0;
    this._playerHP = 100;
    this._playerMaxHP = 100;
    this._defenseLine = 0;
    this._items = { bomb: 2, freeze: 2, heal: 2 };
    this._gameArea = null;
    this._zombieEl = null;
    this._questionEl = null;
    this._optionsEl = null;
    this._waveTimer = 0;
    this._zombieSpeed = 0.5;
    this._spawnInterval = 2500;
    this._lastSpawnTime = 0;
    this._isFrozen = false;
    this._freezeDuration = 0;
  };

  ZombieMode.prototype = Object.create(BaseMode.prototype);
  ZombieMode.prototype.constructor = ZombieMode;

  ZombieMode.displayName = '末日模式';
  ZombieMode.description = '僵尸潮来袭！答对题目击退僵尸，使用道具生存更久，看看你能撑到第几波！';
  ZombieMode.icon = '🧟';
  ZombieMode.uiClass = 'sz-easter-zombie';

  ZombieMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-zombie-header">' +
        '<div class="sz-easter-zombie-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">波次</span><span class="sz-easter-stat-value" data-stat="wave">1</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">击杀</span><span class="sz-easter-stat-value" data-stat="kills">0</span></div>' +
        '</div>' +
        '<div class="sz-easter-zombie-hp-bar">' +
          '<div class="sz-easter-zombie-hp-fill" data-role="player-hp" style="width:100%"></div>' +
          '<span class="sz-easter-zombie-hp-text">100/100 HP</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-zombie-gamearea" data-role="gamearea">' +
        '<div class="sz-easter-zombie-field" data-role="zombie-field">' +
          '<div class="sz-easter-zombie-defense-line"></div>' +
          '<div class="sz-easter-zombie-player">🧑‍🚀</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-zombie-question-area">' +
        '<div class="sz-easter-zombie-question" data-role="question"></div>' +
        '<div class="sz-easter-zombie-options" data-role="options"></div>' +
      '</div>' +
      '<div class="sz-easter-zombie-footer">' +
        '<div class="sz-easter-zombie-items">' +
          '<button class="sz-easter-item-btn" data-item="bomb">💣 炸弹 <span data-item-count="bomb">2</span></button>' +
          '<button class="sz-easter-item-btn" data-item="freeze">❄️ 冰冻 <span data-item-count="freeze">2</span></button>' +
          '<button class="sz-easter-item-btn" data-item="heal">❤️ 加血 <span data-item-count="heal">2</span></button>' +
        '</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">撤退</button>' +
      '</div>';

    this._gameArea = this.container.querySelector('[data-role="gamearea"]');
    this._zombieField = this.container.querySelector('[data-role="zombie-field"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    var self = this;
    this._setTimeout(function () {
      self._initGame();
      self._loadNextQuestion();
      self._startGameLoop();
    }, 100);
  };

  ZombieMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 道具按钮
    var itemBtns = this.container.querySelectorAll('[data-item]');
    itemBtns.forEach(function (btn) {
      self._addEventListener(btn, 'click', function () {
        var item = btn.getAttribute('data-item');
        self._useItem(item);
      });
    });
  };

  ZombieMode.prototype._initGame = function () {
    var rect = this._zombieField.getBoundingClientRect();
    this._fieldWidth = rect.width;
    this._fieldHeight = rect.height;
    this._defenseLineX = 80;
  };

  ZombieMode.prototype._loadNextQuestion = function () {
    this.currentQuestion = this._getNextQuestion(Math.min(5, this._wave));
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-zombie-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  ZombieMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-zombie-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      // 击退最近的僵尸
      this._repelZombies();
      this._addScore(15 + this._wave * 3);
      Utils.playSound('correct');
    } else {
      // 僵尸加速前进
      this._zombiesAdvance();
      Utils.playSound('wrong');
    }

    var self = this;
    this._setTimeout(function () {
      self._loadNextQuestion();
    }, 600);
  };

  ZombieMode.prototype._repelZombies = function () {
    // 击退所有僵尸
    for (var i = this._zombies.length - 1; i >= 0; i--) {
      var zombie = this._zombies[i];
      zombie.x += 60;

      if (zombie.x > this._fieldWidth + 50) {
        // 被击退出场外，击杀
        this._killZombie(zombie, i);
      } else {
        zombie.el.style.right = (this._fieldWidth - zombie.x) + 'px';
      }
    }
  };

  ZombieMode.prototype._zombiesAdvance = function () {
    // 所有僵尸快速前进一段
    for (var i = 0; i < this._zombies.length; i++) {
      var zombie = this._zombies[i];
      zombie.x -= 40;
      zombie.el.style.right = (this._fieldWidth - zombie.x) + 'px';
    }
  };

  ZombieMode.prototype._killZombie = function (zombie, index) {
    if (zombie.el && zombie.el.parentNode) {
      zombie.el.classList.add('sz-easter-zombie-dead');
      var el = zombie.el;
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }
    this._zombies.splice(index, 1);
    this._zombiesKilled++;
    this._updateKillsUI();
    Utils.playSound('explode');

    // 每击杀10只检查波次
    if (this._zombiesKilled > 0 && this._zombiesKilled % 8 === 0) {
      this._nextWave();
    }
  };

  ZombieMode.prototype._nextWave = function () {
    this._wave++;
    this._zombieSpeed += 0.15;
    this._spawnInterval = Math.max(800, this._spawnInterval - 200);
    this._updateWaveUI();
    Utils.playSound('levelup');

    // 波次奖励
    this._items.bomb++;
    this._items.freeze++;
    this._updateItemUI();
  };

  ZombieMode.prototype._useItem = function (itemType) {
    if (this._items[itemType] <= 0) return;

    this._items[itemType]--;
    this._updateItemUI();

    switch (itemType) {
      case 'bomb':
        this._useBomb();
        break;
      case 'freeze':
        this._useFreeze();
        break;
      case 'heal':
        this._useHeal();
        break;
    }
  };

  ZombieMode.prototype._useBomb = function () {
    // 消灭一半僵尸
    var killCount = Math.ceil(this._zombies.length / 2);
    for (var i = this._zombies.length - 1; i >= 0 && killCount > 0; i--, killCount--) {
      this._killZombie(this._zombies[i], i);
    }
    Utils.playSound('explode');

    // 爆炸特效
    var boom = Utils.createEl('div', 'sz-easter-zombie-boom', this._zombieField);
    boom.textContent = '💥';
    setTimeout(function () {
      if (boom.parentNode) boom.parentNode.removeChild(boom);
    }, 500);
  };

  ZombieMode.prototype._useFreeze = function () {
    this._isFrozen = true;
    this._freezeDuration = 5000;
    this._zombieField.classList.add('sz-easter-frozen');
    Utils.playSound('coin');

    var self = this;
    this._setTimeout(function () {
      self._isFrozen = false;
      if (self._zombieField) self._zombieField.classList.remove('sz-easter-frozen');
    }, 5000);
  };

  ZombieMode.prototype._useHeal = function () {
    this._playerHP = Math.min(this._playerMaxHP, this._playerHP + 30);
    this._updateHPUI();
    Utils.playSound('success');
  };

  ZombieMode.prototype._spawnZombie = function () {
    var zombieTypes = [
      { emoji: '🧟', hp: 1, speed: 1 },
      { emoji: '🧟‍♂️', hp: 2, speed: 0.8 },
      { emoji: '🧟‍♀️', hp: 1, speed: 1.2 },
      { emoji: '👹', hp: 3, speed: 0.6 }
    ];

    var type = zombieTypes[Math.min(zombieTypes.length - 1,
      Utils.randomInt(0, Math.min(zombieTypes.length - 1, this._wave)))];

    var zombieEl = Utils.createEl('div', 'sz-easter-zombie-enemy', this._zombieField);
    zombieEl.textContent = type.emoji;
    zombieEl.style.right = '-50px';
    zombieEl.style.top = Utils.random(20, this._fieldHeight - 60) + 'px';

    var zombie = {
      el: zombieEl,
      x: this._fieldWidth + 30,
      y: 0,
      hp: type.hp,
      baseSpeed: type.speed * this._zombieSpeed,
      type: type
    };

    this._zombies.push(zombie);
    this._zombieCount++;
  };

  ZombieMode.prototype._startGameLoop = function () {
    var self = this;
    var lastTime = 0;
    var spawnTimer = 0;

    function loop(timestamp) {
      if (!self.isRunning) return;

      if (!lastTime) lastTime = timestamp;
      var delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!self._isFrozen) {
        // 生成僵尸
        spawnTimer += delta;
        if (spawnTimer >= self._spawnInterval) {
          spawnTimer = 0;
          self._spawnZombie();
        }

        // 更新僵尸位置
        for (var i = self._zombies.length - 1; i >= 0; i--) {
          var zombie = self._zombies[i];
          zombie.x -= zombie.baseSpeed * (delta / 16);
          zombie.el.style.right = (self._fieldWidth - zombie.x) + 'px';

          // 到达防线
          if (zombie.x <= self._defenseLineX) {
            self._playerHP -= 10;
            self._updateHPUI();
            zombie.el.remove();
            self._zombies.splice(i, 1);
            Utils.playSound('hit');

            if (self._playerHP <= 0) {
              self._gameOver();
              return;
            }
          }
        }
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  };

  ZombieMode.prototype._gameOver = function () {
    this.isRunning = false;
    this._showResult();
  };

  ZombieMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  ZombieMode.prototype._updateWaveUI = function () {
    var el = this.container.querySelector('[data-stat="wave"]');
    if (el) el.textContent = this._wave;
  };

  ZombieMode.prototype._updateKillsUI = function () {
    var el = this.container.querySelector('[data-stat="kills"]');
    if (el) el.textContent = this._zombiesKilled;
  };

  ZombieMode.prototype._updateHPUI = function () {
    var fill = this.container.querySelector('[data-role="player-hp"]');
    var text = this.container.querySelector('.sz-easter-zombie-hp-text');
    var percent = (this._playerHP / this._playerMaxHP) * 100;
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = Math.max(0, this._playerHP) + '/' + this._playerMaxHP + ' HP';
  };

  ZombieMode.prototype._updateItemUI = function () {
    for (var item in this._items) {
      if (this._items.hasOwnProperty(item)) {
        var el = this.container.querySelector('[data-item-count="' + item + '"]');
        if (el) el.textContent = this._items[item];
      }
    }
  };

  SZ.easterEggs.modes.ZombieMode = ZombieMode;


  // ============================================================
  //  模式15: 恋爱模式 (LoveMode)
  // ============================================================
  /**
   * 恋爱模式
   * 攻略角色，答对题目增加好感度
   * 不同选项增加不同角色好感
   * 好感度达到一定程度解锁剧情
   * 多结局
   */
  var LoveMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._characters = [
      { id: 'alice', name: '艾莉丝', emoji: '👩‍🎓', affection: 0, personality: '学霸', desc: '温柔知性的学姐' },
      { id: 'bob', name: '小明', emoji: '👨‍💻', affection: 0, personality: '程序员', desc: '幽默风趣的技术宅' },
      { id: 'cindy', name: '心蝶', emoji: '👩‍🎨', affection: 0, personality: '艺术家', desc: '古灵精怪的画师' },
      { id: 'david', name: '大伟', emoji: '🧑‍🏫', affection: 0, personality: '老师', desc: '严谨认真的讲师' }
    ];
    this._currentCharIndex = 0;
    this._dialogIndex = 0;
    this._phase = 'dialog'; // dialog | quiz | ending
    this._dialogEl = null;
    this._characterEl = null;
    this._questionEl = null;
    this._optionsEl = null;
    this._storyProgress = 0;
    this._unlockedEndings = [];
    this._maxAffection = 100;
  };

  LoveMode.prototype = Object.create(BaseMode.prototype);
  LoveMode.prototype.constructor = LoveMode;

  LoveMode.displayName = '恋爱模式';
  LoveMode.description = '和角色们一起刷题增加好感度，解锁专属剧情，收获心动结局！';
  LoveMode.icon = '💕';
  LoveMode.uiClass = 'sz-easter-love';

  LoveMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-love-header">' +
        '<div class="sz-easter-love-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">好感度</span><span class="sz-easter-stat-value" data-stat="affection">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">角色</span><span class="sz-easter-stat-value" data-stat="char-name">艾莉丝</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">剧情</span><span class="sz-easter-stat-value" data-stat="story">第1章</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-love-main">' +
        '<div class="sz-easter-love-scene">' +
          '<div class="sz-easter-love-character" data-role="character">' +
            '<div class="sz-easter-love-char-emoji">👩‍🎓</div>' +
            '<div class="sz-easter-love-char-name">艾莉丝</div>' +
            '<div class="sz-easter-love-affection-bar">' +
              '<div class="sz-easter-love-affection-fill" data-role="affection-fill" style="width:0%"></div>' +
              '<span class="sz-easter-love-heart">💗</span>' +
            '</div>' +
          '</div>' +
          '<div class="sz-easter-love-dialog" data-role="dialog">' +
            '<div class="sz-easter-love-dialog-text" data-role="dialog-text"></div>' +
            '<div class="sz-easter-love-dialog-next">点击继续 ▶</div>' +
          '</div>' +
        '</div>' +
        '<div class="sz-easter-love-question-area" data-role="question-area" style="display:none">' +
          '<div class="sz-easter-love-question-title">💝 回答问题增加好感度！</div>' +
          '<div class="sz-easter-love-question" data-role="question"></div>' +
          '<div class="sz-easter-love-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-love-footer">' +
        '<div class="sz-easter-love-char-select">' +
          '<button class="sz-easter-char-tab active" data-char="0">👩‍🎓</button>' +
          '<button class="sz-easter-char-tab" data-char="1">👨‍💻</button>' +
          '<button class="sz-easter-char-tab" data-char="2">👩‍🎨</button>' +
          '<button class="sz-easter-char-tab" data-char="3">🧑‍🏫</button>' +
        '</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._characterEl = this.container.querySelector('[data-role="character"]');
    this._dialogEl = this.container.querySelector('[data-role="dialog"]');
    this._dialogTextEl = this.container.querySelector('[data-role="dialog-text"]');
    this._questionArea = this.container.querySelector('[data-role="question-area"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._showDialog();
  };

  LoveMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 对话继续
    this._addEventListener(this._dialogEl, 'click', function () {
      if (self._phase === 'dialog') {
        self._nextDialog();
      }
    });

    // 角色切换
    var charTabs = this.container.querySelectorAll('.sz-easter-char-tab');
    charTabs.forEach(function (tab) {
      self._addEventListener(tab, 'click', function () {
        var idx = parseInt(tab.getAttribute('data-char'), 10);
        self._switchCharacter(idx);
      });
    });
  };

  LoveMode.prototype._getDialogues = function (charId) {
    var dialogues = {
      alice: [
        '同学你好呀，我是艾莉丝，大三的学姐~',
        '听说你也在准备刷题考试呢，加油哦！',
        '我平时最喜欢泡在图书馆里看书了...',
        '对了，这道题你会做吗？我想考考你~',
        '哇，你好厉害！这道题很多人都做错了呢。',
        '和你一起学习真开心，时间过得好快~',
        '下次我们一起去图书馆刷题吧？就我们两个...',
        '你知道吗，认真做题的你，真的很迷人...',
        '我好像...有点喜欢上你了呢...',
        '我们在一起吧，一起刷题到天荒地老！💕'
      ],
      bob: [
        '嘿！新来的吗？我是小明，叫我码农小明就行~',
        '写代码和刷题是我的两大爱好，你呢？',
        '说起来，最近有个bug困扰我好久了...',
        '来来来，这道算法题很有意思，来挑战一下！',
        '牛啊兄弟！这思路我怎么没想到！',
        '有你这个刷题搭子，效率翻倍啊！',
        '晚上一起熬夜刷题吗？我请你喝可乐！',
        '说实话，认识你之后我连写代码都更有动力了~',
        '我觉得...我们不只是刷题伙伴那么简单...',
        '做我的专属调试伙伴吧！永远的那种~💕'
      ],
      cindy: [
        '嗨嗨~我是心蝶，你可以叫我小蝶蝶哦~',
        '今天的灵感来自于...你猜？嘿嘿~',
        '画画和刷题其实很像的，都需要创造力！',
        '来做道题吧，就当是给我找点灵感~',
        '哇塞！你这思路也太有创意了吧！',
        '我要把你认真的样子画下来！一定超帅/美！',
        '知道吗，你是我见过最有艺术感的刷题人~',
        '每次和你聊天，我的画笔都停不下来呢...',
        '我想...画一幅只属于我们两个人的画...',
        '做我的专属缪斯吧，永远给我灵感~💕'
      ],
      david: [
        '同学你好，我是大伟，负责算法课程。',
        '看你基础不错，有没有兴趣深入学习？',
        '学习是一件需要持之以恒的事情。',
        '来，做道题检验一下你的学习成果。',
        '嗯，不错，你的基础比我想象的更扎实。',
        '继续保持这个势头，你会有很大进步的。',
        '说起来...你最近的进步速度，让我很惊讶。',
        '不知道从什么时候开始，我不只是把你当学生了...',
        '我知道这样不太合适，但我控制不住自己...',
        '做我的终身学习者吧，我教你一辈子~💕'
      ]
    };
    return dialogues[charId] || dialogues.alice;
  };

  LoveMode.prototype._showDialog = function () {
    this._phase = 'dialog';
    this._questionArea.style.display = 'none';
    this._dialogEl.style.display = 'block';

    var char = this._characters[this._currentCharIndex];
    var dialogues = this._getDialogues(char.id);
    var affectionLevel = Math.floor(char.affection / 10);
    this._dialogIndex = Math.min(affectionLevel, dialogues.length - 1);

    this._dialogTextEl.textContent = dialogues[Math.min(this._dialogIndex, dialogues.length - 1)];
  };

  LoveMode.prototype._nextDialog = function () {
    var char = this._characters[this._currentCharIndex];
    var dialogues = this._getDialogues(char.id);

    this._dialogIndex++;
    var affectionLevel = Math.floor(char.affection / 10);

    if (this._dialogIndex > Math.min(affectionLevel + 1, dialogues.length - 1)) {
      // 需要通过答题增加好感度才能解锁更多剧情
      this._startQuiz();
      return;
    }

    if (this._dialogIndex >= dialogues.length) {
      // 达到结局
      this._showEnding();
      return;
    }

    this._dialogTextEl.textContent = dialogues[this._dialogIndex];
    Utils.playSound('click');
  };

  LoveMode.prototype._startQuiz = function () {
    this._phase = 'quiz';
    this._dialogEl.style.display = 'none';
    this._questionArea.style.display = 'block';

    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-love-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  LoveMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-love-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    var char = this._characters[this._currentCharIndex];

    if (correct) {
      var affectionGain = 5 + Math.floor(Math.random() * 5);
      char.affection = Math.min(this._maxAffection, char.affection + affectionGain);
      this._addScore(10);
      this._showAffectionGain(affectionGain);
      Utils.playSound('correct');
    } else {
      char.affection = Math.max(0, char.affection - 2);
      Utils.playSound('wrong');
    }

    this._updateAffectionUI();

    var self = this;
    this._setTimeout(function () {
      self._showDialog();
    }, 1200);
  };

  LoveMode.prototype._switchCharacter = function (idx) {
    this._currentCharIndex = idx;
    this._dialogIndex = 0;

    var char = this._characters[idx];

    // 更新角色显示
    var charEmoji = this._characterEl.querySelector('.sz-easter-love-char-emoji');
    var charName = this._characterEl.querySelector('.sz-easter-love-char-name');
    if (charEmoji) charEmoji.textContent = char.emoji;
    if (charName) charName.textContent = char.name;

    // 更新标签
    var tabs = this.container.querySelectorAll('.sz-easter-char-tab');
    tabs.forEach(function (tab, i) {
      tab.classList.toggle('active', i === idx);
    });

    this._updateCharNameUI();
    this._updateAffectionUI();
    this._showDialog();
  };

  LoveMode.prototype._showAffectionGain = function (amount) {
    var gain = Utils.createEl('div', 'sz-easter-love-affection-gain');
    gain.textContent = '+' + amount + ' 💕';
    this._characterEl.appendChild(gain);

    requestAnimationFrame(function () {
      gain.style.transition = 'all 1s ease-out';
      gain.style.transform = 'translateY(-40px)';
      gain.style.opacity = '0';
    });

    setTimeout(function () {
      if (gain.parentNode) gain.parentNode.removeChild(gain);
    }, 1000);
  };

  LoveMode.prototype._showEnding = function () {
    this._phase = 'ending';
    var char = this._characters[this._currentCharIndex];

    var ending = Utils.createEl('div', 'sz-easter-love-ending');
    ending.innerHTML =
      '<div class="sz-easter-ending-card">' +
        '<div class="sz-easter-ending-emoji">' + char.emoji + '</div>' +
        '<h2 class="sz-easter-ending-title">🎉 ' + char.name + '结局达成！</h2>' +
        '<p class="sz-easter-ending-text">恭喜你与' + char.name + '修成正果！</p>' +
        '<p class="sz-easter-ending-subtitle">总得分: ' + this.score + '</p>' +
        '<button class="sz-easter-btn sz-easter-btn-primary">返回</button>' +
      '</div>';

    this.container.appendChild(ending);

    var self = this;
    ending.querySelector('button').onclick = function () {
      ending.remove();
      self._showResult();
    };
  };

  LoveMode.prototype._updateScoreUI = function () {
    // 分数在结局显示
  };

  LoveMode.prototype._updateAffectionUI = function () {
    var char = this._characters[this._currentCharIndex];
    var fill = this.container.querySelector('[data-role="affection-fill"]');
    var text = this.container.querySelector('[data-stat="affection"]');
    var percent = (char.affection / this._maxAffection) * 100;
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = char.affection + '%';
  };

  LoveMode.prototype._updateCharNameUI = function () {
    var char = this._characters[this._currentCharIndex];
    var el = this.container.querySelector('[data-stat="char-name"]');
    if (el) el.textContent = char.name;
  };

  SZ.easterEggs.modes.LoveMode = LoveMode;


  // ============================================================
  //  模式16: 烹饪模式 (CookingMode)
  // ============================================================
  /**
   * 烹饪模式
   * 每道题是一道菜的食材
   * 答对就成功添加食材
   * 连续答对做出美食
   * 美食图鉴收集
   */
  var CookingMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._recipes = [
      { name: '番茄炒蛋', emoji: '🍳', ingredients: 3, difficulty: 1 },
      { name: '红烧肉', emoji: '🥩', ingredients: 5, difficulty: 2 },
      { name: '麻婆豆腐', emoji: '🥘', ingredients: 4, difficulty: 2 },
      { name: '宫保鸡丁', emoji: '🍗', ingredients: 5, difficulty: 3 },
      { name: '鱼香肉丝', emoji: '🥡', ingredients: 5, difficulty: 3 },
      { name: '北京烤鸭', emoji: '🦆', ingredients: 7, difficulty: 4 },
      { name: '佛跳墙', emoji: '🍲', ingredients: 9, difficulty: 5 },
      { name: '满汉全席', emoji: '👨‍🍳', ingredients: 12, difficulty: 5 }
    ];
    this._currentRecipe = null;
    this._currentIngredient = 0;
    this._collectedRecipes = [];
    this._combo = 0;
    this._kitchenEl = null;
    this._plateEl = null;
    this._questionEl = null;
    this._optionsEl = null;
    this._cooking = false;
    this._recipeIndex = 0;
  };

  CookingMode.prototype = Object.create(BaseMode.prototype);
  CookingMode.prototype.constructor = CookingMode;

  CookingMode.displayName = '烹饪模式';
  CookingMode.description = '答对一题加一种食材，凑齐所有食材做出美食，收集你的美食图鉴！';
  CookingMode.icon = '🍳';
  CookingMode.uiClass = 'sz-easter-cooking';

  CookingMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-cooking-header">' +
        '<div class="sz-easter-cooking-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">菜品</span><span class="sz-easter-stat-value" data-stat="recipe">0/8</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">连击</span><span class="sz-easter-stat-value" data-stat="combo">0</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-cooking-main">' +
        '<div class="sz-easter-cooking-kitchen">' +
          '<div class="sz-easter-cooking-recipe-info">' +
            '<div class="sz-easter-recipe-name" data-role="recipe-name">准备中...</div>' +
            '<div class="sz-easter-recipe-progress">' +
              '<span data-role="ingredient-count">0</span> / <span data-role="ingredient-total">0</span> 食材' +
            '</div>' +
          '</div>' +
          '<div class="sz-easter-cooking-plate" data-role="plate">' +
            '<div class="sz-easter-cooking-plate-emoji">🍽️</div>' +
            '<div class="sz-easter-cooking-ingredients" data-role="ingredients"></div>' +
          '</div>' +
          '<div class="sz-easter-cooking-stove">🔥</div>' +
        '</div>' +
        '<div class="sz-easter-cooking-question-area">' +
          '<div class="sz-easter-cooking-question-title">🥄 添加食材 - 答对即可加入！</div>' +
          '<div class="sz-easter-cooking-question" data-role="question"></div>' +
          '<div class="sz-easter-cooking-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-cooking-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-cookbook" data-action="cookbook">📖 美食图鉴</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出厨房</button>' +
      '</div>';

    this._plateEl = this.container.querySelector('[data-role="plate"]');
    this._ingredientsEl = this.container.querySelector('[data-role="ingredients"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._startNewRecipe();
  };

  CookingMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var cookbookBtn = this.container.querySelector('[data-action="cookbook"]');
    if (cookbookBtn) {
      this._addEventListener(cookbookBtn, 'click', function () {
        self._showCookbook();
      });
    }
  };

  CookingMode.prototype._startNewRecipe = function () {
    var availableRecipes = this._recipes.filter(function (r) {
      return r.difficulty <= Math.ceil(this._recipeIndex / 2) + 1;
    }.bind(this));

    this._currentRecipe = availableRecipes[this._recipeIndex % availableRecipes.length];
    this._currentIngredient = 0;

    // 更新UI
    var nameEl = this.container.querySelector('[data-role="recipe-name"]');
    var totalEl = this.container.querySelector('[data-role="ingredient-total"]');
    if (nameEl) nameEl.textContent = '正在制作: ' + this._currentRecipe.name;
    if (totalEl) totalEl.textContent = this._currentRecipe.ingredients;

    this._ingredientsEl.innerHTML = '';
    this._updateIngredientCount();

    this._loadNextQuestion();
  };

  CookingMode.prototype._loadNextQuestion = function () {
    this.currentQuestion = this._getNextQuestion(this._currentRecipe.difficulty);
    this._questionEl.textContent = '第 ' + (this._currentIngredient + 1) + ' 种食材: ' + this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-cooking-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  CookingMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-cooking-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      this._combo++;
      this._addIngredient();
      this._addScore(10 + this._combo * 2);
      Utils.playSound('correct');
    } else {
      this._combo = 0;
      // 食材掉落
      this._spillIngredient();
      Utils.playSound('wrong');
    }

    this._updateComboUI();

    var self = this;
    this._setTimeout(function () {
      if (self._currentIngredient >= self._currentRecipe.ingredients) {
        self._finishRecipe();
      } else {
        self._loadNextQuestion();
      }
    }, 800);
  };

  CookingMode.prototype._addIngredient = function () {
    this._currentIngredient++;
    this._updateIngredientCount();

    var foodEmojis = ['🥕', '🥔', '🧅', '🍅', '🥚', '🧄', '🌶️', '🫑', '🧈', '🥩', '🐟', '🦐'];
    var ingredient = Utils.createEl('div', 'sz-easter-cooking-ingredient', this._ingredientsEl);
    ingredient.textContent = foodEmojis[this._currentIngredient % foodEmojis.length];
    ingredient.style.animationDelay = '0s';

    // 飞入动画
    ingredient.style.transform = 'translateY(-50px) scale(0)';
    requestAnimationFrame(function () {
      ingredient.style.transition = 'all 0.3s ease-out';
      ingredient.style.transform = 'translateY(0) scale(1)';
    });
  };

  CookingMode.prototype._spillIngredient = function () {
    var spill = Utils.createEl('div', 'sz-easter-cooking-spill', this._plateEl);
    spill.textContent = '💦';
    setTimeout(function () {
      if (spill.parentNode) spill.parentNode.removeChild(spill);
    }, 1000);
  };

  CookingMode.prototype._finishRecipe = function () {
    this._collectedRecipes.push(this._currentRecipe);
    this._addScore(50 + this._currentRecipe.difficulty * 20);
    this._recipeIndex++;

    // 完成动画
    var plateEmoji = this._plateEl.querySelector('.sz-easter-cooking-plate-emoji');
    if (plateEmoji) {
      plateEmoji.textContent = this._currentRecipe.emoji;
      plateEmoji.classList.add('sz-easter-dish-ready');
    }

    Utils.playSound('success');

    // 显示完成提示
    var complete = Utils.createEl('div', 'sz-easter-cooking-complete');
    complete.innerHTML =
      '<div class="sz-easter-complete-emoji">' + this._currentRecipe.emoji + '</div>' +
      '<div class="sz-easter-complete-text">' + this._currentRecipe.name + ' 完成！</div>';
    this._plateEl.appendChild(complete);

    var self = this;
    this._setTimeout(function () {
      if (complete.parentNode) complete.remove();
      if (plateEmoji) {
        plateEmoji.classList.remove('sz-easter-dish-ready');
        plateEmoji.textContent = '🍽️';
      }

      if (self._recipeIndex >= self._recipes.length) {
        self._showResult();
      } else {
        self._startNewRecipe();
      }
    }, 2000);

    this._updateRecipeUI();
  };

  CookingMode.prototype._showCookbook = function () {
    var cookbook = Utils.createEl('div', 'sz-easter-cookbook-overlay');
    var html = '<div class="sz-easter-cookbook"><h3>📖 美食图鉴</h3><div class="sz-easter-cookbook-grid">';

    this._recipes.forEach(function (recipe) {
      var collected = this._collectedRecipes.some(function (r) { return r.name === recipe.name; });
      html +=
        '<div class="sz-easter-cookbook-item ' + (collected ? 'collected' : 'locked') + '">' +
          '<div class="sz-easter-cookbook-emoji">' + (collected ? recipe.emoji : '❓') + '</div>' +
          '<div class="sz-easter-cookbook-name">' + (collected ? recipe.name : '???') + '</div>' +
          '<div class="sz-easter-cookbook-difficulty">' + '⭐'.repeat(recipe.difficulty) + '</div>' +
        '</div>';
    }.bind(this));

    html += '</div><button class="sz-easter-btn sz-easter-btn-primary">关闭</button></div>';
    cookbook.innerHTML = html;
    this.container.appendChild(cookbook);

    cookbook.querySelector('button').onclick = function () {
      cookbook.remove();
    };
  };

  CookingMode.prototype._updateIngredientCount = function () {
    var el = this.container.querySelector('[data-role="ingredient-count"]');
    if (el) el.textContent = this._currentIngredient;
  };

  CookingMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  CookingMode.prototype._updateRecipeUI = function () {
    var el = this.container.querySelector('[data-stat="recipe"]');
    if (el) el.textContent = Math.min(this._recipeIndex, this._recipes.length) + '/' + this._recipes.length;
  };

  CookingMode.prototype._updateComboUI = function () {
    var el = this.container.querySelector('[data-stat="combo"]');
    if (el) el.textContent = this._combo;
  };

  SZ.easterEggs.modes.CookingMode = CookingMode;


  // ============================================================
  //  模式17: 修仙模式 (CultivationMode)
  // ============================================================
  /**
   * 修仙模式
   * 答题获取修为
   * 境界系统（炼气→筑基→金丹→元婴→化神→渡劫→大乘）
   * 雷劫（随机难题考验）
   * 功法技能树
   */
  var CultivationMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._cultivation = 0;
    this._realmIndex = 0;
    this._realms = [
      { name: '炼气期', minCultivation: 0, color: '#90EE90' },
      { name: '筑基期', minCultivation: 100, color: '#87CEEB' },
      { name: '金丹期', minCultivation: 300, color: '#FFD700' },
      { name: '元婴期', minCultivation: 700, color: '#DDA0DD' },
      { name: '化神期', minCultivation: 1500, color: '#FF6347' },
      { name: '渡劫期', minCultivation: 3000, color: '#9932CC' },
      { name: '大乘期', minCultivation: 6000, color: '#FFD700' }
    ];
    this._skills = {
      insight: { level: 0, name: '顿悟', desc: '答题额外修为+10%' },
      fortitude: { level: 0, name: '坚韧', desc: '答错减少修为-20%' },
      wisdom: { level: 0, name: '智慧', desc: '基础修为+5/题' },
      speed: { level: 0, name: '神速', desc: '连击奖励+50%' }
    };
    this._skillPoints = 0;
    this._tribuneActive = false;
    this._tribuneTimer = 0;
    this._combo = 0;
    this._questionEl = null;
    this._optionsEl = null;
  };

  CultivationMode.prototype = Object.create(BaseMode.prototype);
  CultivationMode.prototype.constructor = CultivationMode;

  CultivationMode.displayName = '修仙模式';
  CultivationMode.description = '答题积累修为，突破境界，度过雷劫，踏上修仙巅峰！';
  CultivationMode.icon = '🧘';
  CultivationMode.uiClass = 'sz-easter-cultivation';

  CultivationMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-cultivation-header">' +
        '<div class="sz-easter-cultivation-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">修为</span><span class="sz-easter-stat-value" data-stat="cultivation">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">境界</span><span class="sz-easter-stat-value" data-stat="realm">炼气期</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">道点</span><span class="sz-easter-stat-value" data-stat="skillpoints">0</span></div>' +
        '</div>' +
        '<div class="sz-easter-cultivation-realm-bar">' +
          '<div class="sz-easter-realm-fill" data-role="realm-fill" style="width:0%"></div>' +
          '<span class="sz-easter-realm-text" data-role="realm-progress">0/100</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-cultivation-main">' +
        '<div class="sz-easter-cultivation-scene">' +
          '<div class="sz-easter-cultivation-mountain">⛰️</div>' +
          '<div class="sz-easter-cultivation-monk">🧘</div>' +
          '<div class="sz-easter-cultivation-clouds">☁️☁️☁️</div>' +
          '<div class="sz-easter-cultivation-tribune" data-role="tribune" style="display:none">⚡雷劫⚡</div>' +
        '</div>' +
        '<div class="sz-easter-cultivation-question-area">' +
          '<div class="sz-easter-cultivation-question" data-role="question"></div>' +
          '<div class="sz-easter-cultivation-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-cultivation-footer">' +
        '<button class="sz-easter-btn sz-easter-btn-skills" data-action="skills">📜 功法技能</button>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出修炼</button>' +
      '</div>';

    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');
    this._tribuneEl = this.container.querySelector('[data-role="tribune"]');

    this._loadNextQuestion();
    this._startTribuneCheck();
  };

  CultivationMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    var skillsBtn = this.container.querySelector('[data-action="skills"]');
    if (skillsBtn) {
      this._addEventListener(skillsBtn, 'click', function () {
        self._showSkillTree();
      });
    }
  };

  CultivationMode.prototype._loadNextQuestion = function () {
    var difficulty = this._realmIndex + 1;
    if (this._tribuneActive) difficulty += 2;

    this.currentQuestion = this._getNextQuestion(difficulty);
    this._questionEl.textContent = (this._tribuneActive ? '⚡【雷劫考验】⚡ ' : '') + this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-cultivation-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  CultivationMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-cultivation-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    if (correct) {
      this._combo++;
      var baseGain = 10 + this._skills.wisdom.level * 5;
      var insightBonus = 1 + this._skills.insight.level * 0.1;
      var comboBonus = 1 + (Math.floor(this._combo / 3) * 0.1) * (1 + this._skills.speed.level * 0.5);
      var tribuneMultiplier = this._tribuneActive ? 2 : 1;

      var gain = Math.floor(baseGain * insightBonus * comboBonus * tribuneMultiplier);
      this._addCultivation(gain);
      this._addScore(gain);

      if (this._combo % 5 === 0) {
        this._skillPoints++;
        this._updateSkillPointsUI();
      }

      Utils.playSound('correct');

      if (this._tribuneActive) {
        this._tribuneProgress++;
        if (this._tribuneProgress >= this._tribuneTotal) {
          this._endTribune(true);
        }
      }
    } else {
      this._combo = 0;
      var loss = 5 * (1 - this._skills.fortitude.level * 0.2);
      this._cultivation = Math.max(0, this._cultivation - loss);
      this._updateCultivationUI();
      Utils.playSound('wrong');

      if (this._tribuneActive) {
        this._tribuneFails++;
        if (this._tribuneFails >= 3) {
          this._endTribune(false);
        }
      }
    }

    var self = this;
    this._setTimeout(function () {
      if (self.questionCount >= 30) {
        self._showResult();
      } else {
        self._loadNextQuestion();
      }
    }, 800);
  };

  CultivationMode.prototype._addCultivation = function (amount) {
    var prevRealm = this._realmIndex;
    this._cultivation += amount;

    // 检查突破
    for (var i = this._realms.length - 1; i >= 0; i--) {
      if (this._cultivation >= this._realms[i].minCultivation) {
        this._realmIndex = i;
        break;
      }
    }

    if (this._realmIndex > prevRealm) {
      this._onBreakthrough();
    }

    this._updateCultivationUI();
  };

  CultivationMode.prototype._onBreakthrough = function () {
    Utils.playSound('levelup');

    var bt = Utils.createEl('div', 'sz-easter-breakthrough-effect');
    bt.textContent = '🎉 突破！' + this._realms[this._realmIndex].name + ' 🎉';
    this.container.appendChild(bt);

    var self = this;
    setTimeout(function () {
      if (bt.parentNode) bt.parentNode.removeChild(bt);
    }, 2000);

    this._updateRealmUI();
  };

  CultivationMode.prototype._startTribuneCheck = function () {
    var self = this;
    this._tribuneCheckInterval = this._setInterval(function () {
      if (!self.isRunning) return;
      if (self._tribuneActive) return;

      // 金丹期及以上有概率触发雷劫
      if (self._realmIndex >= 2 && Math.random() < 0.05) {
        self._startTribune();
      }
    }, 10000);
  };

  CultivationMode.prototype._startTribune = function () {
    this._tribuneActive = true;
    this._tribuneProgress = 0;
    this._tribuneTotal = 3 + this._realmIndex;
    this._tribuneFails = 0;

    if (this._tribuneEl) {
      this._tribuneEl.style.display = 'block';
    }

    Utils.playSound('explode');

    // 屏幕闪烁
    this.container.classList.add('sz-easter-tribune-flash');
    var self = this;
    setTimeout(function () {
      if (self.container) self.container.classList.remove('sz-easter-tribune-flash');
    }, 500);
  };

  CultivationMode.prototype._endTribune = function (success) {
    this._tribuneActive = false;

    if (this._tribuneEl) {
      this._tribuneEl.style.display = 'none';
    }

    if (success) {
      var reward = 100 * (this._realmIndex + 1);
      this._addCultivation(reward);
      this._addScore(reward);
      this._skillPoints += 2;
      this._updateSkillPointsUI();
      Utils.playSound('success');
    } else {
      var penalty = Math.floor(this._cultivation * 0.1);
      this._cultivation = Math.max(0, this._cultivation - penalty);
      this._updateCultivationUI();
      Utils.playSound('wrong');
    }
  };

  CultivationMode.prototype._showSkillTree = function () {
    var overlay = Utils.createEl('div', 'sz-easter-skills-overlay');
    var html = '<div class="sz-easter-skills-panel"><h3>📜 功法技能树</h3>';
    html += '<p>道点: ' + this._skillPoints + ' (每5连击获得1点)</p>';
    html += '<div class="sz-easter-skills-list">';

    var self = this;
    for (var key in this._skills) {
      if (this._skills.hasOwnProperty(key)) {
        var skill = this._skills[key];
        html +=
          '<div class="sz-easter-skill-item" data-skill="' + key + '">' +
            '<div class="sz-easter-skill-name">' + skill.name + ' Lv.' + skill.level + '</div>' +
            '<div class="sz-easter-skill-desc">' + skill.desc + '</div>' +
            '<button class="sz-easter-btn sz-easter-btn-small" data-upgrade="' + key + '">升级 (1道点)</button>' +
          '</div>';
      }
    }

    html += '</div><button class="sz-easter-btn sz-easter-btn-primary" data-close-skills>关闭</button></div>';
    overlay.innerHTML = html;
    this.container.appendChild(overlay);

    overlay.querySelector('[data-close-skills]').onclick = function () {
      overlay.remove();
    };

    overlay.querySelectorAll('[data-upgrade]').forEach(function (btn) {
      btn.onclick = function () {
        var skillKey = btn.getAttribute('data-upgrade');
        if (self._skillPoints > 0 && self._skills[skillKey].level < 5) {
          self._skillPoints--;
          self._skills[skillKey].level++;
          self._updateSkillPointsUI();
          overlay.remove();
          self._showSkillTree();
        }
      };
    });
  };

  CultivationMode.prototype._updateCultivationUI = function () {
    var el = this.container.querySelector('[data-stat="cultivation"]');
    if (el) el.textContent = Math.floor(this._cultivation);

    // 进度条
    var currentRealm = this._realms[this._realmIndex];
    var nextRealm = this._realms[this._realmIndex + 1];
    var fill = this.container.querySelector('[data-role="realm-fill"]');
    var text = this.container.querySelector('[data-role="realm-progress"]');

    if (fill && text) {
      if (nextRealm) {
        var progress = this._cultivation - currentRealm.minCultivation;
        var needed = nextRealm.minCultivation - currentRealm.minCultivation;
        var percent = Math.min(100, (progress / needed) * 100);
        fill.style.width = percent + '%';
        text.textContent = Math.floor(progress) + '/' + needed;
      } else {
        fill.style.width = '100%';
        text.textContent = '已达巅峰';
      }
      fill.style.background = currentRealm.color;
    }
  };

  CultivationMode.prototype._updateRealmUI = function () {
    var el = this.container.querySelector('[data-stat="realm"]');
    if (el) el.textContent = this._realms[this._realmIndex].name;
  };

  CultivationMode.prototype._updateSkillPointsUI = function () {
    var el = this.container.querySelector('[data-stat="skillpoints"]');
    if (el) el.textContent = this._skillPoints;
  };

  CultivationMode.prototype._updateScoreUI = function () {
    // 分数通过修为体现
  };

  CultivationMode.prototype.stop = function () {
    BaseMode.prototype.stop.call(this);
    if (this._tribuneCheckInterval) clearInterval(this._tribuneCheckInterval);
  };

  SZ.easterEggs.modes.CultivationMode = CultivationMode;


  // ============================================================
  //  模式18: 股市模式 (StockMode)
  // ============================================================
  /**
   * 股市模式
   * 用虚拟资金炒股
   * 答对题目获得"牛市"（股价涨）
   * 答错"熊市"（股价跌）
   * 看谁最终资产最多
   */
  var StockMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._money = 10000;
    this._initialMoney = 10000;
    this._stocks = [
      { id: 'TECH', name: '科技股', price: 100, basePrice: 100, volatility: 0.1 },
      { id: 'FIN', name: '金融股', price: 80, basePrice: 80, volatility: 0.05 },
      { id: 'MED', name: '医药股', price: 120, basePrice: 120, volatility: 0.08 },
      { id: 'CONS', name: '消费股', price: 60, basePrice: 60, volatility: 0.06 }
    ];
    this._portfolio = {}; // { stockId: shares }
    this._day = 1;
    this._maxDays = 20;
    this._marketTrend = 0; // 正为牛市，负为熊市
    this._chartEl = null;
    this._priceHistory = {};
  };

  StockMode.prototype = Object.create(BaseMode.prototype);
  StockMode.prototype.constructor = StockMode;

  StockMode.displayName = '股市模式';
  StockMode.description = '用虚拟资金炒股！答对迎来牛市，答错遭遇熊市，看谁资产最多！';
  StockMode.icon = '📈';
  StockMode.uiClass = 'sz-easter-stock';

  StockMode.prototype._render = function () {
    // 初始化持仓和价格历史
    var self = this;
    this._stocks.forEach(function (s) {
      self._portfolio[s.id] = 0;
      self._priceHistory[s.id] = [s.price];
    });

    this.container.innerHTML =
      '<div class="sz-easter-stock-header">' +
        '<div class="sz-easter-stock-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">资金</span><span class="sz-easter-stat-value" data-stat="money">¥10,000</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">总资产</span><span class="sz-easter-stat-value" data-stat="total">¥10,000</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">天数</span><span class="sz-easter-stat-value" data-stat="day">第1天</span></div>' +
        '</div>' +
        '<div class="sz-easter-stock-market-trend" data-role="trend">' +
          '<span class="sz-easter-trend-icon">📊</span>' +
          '<span class="sz-easter-trend-text">市场平稳</span>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-stock-main">' +
        '<div class="sz-easter-stock-market">' +
          '<div class="sz-easter-stock-list" data-role="stock-list"></div>' +
        '</div>' +
        '<div class="sz-easter-stock-question-area">' +
          '<div class="sz-easter-stock-question-title">📊 答题影响市场走势！</div>' +
          '<div class="sz-easter-stock-question" data-role="question"></div>' +
          '<div class="sz-easter-stock-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-stock-footer">' +
        '<div class="sz-easter-stock-hint">答对→牛市📈 答错→熊市📉 把握时机交易！</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出股市</button>' +
      '</div>';

    this._stockListEl = this.container.querySelector('[data-role="stock-list"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._renderStockList();
    this._loadNextQuestion();
  };

  StockMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }
  };

  StockMode.prototype._renderStockList = function () {
    var self = this;
    this._stockListEl.innerHTML = '';

    this._stocks.forEach(function (stock) {
      var shares = self._portfolio[stock.id] || 0;
      var stockValue = shares * stock.price;
      var change = stock.price - stock.basePrice;
      var changePercent = (change / stock.basePrice * 100).toFixed(2);
      var isUp = change >= 0;

      var item = Utils.createEl('div', 'sz-easter-stock-item', self._stockListEl);
      item.innerHTML =
        '<div class="sz-easter-stock-info">' +
          '<div class="sz-easter-stock-name">' + stock.name + ' (' + stock.id + ')</div>' +
          '<div class="sz-easter-stock-price ' + (isUp ? 'sz-easter-up' : 'sz-easter-down') + '">' +
            '¥' + stock.price.toFixed(2) +
            ' <span class="sz-easter-stock-change">' + (isUp ? '+' : '') + changePercent + '%</span>' +
          '</div>' +
        '</div>' +
        '<div class="sz-easter-stock-holding">' +
          '<div class="sz-easter-stock-shares">持有: ' + shares + '股</div>' +
          '<div class="sz-easter-stock-value">市值: ¥' + stockValue.toFixed(2) + '</div>' +
          '<div class="sz-easter-stock-actions">' +
            '<button class="sz-easter-btn sz-easter-btn-small" data-buy="' + stock.id + '">买入</button>' +
            '<button class="sz-easter-btn sz-easter-btn-small" data-sell="' + stock.id + '">卖出</button>' +
          '</div>' +
        '</div>';

      item.querySelector('[data-buy="' + stock.id + '"]').onclick = function () {
        self._buyStock(stock.id);
      };

      item.querySelector('[data-sell="' + stock.id + '"]').onclick = function () {
        self._sellStock(stock.id);
      };
    });

    this._updateTotalAssetsUI();
  };

  StockMode.prototype._buyStock = function (stockId) {
    var stock = this._stocks.find(function (s) { return s.id === stockId; });
    if (!stock) return;

    var maxShares = Math.floor(this._money / stock.price);
    if (maxShares <= 0) return;

    var buyAmount = Math.min(maxShares, 10); // 每次最多买10股
    var cost = buyAmount * stock.price;

    this._money -= cost;
    this._portfolio[stockId] += buyAmount;

    this._renderStockList();
    this._updateMoneyUI();
    Utils.playSound('coin');
  };

  StockMode.prototype._sellStock = function (stockId) {
    var stock = this._stocks.find(function (s) { return s.id === stockId; });
    if (!stock) return;

    var shares = this._portfolio[stockId] || 0;
    if (shares <= 0) return;

    var sellAmount = Math.min(shares, 10);
    var revenue = sellAmount * stock.price;

    this._money += revenue;
    this._portfolio[stockId] -= sellAmount;

    this._renderStockList();
    this._updateMoneyUI();
    Utils.playSound('coin');
  };

  StockMode.prototype._loadNextQuestion = function () {
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = '第 ' + this._day + ' 天 - ' + this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-stock-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });
  };

  StockMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-stock-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    // 市场反应
    if (correct) {
      this._marketTrend = 0.05 + Math.random() * 0.05; // 牛市
      this._showMarketTrend(true);
      Utils.playSound('correct');
    } else {
      this._marketTrend = -0.05 - Math.random() * 0.05; // 熊市
      this._showMarketTrend(false);
      Utils.playSound('wrong');
    }

    // 更新股价
    this._updateStockPrices();

    // 下一天
    this._day++;
    this._updateDayUI();

    var self = this;
    this._setTimeout(function () {
      if (self._day > self._maxDays) {
        self._showResult();
      } else {
        self._loadNextQuestion();
      }
    }, 1000);
  };

  StockMode.prototype._updateStockPrices = function () {
    var self = this;
    this._stocks.forEach(function (stock) {
      var change = self._marketTrend + (Math.random() - 0.5) * stock.volatility;
      stock.price = Math.max(1, stock.price * (1 + change));
      self._priceHistory[stock.id].push(stock.price);
    });

    this._renderStockList();
  };

  StockMode.prototype._showMarketTrend = function (isBull) {
    var trendEl = this.container.querySelector('[data-role="trend"]');
    if (trendEl) {
      var icon = trendEl.querySelector('.sz-easter-trend-icon');
      var text = trendEl.querySelector('.sz-easter-trend-text');
      if (isBull) {
        icon.textContent = '📈';
        text.textContent = '牛市来了！';
        trendEl.classList.add('sz-easter-trend-bull');
        trendEl.classList.remove('sz-easter-trend-bear');
      } else {
        icon.textContent = '📉';
        text.textContent = '熊市来袭...';
        trendEl.classList.add('sz-easter-trend-bear');
        trendEl.classList.remove('sz-easter-trend-bull');
      }
    }
  };

  StockMode.prototype._getTotalAssets = function () {
    var total = this._money;
    var self = this;
    this._stocks.forEach(function (stock) {
      total += (self._portfolio[stock.id] || 0) * stock.price;
    });
    return total;
  };

  StockMode.prototype._updateMoneyUI = function () {
    var el = this.container.querySelector('[data-stat="money"]');
    if (el) el.textContent = '¥' + this._money.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  StockMode.prototype._updateTotalAssetsUI = function () {
    var el = this.container.querySelector('[data-stat="total"]');
    if (el) {
      var total = this._getTotalAssets();
      el.textContent = '¥' + total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  StockMode.prototype._updateDayUI = function () {
    var el = this.container.querySelector('[data-stat="day"]');
    if (el) el.textContent = '第' + Math.min(this._day, this._maxDays) + '天';
  };

  StockMode.prototype._updateScoreUI = function () {
    // 分数即总资产
    this.score = Math.floor(this._getTotalAssets());
  };

  SZ.easterEggs.modes.StockMode = StockMode;


  // ============================================================
  //  模式19: 迷宫模式 (MazeMode)
  // ============================================================
  /**
   * 迷宫模式
   * 在迷宫中探索
   * 每个路口有一道题
   * 答对走对路，答错走死路
   * 找到出口算胜利
   */
  var MazeMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._mazeSize = 7;
    this._maze = [];
    this._playerPos = { x: 0, y: 0 };
    this._exitPos = { x: 0, y: 0 };
    this._visited = {};
    this._mazeEl = null;
    this._questionEl = null;
    this._optionsEl = null;
    this._questionModal = null;
    this._pendingDirection = null;
    this._steps = 0;
    this._mazesCompleted = 0;
    this._totalMazes = 5;
  };

  MazeMode.prototype = Object.create(BaseMode.prototype);
  MazeMode.prototype.constructor = MazeMode;

  MazeMode.displayName = '迷宫模式';
  MazeMode.description = '探索迷宫，每个路口都有题目，答对才能走对路，找到出口！';
  MazeMode.icon = '🌀';
  MazeMode.uiClass = 'sz-easter-maze';

  MazeMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-maze-header">' +
        '<div class="sz-easter-maze-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">迷宫</span><span class="sz-easter-stat-value" data-stat="maze">1/5</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">步数</span><span class="sz-easter-stat-value" data-stat="steps">0</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-maze-main">' +
        '<div class="sz-easter-maze-container">' +
          '<div class="sz-easter-maze-grid" data-role="maze"></div>' +
          '<div class="sz-easter-maze-legend">' +
            '<span>🧑 你</span>' +
            '<span>🚪 出口</span>' +
            '<span>⬛ 墙壁</span>' +
          '</div>' +
        '</div>' +
        '<div class="sz-easter-maze-controls">' +
          '<div class="sz-easter-maze-dir-row">' +
            '<button class="sz-easter-dir-btn" data-dir="up">⬆️</button>' +
          '</div>' +
          '<div class="sz-easter-maze-dir-row">' +
            '<button class="sz-easter-dir-btn" data-dir="left">⬅️</button>' +
            '<button class="sz-easter-dir-btn" data-dir="down">⬇️</button>' +
            '<button class="sz-easter-dir-btn" data-dir="right">➡️</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-maze-question-modal" data-role="question-modal" style="display:none">' +
        '<div class="sz-easter-maze-modal-content">' +
          '<div class="sz-easter-maze-modal-title">🚧 前方路口，答题决定方向！</div>' +
          '<div class="sz-easter-maze-modal-question" data-role="question"></div>' +
          '<div class="sz-easter-maze-modal-options" data-role="options"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-maze-footer">' +
        '<div class="sz-easter-maze-hint">方向键或WASD移动，路口需要答题</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">退出</button>' +
      '</div>';

    this._mazeEl = this.container.querySelector('[data-role="maze"]');
    this._questionModal = this.container.querySelector('[data-role="question-modal"]');
    this._questionEl = this.container.querySelector('[data-role="question"]');
    this._optionsEl = this.container.querySelector('[data-role="options"]');

    this._generateMaze();
    this._renderMaze();
  };

  MazeMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 方向按钮
    var dirBtns = this.container.querySelectorAll('[data-dir]');
    dirBtns.forEach(function (btn) {
      self._addEventListener(btn, 'click', function () {
        var dir = btn.getAttribute('data-dir');
        self._tryMove(dir);
      });
    });

    // 键盘控制
    this._addEventListener(document, 'keydown', function (e) {
      if (!self.isRunning) return;
      var keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
      };
      if (keyMap[e.code]) {
        e.preventDefault();
        self._tryMove(keyMap[e.code]);
      }
    });
  };

  MazeMode.prototype._generateMaze = function () {
    var size = this._mazeSize;
    // 初始化全是墙
    this._maze = [];
    for (var y = 0; y < size; y++) {
      this._maze[y] = [];
      for (var x = 0; x < size; x++) {
        this._maze[y][x] = 1; // 墙
      }
    }

    // 使用递归回溯法生成迷宫
    var self = this;
    function carve(x, y) {
      self._maze[y][x] = 0; // 通道

      var directions = Utils.shuffle(['up', 'down', 'left', 'right']);
      directions.forEach(function (dir) {
        var nx = x, ny = y;
        if (dir === 'up') ny -= 2;
        if (dir === 'down') ny += 2;
        if (dir === 'left') nx -= 2;
        if (dir === 'right') nx += 2;

        if (nx >= 0 && nx < size && ny >= 0 && ny < size && self._maze[ny][nx] === 1) {
          // 打通中间的墙
          self._maze[Math.floor((y + ny) / 2)][Math.floor((x + nx) / 2)] = 0;
          carve(nx, ny);
        }
      });
    }

    // 从左上角开始
    carve(0, 0);

    // 玩家位置
    this._playerPos = { x: 0, y: 0 };

    // 出口在右下角
    this._exitPos = { x: size - 1, y: size - 1 };
    this._maze[size - 1][size - 1] = 0;

    // 确保出口可达（简单处理：打通右下区域）
    if (size >= 3) {
      this._maze[size - 1][size - 2] = 0;
      this._maze[size - 2][size - 1] = 0;
    }

    this._visited = {};
    this._steps = 0;
  };

  MazeMode.prototype._renderMaze = function () {
    this._mazeEl.innerHTML = '';
    this._mazeEl.style.gridTemplateColumns = 'repeat(' + this._mazeSize + ', 1fr)';

    for (var y = 0; y < this._mazeSize; y++) {
      for (var x = 0; x < this._mazeSize; x++) {
        var cell = Utils.createEl('div', 'sz-easter-maze-cell', this._mazeEl);
        cell.setAttribute('data-x', x);
        cell.setAttribute('data-y', y);

        if (this._maze[y][x] === 1) {
          cell.classList.add('sz-easter-maze-wall');
        } else {
          cell.classList.add('sz-easter-maze-path');
        }

        if (x === this._playerPos.x && y === this._playerPos.y) {
          cell.classList.add('sz-easter-maze-player');
          cell.textContent = '🧑';
        }

        if (x === this._exitPos.x && y === this._exitPos.y) {
          cell.classList.add('sz-easter-maze-exit');
          if (!(x === this._playerPos.x && y === this._playerPos.y)) {
            cell.textContent = '🚪';
          }
        }

        var key = x + ',' + y;
        if (this._visited[key]) {
          cell.classList.add('sz-easter-maze-visited');
        }
      }
    }
  };

  MazeMode.prototype._tryMove = function (direction) {
    if (this._questionModal.style.display === 'flex') return;

    var dx = 0, dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    var newX = this._playerPos.x + dx;
    var newY = this._playerPos.y + dy;

    // 边界检查
    if (newX < 0 || newX >= this._mazeSize || newY < 0 || newY >= this._mazeSize) {
      return;
    }

    // 墙壁检查
    if (this._maze[newY][newX] === 1) {
      return;
    }

    // 未访问的格子需要答题
    var key = newX + ',' + newY;
    if (!this._visited[key] && this._isIntersection(newX, newY)) {
      this._pendingDirection = { x: newX, y: newY };
      this._showQuestion(direction);
      return;
    }

    // 直接移动
    this._movePlayer(newX, newY);
  };

  MazeMode.prototype._isIntersection = function (x, y) {
    // 判断是否是路口（有多个可选方向）
    var paths = 0;
    var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (var i = 0; i < dirs.length; i++) {
      var nx = x + dirs[i][0];
      var ny = y + dirs[i][1];
      if (nx >= 0 && nx < this._mazeSize && ny >= 0 && ny < this._mazeSize && this._maze[ny][nx] === 0) {
        paths++;
      }
    }
    return paths >= 2; // 至少两条路才算路口
  };

  MazeMode.prototype._showQuestion = function (direction) {
    this.currentQuestion = this._getNextQuestion(this.level);
    this._questionEl.textContent = this.currentQuestion.question;
    this._optionsEl.innerHTML = '';

    var self = this;
    this.currentQuestion.options.forEach(function (opt, idx) {
      var btn = Utils.createEl('div', 'sz-easter-maze-option', self._optionsEl);
      btn.setAttribute('data-index', idx);
      btn.innerHTML =
        '<span class="sz-easter-option-letter">' + String.fromCharCode(65 + idx) + '</span>' +
        '<span class="sz-easter-option-text">' + opt + '</span>';

      btn.onclick = function () {
        self._submitAnswer(idx);
      };
    });

    this._questionModal.style.display = 'flex';
  };

  MazeMode.prototype._submitAnswer = function (answerIdx) {
    var correct = this._checkAnswer(this.currentQuestion, answerIdx);
    var optionBtns = this._optionsEl.querySelectorAll('.sz-easter-maze-option');

    optionBtns.forEach(function (btn, idx) {
      btn.classList.add(idx === answerIdx ? 'sz-easter-selected' : 'sz-easter-dimmed');
      if (idx === this.currentQuestion.answer) btn.classList.add('sz-easter-correct');
      if (idx === answerIdx && !correct) btn.classList.add('sz-easter-wrong');
    }.bind(this));

    var self = this;
    this._setTimeout(function () {
      self._questionModal.style.display = 'none';

      if (correct) {
        // 答对，移动到目标位置
        self._movePlayer(self._pendingDirection.x, self._pendingDirection.y);
        self._addScore(15);
        Utils.playSound('correct');
      } else {
        // 答错，原地不动
        Utils.playSound('wrong');
      }

      self._pendingDirection = null;
    }, 800);
  };

  MazeMode.prototype._movePlayer = function (x, y) {
    this._playerPos = { x: x, y: y };
    this._visited[x + ',' + y] = true;
    this._steps++;
    this._updateStepsUI();
    this._renderMaze();

    // 检查是否到达出口
    if (x === this._exitPos.x && y === this._exitPos.y) {
      this._onMazeComplete();
    }
  };

  MazeMode.prototype._onMazeComplete = function () {
    this._mazesCompleted++;
    this._addScore(100 - this._steps); // 步数越少分越高
    Utils.playSound('success');

    var self = this;
    if (this._mazesCompleted >= this._totalMazes) {
      this._setTimeout(function () {
        self._showResult();
      }, 1000);
    } else {
      this._mazeSize = Math.min(11, 7 + this._mazesCompleted);
      this._setTimeout(function () {
        self._generateMaze();
        self._renderMaze();
        self._updateMazeUI();
      }, 1500);
    }
  };

  MazeMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = Math.max(0, this.score);
  };

  MazeMode.prototype._updateStepsUI = function () {
    var el = this.container.querySelector('[data-stat="steps"]');
    if (el) el.textContent = this._steps;
  };

  MazeMode.prototype._updateMazeUI = function () {
    var el = this.container.querySelector('[data-stat="maze"]');
    if (el) el.textContent = (this._mazesCompleted + 1) + '/' + this._totalMazes;
  };

  SZ.easterEggs.modes.MazeMode = MazeMode;


  // ============================================================
  //  模式20: 黑客模式 (HackerMode)
  // ============================================================
  /**
   * 黑客模式
   * 绿色终端风格
   * 题目以代码/加密形式出现
   * 需要"破解"（解答）题目
   * 打字输入答案
   * 进度条像黑客入侵
   */
  var HackerMode = function (container, options) {
    BaseMode.call(this, container, options);
    this._hackProgress = 0;
    this._targetProgress = 100;
    this._terminalLines = [];
    this._terminalEl = null;
    this._inputEl = null;
    this._currentCipher = '';
    this._currentAnswer = '';
    this._hacksCompleted = 0;
    this._totalHacks = 10;
    this._difficulty = 1;
    this._cipherTypes = ['reverse', 'caesar', 'binary', 'hex', 'base64_fake'];
    this._typingIndex = 0;
    this._hacking = false;
  };

  HackerMode.prototype = Object.create(BaseMode.prototype);
  HackerMode.prototype.constructor = HackerMode;

  HackerMode.displayName = '黑客模式';
  HackerMode.description = '绿色终端风！加密题目等你来破解，输入答案完成入侵，体验当黑客的感觉！';
  HackerMode.icon = '💻';
  HackerMode.uiClass = 'sz-easter-hacker';

  HackerMode.prototype._render = function () {
    this.container.innerHTML =
      '<div class="sz-easter-hacker-header">' +
        '<div class="sz-easter-hacker-stats">' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">得分</span><span class="sz-easter-stat-value" data-stat="score">0</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">入侵</span><span class="sz-easter-stat-value" data-stat="hacks">0/10</span></div>' +
          '<div class="sz-easter-stat-item"><span class="sz-easter-stat-label">进度</span><span class="sz-easter-stat-value" data-stat="progress">0%</span></div>' +
        '</div>' +
        '<div class="sz-easter-hacker-progress-bar">' +
          '<div class="sz-easter-hacker-progress-fill" data-role="progress-fill" style="width:0%"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-hacker-main">' +
        '<div class="sz-easter-hacker-terminal" data-role="terminal">' +
          '<div class="sz-easter-hacker-terminal-header">' +
            '<span class="sz-easter-terminal-dot red"></span>' +
            '<span class="sz-easter-terminal-dot yellow"></span>' +
            '<span class="sz-easter-terminal-dot green"></span>' +
            '<span class="sz-easter-terminal-title">root@shuzhuo:~#</span>' +
          '</div>' +
          '<div class="sz-easter-hacker-terminal-body" data-role="terminal-body">' +
            '<div class="sz-easter-terminal-line sz-easter-boot-text">系统启动中...</div>' +
          '</div>' +
          '<div class="sz-easter-hacker-terminal-input">' +
            '<span class="sz-easter-terminal-prompt">root@shuzhuo:~#</span>' +
            '<input type="text" class="sz-easter-terminal-input" data-role="input" placeholder="输入答案...">' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sz-easter-hacker-footer">' +
        '<div class="sz-easter-hacker-hint">输入正确答案完成破解，支持数字和文字答案</div>' +
        '<button class="sz-easter-btn sz-easter-btn-exit" data-action="exit">断开连接</button>' +
      '</div>';

    this._terminalBody = this.container.querySelector('[data-role="terminal-body"]');
    this._inputEl = this.container.querySelector('[data-role="input"]');

    var self = this;
    this._setTimeout(function () {
      self._bootSequence();
    }, 500);
  };

  HackerMode.prototype._bindEvents = function () {
    var self = this;

    var exitBtn = this.container.querySelector('[data-action="exit"]');
    if (exitBtn) {
      this._addEventListener(exitBtn, 'click', function () {
        ModeManager.stopMode();
      });
    }

    // 输入提交
    if (this._inputEl) {
      this._addEventListener(this._inputEl, 'keydown', function (e) {
        if (e.key === 'Enter') {
          self._submitAnswer();
        }
      });
    }
  };

  HackerMode.prototype._bootSequence = function () {
    var self = this;
    var bootLines = [
      '[OK] 初始化网络模块...',
      '[OK] 加载加密算法...',
      '[OK] 建立安全连接...',
      '[OK] 扫描目标系统...',
      '[WARN] 检测到防火墙...',
      '[OK] 绕过防火墙成功...',
      '[SYSTEM] 准备开始破解...'
    ];

    var idx = 0;
    function nextLine() {
      if (idx >= bootLines.length) {
        self._startHack();
        return;
      }
      self._addTerminalLine(bootLines[idx], 'boot');
      idx++;
      setTimeout(nextLine, 200);
    }
    nextLine();
  };

  HackerMode.prototype._addTerminalLine = function (text, type) {
    var line = Utils.createEl('div', 'sz-easter-terminal-line sz-easter-line-' + (type || 'normal'), this._terminalBody);
    line.textContent = text;
    this._terminalBody.scrollTop = this._terminalBody.scrollHeight;
  };

  HackerMode.prototype._startHack = function () {
    this._hacksCompleted = 0;
    this._hackProgress = 0;
    this._nextChallenge();
  };

  HackerMode.prototype._nextChallenge = function () {
    this.currentQuestion = this._getNextQuestion(this._difficulty);
    var correctAnswer = this.currentQuestion.options[this.currentQuestion.answer];

    // 选择加密方式
    var cipherType = this._cipherTypes[this._hacksCompleted % this._cipherTypes.length];
    this._cipherType = cipherType;
    this._currentAnswer = correctAnswer;
    this._encodedAnswer = this._encodeText(correctAnswer, cipherType);

    this._addTerminalLine('>', 'command');
    this._addTerminalLine('[TARGET] 破解目标 #' + (this._hacksCompleted + 1), 'target');
    this._addTerminalLine('[QUESTION] ' + this.currentQuestion.question, 'question');
    this._addTerminalLine('[CIPHER] 加密类型: ' + this._getCipherName(cipherType), 'info');
    this._addTerminalLine('[ENCRYPTED] ' + this._encodedAnswer, 'encrypted');
    this._addTerminalLine('[PROMPT] 输入正确答案破解密码...', 'prompt');

    if (this._inputEl) {
      this._inputEl.value = '';
      this._inputEl.focus();
    }

    // 开始"入侵"进度
    this._hacking = true;
    this._startHackProgress();
  };

  HackerMode.prototype._encodeText = function (text, type) {
    switch (type) {
      case 'reverse':
        return text.split('').reverse().join('');
      case 'caesar':
        // 凯撒密码（位移3）
        return text.split('').map(function (c) {
          if (/[a-zA-Z]/.test(c)) {
            var base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + 3) % 26 + base);
          }
          return c;
        }).join('');
      case 'binary':
        // 简单的二进制表示
        return text.split('').map(function (c) {
          return c.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
      case 'hex':
        return text.split('').map(function (c) {
          return c.charCodeAt(0).toString(16).toUpperCase();
        }).join(' ');
      case 'base64_fake':
        // 伪base64（简单的字符映射）
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var result = '';
        for (var i = 0; i < text.length; i++) {
          result += chars[(text.charCodeAt(i) + i * 7) % chars.length];
        }
        return result + '==';
      default:
        return text;
    }
  };

  HackerMode.prototype._getCipherName = function (type) {
    var names = {
      reverse: '倒序加密',
      caesar: '凯撒密码',
      binary: '二进制编码',
      hex: '十六进制',
      base64_fake: 'Base64编码'
    };
    return names[type] || type;
  };

  HackerMode.prototype._submitAnswer = function () {
    if (!this._hacking || !this._inputEl) return;

    var userAnswer = this._inputEl.value.trim();
    var correctAnswer = this._currentAnswer;

    this._addTerminalLine('root@shuzhuo:~# ' + userAnswer, 'command');

    var correct = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (correct) {
      this._addTerminalLine('[SUCCESS] 破解成功！', 'success');
      this._addTerminalLine('[REWARD] +' + (20 + this._difficulty * 5) + ' 积分', 'success');
      this._addScore(20 + this._difficulty * 5);
      this._hackProgress += 10;
      this._hacksCompleted++;
      Utils.playSound('correct');

      // 难度递增
      if (this._hacksCompleted > 0 && this._hacksCompleted % 3 === 0) {
        this._difficulty++;
      }
    } else {
      this._addTerminalLine('[FAILED] 破解失败，答案错误', 'error');
      this._addTerminalLine('[INFO] 正确答案: ' + correctAnswer, 'info');
      this._hackProgress = Math.max(0, this._hackProgress - 5);
      Utils.playSound('wrong');
    }

    this.questionCount++;
    if (correct) this.correctCount++; else this.wrongCount++;

    this._updateProgressUI();
    this._updateHacksUI();

    var self = this;
    this._setTimeout(function () {
      if (self._hacksCompleted >= self._totalHacks) {
        self._hacking = false;
        self._addTerminalLine('[SYSTEM] 入侵完成！全部目标已破解！', 'success');
        self._addTerminalLine('[FINAL] 总得分: ' + self.score, 'final');
        self._setTimeout(function () {
          self._showResult();
        }, 2000);
      } else {
        self._nextChallenge();
      }
    }, 1000);
  };

  HackerMode.prototype._startHackProgress = function () {
    // 模拟黑客入侵进度条动画
    var self = this;
    var progress = 0;
    var target = this._hackProgress;

    function animate() {
      if (!self._hacking) return;
      progress += 0.5;
      var displayProgress = Math.min(target + Math.sin(progress * 0.1) * 2, 100);
      self._updateProgressFill(displayProgress);
      requestAnimationFrame(animate);
    }
    animate();
  };

  HackerMode.prototype._updateProgressFill = function (percent) {
    var fill = this.container.querySelector('[data-role="progress-fill"]');
    if (fill) fill.style.width = percent + '%';
  };

  HackerMode.prototype._updateScoreUI = function () {
    var el = this.container.querySelector('[data-stat="score"]');
    if (el) el.textContent = this.score;
  };

  HackerMode.prototype._updateProgressUI = function () {
    var el = this.container.querySelector('[data-stat="progress"]');
    if (el) el.textContent = Math.min(100, this._hackProgress) + '%';
    this._updateProgressFill(this._hackProgress);
  };

  HackerMode.prototype._updateHacksUI = function () {
    var el = this.container.querySelector('[data-stat="hacks"]');
    if (el) el.textContent = this._hacksCompleted + '/' + this._totalHacks;
  };

  SZ.easterEggs.modes.HackerMode = HackerMode;


    // ============================================================
  //  成就系统
  // ============================================================
  var AchievementSystem = {
    _achievements: {
      first_easter: {
        id: 'first_easter',
        name: '初次探索',
        description: '首次进入彩蛋模式',
        icon: '🥚',
        unlocked: false
      },
      typewriter_master: {
        id: 'typewriter_master',
        name: '闪电阅读者',
        description: '打字机模式连续答对10题',
        icon: '⚡',
        unlocked: false
      },
      gravity_survivor: {
        id: 'gravity_survivor',
        name: '重力免疫',
        description: '重力模式达到第10关',
        icon: '🪐',
        unlocked: false
      },
      match3_master: {
        id: 'match3_master',
        name: '消消乐达人',
        description: '消消乐模式单次消除10个以上',
        icon: '💎',
        unlocked: false
      },
      parkour_pro: {
        id: 'parkour_pro',
        name: '飞檐走壁',
        description: '跑酷模式跑过1000米',
        icon: '🏃',
        unlocked: false
      },
      whack_champion: {
        id: 'whack_champion',
        name: '地鼠克星',
        description: '打地鼠模式单局50连击',
        icon: '🔨',
        unlocked: false
      },
      memory_genius: {
        id: 'memory_genius',
        name: '过目不忘',
        description: '盲打模式达到第5关',
        icon: '🧠',
        unlocked: false
      },
      reverse_master: {
        id: 'reverse_master',
        name: '逆向思维',
        description: '反向模式连续答对8题',
        icon: '🔄',
        unlocked: false
      },
      linklink_speed: {
        id: 'linklink_speed',
        name: '神之连线',
        description: '连连看模式30秒内完成一轮',
        icon: '🔗',
        unlocked: false
      },
      puzzle_collector: {
        id: 'puzzle_collector',
        name: '拼图大师',
        description: '拼图模式完成全部5张拼图',
        icon: '🧩',
        unlocked: false
      },
      monster_slayer: {
        id: 'monster_slayer',
        name: '屠龙勇士',
        description: '打怪模式击败第一个BOSS',
        icon: '🐉',
        unlocked: false
      },
      space_pilot: {
        id: 'space_pilot',
        name: '太空王牌',
        description: '太空模式击毁20颗行星',
        icon: '🚀',
        unlocked: false
      },
      rhythm_perfect: {
        id: 'rhythm_perfect',
        name: '完美演奏',
        description: '音乐模式达成50连击',
        icon: '🎵',
        unlocked: false
      },
      detective_master: {
        id: 'detective_master',
        name: '名侦探',
        description: '侦探模式达到名侦探等级',
        icon: '🔍',
        unlocked: false
      },
      zombie_survivor: {
        id: 'zombie_survivor',
        name: '末日幸存者',
        description: '末日模式撑过第10波',
        icon: '🧟',
        unlocked: false
      },
      love_all: {
        id: 'love_all',
        name: '后宫王',
        description: '恋爱模式解锁所有角色结局',
        icon: '💕',
        unlocked: false
      },
      cooking_chef: {
        id: 'cooking_chef',
        name: '米其林主厨',
        description: '烹饪模式集齐全部美食图鉴',
        icon: '👨‍🍳',
        unlocked: false
      },
      cultivation_god: {
        id: 'cultivation_god',
        name: '得道成仙',
        description: '修仙模式达到大乘期',
        icon: '🧘',
        unlocked: false
      },
      stock_tycoon: {
        id: 'stock_tycoon',
        name: '股市大亨',
        description: '股市模式资产突破10万',
        icon: '💰',
        unlocked: false
      },
      maze_explorer: {
        id: 'maze_explorer',
        name: '迷宫探险家',
        description: '迷宫模式完成全部5个迷宫',
        icon: '🌀',
        unlocked: false
      },
      hacker_elite: {
        id: 'hacker_elite',
        name: '黑客帝国',
        description: '黑客模式完成全部10次破解',
        icon: '💻',
        unlocked: false
      },
      konami_master: {
        id: 'konami_master',
        name: '科乐美传人',
        description: '使用科乐美秘籍解锁彩蛋模式',
        icon: '🎮',
        unlocked: false
      },
      all_modes: {
        id: 'all_modes',
        name: '全模式制霸',
        description: '体验全部20种彩蛋模式',
        icon: '🏆',
        unlocked: false
      }
    },

    _unlockedCount: 0,

    /**
     * 初始化成就系统
     */
    init: function () {
      var saved = Utils.storage.get('achievements', {});
      for (var id in saved) {
        if (saved[id] && this._achievements[id]) {
          this._achievements[id].unlocked = true;
          this._unlockedCount++;
        }
      }
    },

    /**
     * 解锁成就
     */
    unlock: function (achievementId) {
      var achievement = this._achievements[achievementId];
      if (!achievement || achievement.unlocked) return;

      achievement.unlocked = true;
      this._unlockedCount++;

      // 保存
      var saved = Utils.storage.get('achievements', {});
      saved[achievementId] = true;
      Utils.storage.set('achievements', saved);

      // 显示成就通知
      this._showAchievementNotification(achievement);

      Utils.emit('achievement-unlocked', { id: achievementId, achievement: achievement });

      // 检查全模式成就
      this._checkAllModesAchievement();
    },

    /**
     * 检查是否达成某个条件
     */
    check: function (condition, value) {
      switch (condition) {
        case 'first_easter':
          this.unlock('first_easter');
          break;
        case 'typewriter_combo':
          if (value >= 10) this.unlock('typewriter_master');
          break;
        case 'gravity_level':
          if (value >= 10) this.unlock('gravity_survivor');
          break;
        case 'parkour_distance':
          if (value >= 1000) this.unlock('parkour_pro');
          break;
        case 'whack_combo':
          if (value >= 50) this.unlock('whack_champion');
          break;
        case 'blind_level':
          if (value >= 5) this.unlock('memory_genius');
          break;
        case 'reverse_combo':
          if (value >= 8) this.unlock('reverse_master');
          break;
        case 'puzzle_complete':
          if (value >= 5) this.unlock('puzzle_collector');
          break;
        case 'monster_boss':
          this.unlock('monster_slayer');
          break;
        case 'space_kills':
          if (value >= 20) this.unlock('space_pilot');
          break;
        case 'rhythm_combo':
          if (value >= 50) this.unlock('rhythm_perfect');
          break;
        case 'detective_rank':
          if (value >= 4) this.unlock('detective_master');
          break;
        case 'zombie_wave':
          if (value >= 10) this.unlock('zombie_survivor');
          break;
        case 'cooking_all':
          this.unlock('cooking_chef');
          break;
        case 'cultivation_realm':
          if (value >= 6) this.unlock('cultivation_god');
          break;
        case 'stock_money':
          if (value >= 100000) this.unlock('stock_tycoon');
          break;
        case 'maze_complete':
          if (value >= 5) this.unlock('maze_explorer');
          break;
        case 'hacker_complete':
          this.unlock('hacker_elite');
          break;
        case 'konami_code':
          this.unlock('konami_master');
          break;
      }
    },

    /**
     * 显示成就解锁通知
     */
    _showAchievementNotification: function (achievement) {
      var notification = Utils.createEl('div', 'sz-easter-achievement-notification');
      notification.innerHTML =
        '<div class="sz-easter-achievement-icon">' + achievement.icon + '</div>' +
        '<div class="sz-easter-achievement-info">' +
          '<div class="sz-easter-achievement-title">成就解锁！</div>' +
          '<div class="sz-easter-achievement-name">' + achievement.name + '</div>' +
          '<div class="sz-easter-achievement-desc">' + achievement.description + '</div>' +
        '</div>';

      document.body.appendChild(notification);

      requestAnimationFrame(function () {
        notification.classList.add('sz-easter-achievement-show');
      });

      setTimeout(function () {
        notification.classList.remove('sz-easter-achievement-show');
        setTimeout(function () {
          if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 500);
      }, 3000);
    },

    /**
     * 检查全模式成就
     */
    _checkAllModesAchievement: function () {
      var playedModes = Utils.storage.get('played_modes', []);
      var totalModes = Object.keys(SZ.easterEggs.modes).length;
      if (playedModes.length >= totalModes && totalModes >= 20) {
        this.unlock('all_modes');
      }
    },

    /**
     * 记录已玩过的模式
     */
    recordPlayed: function (modeId) {
      var played = Utils.storage.get('played_modes', []);
      if (played.indexOf(modeId) === -1) {
        played.push(modeId);
        Utils.storage.set('played_modes', played);
        this._checkAllModesAchievement();
      }
    },

    /**
     * 获取所有成就
     */
    getAll: function () {
      return this._achievements;
    },

    /**
     * 获取已解锁成就数量
     */
    getUnlockedCount: function () {
      return this._unlockedCount;
    }
  };


  // ============================================================
  //  主题皮肤系统
  // ============================================================
  var ThemeSystem = {
    _currentTheme: 'default',
    _themes: {
      default: {
        name: '默认主题',
        primaryColor: '#4A90D9',
        secondaryColor: '#7B68EE',
        bgColor: '#1a1a2e',
        textColor: '#ffffff',
        accentColor: '#00D4AA'
      },
      neon: {
        name: '霓虹之夜',
        primaryColor: '#FF00FF',
        secondaryColor: '#00FFFF',
        bgColor: '#0a0a0a',
        textColor: '#ffffff',
        accentColor: '#FFD700'
      },
      retro: {
        name: '复古像素',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        bgColor: '#2C3E50',
        textColor: '#ECF0F1',
        accentColor: '#FFE66D'
      },
      forest: {
        name: '森林精灵',
        primaryColor: '#2ECC71',
        secondaryColor: '#27AE60',
        bgColor: '#1B4332',
        textColor: '#D8F3DC',
        accentColor: '#F39C12'
      },
      ocean: {
        name: '深海蓝调',
        primaryColor: '#3498DB',
        secondaryColor: '#2980B9',
        bgColor: '#0C3542',
        textColor: '#E8F4F8',
        accentColor: '#E74C3C'
      },
      sunset: {
        name: '落日余晖',
        primaryColor: '#E74C3C',
        secondaryColor: '#F39C12',
        bgColor: '#2D1B2E',
        textColor: '#FDEDEC',
        accentColor: '#9B59B6'
      }
    },

    /**
     * 初始化主题系统
     */
    init: function () {
      this._currentTheme = Utils.storage.get('theme', 'default');
      this.applyTheme(this._currentTheme);
    },

    /**
     * 应用主题
     */
    applyTheme: function (themeName) {
      var theme = this._themes[themeName];
      if (!theme) return;

      this._currentTheme = themeName;
      Utils.storage.set('theme', themeName);

      // 设置CSS变量
      var root = document.documentElement;
      root.style.setProperty('--sz-easter-primary', theme.primaryColor);
      root.style.setProperty('--sz-easter-secondary', theme.secondaryColor);
      root.style.setProperty('--sz-easter-bg', theme.bgColor);
      root.style.setProperty('--sz-easter-text', theme.textColor);
      root.style.setProperty('--sz-easter-accent', theme.accentColor);

      Utils.emit('theme-changed', { theme: themeName });
    },

    /**
     * 获取当前主题
     */
    getCurrentTheme: function () {
      return this._currentTheme;
    },

    /**
     * 获取所有主题
     */
    getAllThemes: function () {
      return this._themes;
    },

    /**
     * 切换到下一个主题
     */
    nextTheme: function () {
      var themeNames = Object.keys(this._themes);
      var currentIdx = themeNames.indexOf(this._currentTheme);
      var nextIdx = (currentIdx + 1) % themeNames.length;
      this.applyTheme(themeNames[nextIdx]);
      return themeNames[nextIdx];
    }
  };


  // ============================================================
  //  统计系统集成
  // ============================================================
  var StatsIntegration = {
    /**
     * 记录答题统计
     */
    recordAnswer: function (modeId, correct, question, answerTime) {
      var stats = Utils.storage.get('stats_' + modeId, {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        totalTime: 0,
        bestScore: 0
      });

      stats.totalQuestions++;
      if (correct) {
        stats.correctCount++;
      } else {
        stats.wrongCount++;
      }
      if (answerTime) {
        stats.totalTime += answerTime;
      }

      Utils.storage.set('stats_' + modeId, stats);
    },

    /**
     * 记录最高分
     */
    recordScore: function (modeId, score) {
      var stats = Utils.storage.get('stats_' + modeId, { bestScore: 0 });
      if (score > stats.bestScore) {
        stats.bestScore = score;
        Utils.storage.set('stats_' + modeId, stats);
        return true; // 新纪录
      }
      return false;
    },

    /**
     * 获取模式统计
     */
    getStats: function (modeId) {
      return Utils.storage.get('stats_' + modeId, {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        totalTime: 0,
        bestScore: 0
      });
    },

    /**
     * 获取总统计
     */
    getOverallStats: function () {
      var overall = {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        totalScore: 0,
        modesPlayed: 0
      };

      var modes = SZ.easterEggs.modes;
      for (var id in modes) {
        if (modes.hasOwnProperty(id)) {
          var stats = this.getStats(id);
          overall.totalQuestions += stats.totalQuestions;
          overall.correctCount += stats.correctCount;
          overall.wrongCount += stats.wrongCount;
          overall.totalScore += stats.bestScore || 0;
          if (stats.totalQuestions > 0) {
            overall.modesPlayed++;
          }
        }
      }

      return overall;
    }
  };


  // ============================================================
  //  彩蛋模式选择器 UI
  // ============================================================
  var ModeSelector = {
    _selectorEl: null,

    /**
     * 显示模式选择器
     */
    show: function () {
      if (this._selectorEl) {
        this._selectorEl.style.display = 'flex';
        return;
      }

      var selector = Utils.createEl('div', 'sz-easter-mode-selector');
      selector.innerHTML =
        '<div class="sz-easter-selector-content">' +
          '<div class="sz-easter-selector-header">' +
            '<h2 class="sz-easter-selector-title">🎉 彩蛋模式 🎉</h2>' +
            '<p class="sz-easter-selector-subtitle">选择一个趣味模式开始冒险！</p>' +
            '<button class="sz-easter-selector-close" data-action="close">×</button>' +
          '</div>' +
          '<div class="sz-easter-selector-grid" data-role="mode-grid"></div>' +
          '<div class="sz-easter-selector-footer">' +
            '<button class="sz-easter-btn sz-easter-btn-theme" data-action="theme">🎨 切换主题</button>' +
            '<button class="sz-easter-btn sz-easter-btn-achievements" data-action="achievements">🏆 成就</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(selector);
      this._selectorEl = selector;

      this._renderModeGrid();
      this._bindSelectorEvents();
    },

    /**
     * 隐藏模式选择器
     */
    hide: function () {
      if (this._selectorEl) {
        this._selectorEl.style.display = 'none';
      }
    },

    /**
     * 渲染模式网格
     */
    _renderModeGrid: function () {
      var grid = this._selectorEl.querySelector('[data-role="mode-grid"]');
      if (!grid) return;

      grid.innerHTML = '';
      var modes = SZ.easterEggs.modes;

      for (var id in modes) {
        if (modes.hasOwnProperty(id)) {
          var mode = modes[id];
          var unlocked = UnlockSystem.isModeUnlocked(id);
          var stats = StatsIntegration.getStats(id);

          var card = Utils.createEl('div', 'sz-easter-mode-card' + (unlocked ? '' : ' sz-easter-mode-locked'), grid);
          card.setAttribute('data-mode-id', id);
          card.innerHTML =
            '<div class="sz-easter-mode-icon">' + (unlocked ? mode.icon : '🔒') + '</div>' +
            '<div class="sz-easter-mode-name">' + mode.name + '</div>' +
            '<div class="sz-easter-mode-desc">' + (unlocked ? mode.description : '未解锁') + '</div>' +
            (unlocked && stats.bestScore > 0
              ? '<div class="sz-easter-mode-best">最高分: ' + stats.bestScore + '</div>'
              : '');

          if (unlocked) {
            card.onclick = function (modeId) {
              return function () {
                ModeSelector.hide();
                AchievementSystem.check('first_easter');
                AchievementSystem.recordPlayed(modeId);
                ModeManager.startMode(modeId);
              };
            }(id);
          }
        }
      }
    },

    /**
     * 绑定选择器事件
     */
    _bindSelectorEvents: function () {
      var self = this;
      var closeBtn = this._selectorEl.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.onclick = function () {
          self.hide();
        };
      }

      var themeBtn = this._selectorEl.querySelector('[data-action="theme"]');
      if (themeBtn) {
        themeBtn.onclick = function () {
          var newTheme = ThemeSystem.nextTheme();
          themeBtn.textContent = '🎨 ' + ThemeSystem._themes[newTheme].name;
        };
      }

      var achievementsBtn = this._selectorEl.querySelector('[data-action="achievements"]');
      if (achievementsBtn) {
        achievementsBtn.onclick = function () {
          self._showAchievementsPanel();
        };
      }
    },

    /**
     * 显示成就面板
     */
    _showAchievementsPanel: function () {
      var panel = Utils.createEl('div', 'sz-easter-achievements-panel');
      var achievements = AchievementSystem.getAll();
      var unlocked = AchievementSystem.getUnlockedCount();
      var total = Object.keys(achievements).length;

      var html = '<div class="sz-easter-achievements-content">' +
        '<h3>🏆 成就系统</h3>' +
        '<p>已解锁: ' + unlocked + ' / ' + total + '</p>' +
        '<div class="sz-easter-achievements-grid">';

      for (var id in achievements) {
        if (achievements.hasOwnProperty(id)) {
          var ach = achievements[id];
          html +=
            '<div class="sz-easter-achievement-card ' + (ach.unlocked ? 'unlocked' : 'locked') + '">' +
              '<div class="sz-easter-ach-icon">' + ach.icon + '</div>' +
              '<div class="sz-easter-ach-name">' + ach.name + '</div>' +
              '<div class="sz-easter-ach-desc">' + ach.description + '</div>' +
            '</div>';
        }
      }

      html += '</div><button class="sz-easter-btn sz-easter-btn-primary">关闭</button></div>';
      panel.innerHTML = html;
      this._selectorEl.appendChild(panel);

      panel.querySelector('button').onclick = function () {
        panel.remove();
      };
    }
  };


  // ============================================================
  //  导出最终模块
  // ============================================================
  SZ.easterEggs.AchievementSystem = AchievementSystem;
  SZ.easterEggs.ThemeSystem = ThemeSystem;
  SZ.easterEggs.StatsIntegration = StatsIntegration;
  SZ.easterEggs.ModeSelector = ModeSelector;

  // 初始化成就系统
  AchievementSystem.init();
  ThemeSystem.init();

  // 监听解锁事件
  Utils.listen('unlocked', function (e) {
    if (e.detail && e.detail.method === 'konami') {
      AchievementSystem.check('konami_code');
    }
    ModeSelector.show();
  });

  // 监听模式开始事件，记录统计
  Utils.listen('mode-started', function (e) {
    if (e.detail && e.detail.mode) {
      AchievementSystem.recordPlayed(e.detail.mode);
    }
  });



  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ModeManager.init();
    });
  } else {
    ModeManager.init();
  }

})(window);
