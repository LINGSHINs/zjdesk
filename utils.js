/**
 * ============================================================
 *  SZ.utils - 刷题应用工具函数库
 * ============================================================
 *
 *  版本: 1.0.0
 *  描述: 刷题应用的通用工具函数集合，挂载到 window.SZ.utils 命名空间下
 *  包含模块:
 *    - DOM操作工具 (dom)
 *    - 事件工具 (event)
 *    - 数据工具 (data)
 *    - 存储工具 (storage)
 *    - 时间工具 (time)
 *    - 字符串工具 (string)
 *    - 数学工具 (math)
 *    - 颜色工具 (color)
 *    - 动画工具 (animate)
 *    - 通知工具 (notify)
 *    - 键盘快捷键 (shortcut)
 *    - 文件工具 (file)
 *    - 性能工具 (performance)
 *
 *  兼容性: 支持现代浏览器 (Chrome, Firefox, Safari, Edge)
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  // ============================================================
  //  命名空间初始化
  // ============================================================

  /**
   * 全局命名空间 SZ (ShuZhuo)
   * @namespace SZ
   */
  global.SZ = global.SZ || {};

  /**
   * 工具函数命名空间
   * @namespace SZ.utils
   */
  var utils = {};
  global.SZ.utils = utils;

  // ============================================================
  //  内部辅助函数
  // ============================================================

  /**
   * 获取对象类型
   * @param {*} obj - 待检测的对象
   * @returns {string} 类型字符串（小写）
   * @private
   */
  function _type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  }

  /**
   * 判断是否为类数组对象
   * @param {*} obj - 待检测的对象
   * @returns {boolean}
   * @private
   */
  function _isArrayLike(obj) {
    return obj != null && typeof obj !== 'function' &&
      typeof obj.length === 'number' && obj.length >= 0 &&
      obj.length === Math.floor(obj.length) && obj.length < 4294967296;
  }

  /**
   * 遍历数组或对象
   * @param {Array|Object} obj - 待遍历的对象
   * @param {Function} callback - 回调函数
   * @private
   */
  function _each(obj, callback) {
    if (_isArrayLike(obj)) {
      for (var i = 0, len = obj.length; i < len; i++) {
        if (callback.call(obj[i], i, obj[i]) === false) break;
      }
    } else if (typeof obj === 'object') {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (callback.call(obj[key], key, obj[key]) === false) break;
        }
      }
    }
  }

  // ============================================================
  //  DOM 操作工具
  // ============================================================

  /**
   * DOM 操作工具模块
   * @namespace SZ.utils.dom
   */
  var dom = utils.dom = {};

  /**
   * 选择单个元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} [context=document] - 上下文元素
   * @returns {HTMLElement|null} 匹配的元素
   *
   * @example
   * SZ.utils.dom.$('#app') // => <div id="app"></div>
   * SZ.utils.dom.$('.item', parent) // => 在parent内查找.item
   */
  dom.$ = function (selector, context) {
    context = context || document;
    return context.querySelector(selector);
  };

  /**
   * 选择所有匹配的元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} [context=document] - 上下文元素
   * @returns {NodeList} 匹配的元素集合
   *
   * @example
   * SZ.utils.dom.$$('.item') // => NodeList[...]
   */
  dom.$$ = function (selector, context) {
    context = context || document;
    return context.querySelectorAll(selector);
  };

  /**
   * 创建DOM元素
   * @param {string} tag - 标签名
   * @param {Object} [props] - 属性对象（包括style, dataset, event等）
   * @param {Array|string|HTMLElement} [children] - 子元素
   * @returns {HTMLElement} 创建的元素
   *
   * @example
   * // 创建简单元素
   * SZ.utils.dom.createElement('div', { className: 'box' }, 'Hello')
   *
   * // 创建带事件和样式的元素
   * SZ.utils.dom.createElement('button', {
   *   className: 'btn',
   *   style: { color: 'red' },
   *   dataset: { id: '123' },
   *   onClick: function() { alert('clicked'); }
   * }, 'Click me')
   */
  dom.createElement = function (tag, props, children) {
    var el = document.createElement(tag);

    if (props) {
      _each(props, function (key, value) {
        if (value == null || value === false) return;

        // 特殊属性处理
        if (key === 'className') {
          el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          _each(value, function (styleKey, styleVal) {
            el.style[styleKey] = styleVal;
          });
        } else if (key === 'dataset' && typeof value === 'object') {
          _each(value, function (dataKey, dataVal) {
            el.dataset[dataKey] = dataVal;
          });
        } else if (key.substr(0, 2) === 'on' && typeof value === 'function') {
          // 事件绑定
          var eventName = key.substr(2).toLowerCase();
          el.addEventListener(eventName, value);
        } else if (key === 'html') {
          el.innerHTML = value;
        } else if (key === 'text') {
          el.textContent = value;
        } else if (key === 'value') {
          el.value = value;
        } else if (key === 'checked' || key === 'disabled' || key === 'readonly' ||
                   key === 'selected' || key === 'hidden') {
          if (value) el.setAttribute(key, key);
        } else {
          el.setAttribute(key, value);
        }
      });
    }

    // 添加子元素
    if (children != null) {
      if (typeof children === 'string' || typeof children === 'number') {
        el.appendChild(document.createTextNode(String(children)));
      } else if (children instanceof HTMLElement) {
        el.appendChild(children);
      } else if (Array.isArray(children)) {
        _each(children, function (_, child) {
          if (child == null) return;
          if (typeof child === 'string' || typeof child === 'number') {
            el.appendChild(document.createTextNode(String(child)));
          } else if (child instanceof HTMLElement) {
            el.appendChild(child);
          }
        });
      }
    }

    return el;
  };

  /**
   * 添加类名
   * @param {HTMLElement} el - 目标元素
   * @param {string} className - 类名（多个用空格分隔）
   * @returns {HTMLElement} 元素本身（支持链式调用）
   */
  dom.addClass = function (el, className) {
    if (!el || !className) return el;

    var classes = className.trim().split(/\s+/);
    _each(classes, function (_, cls) {
      if (cls && !el.classList.contains(cls)) {
        el.classList.add(cls);
      }
    });

    return el;
  };

  /**
   * 移除类名
   * @param {HTMLElement} el - 目标元素
   * @param {string} className - 类名（多个用空格分隔）
   * @returns {HTMLElement} 元素本身（支持链式调用）
   */
  dom.removeClass = function (el, className) {
    if (!el || !className) return el;

    var classes = className.trim().split(/\s+/);
    _each(classes, function (_, cls) {
      if (cls && el.classList.contains(cls)) {
        el.classList.remove(cls);
      }
    });

    return el;
  };

  /**
   * 切换类名
   * @param {HTMLElement} el - 目标元素
   * @param {string} className - 类名
   * @param {boolean} [force] - 强制添加或移除
   * @returns {HTMLElement} 元素本身
   */
  dom.toggleClass = function (el, className, force) {
    if (!el || !className) return el;

    var classes = className.trim().split(/\s+/);
    _each(classes, function (_, cls) {
      if (!cls) return;
      if (typeof force === 'boolean') {
        force ? el.classList.add(cls) : el.classList.remove(cls);
      } else {
        el.classList.toggle(cls);
      }
    });

    return el;
  };

  /**
   * 检查是否含有类名
   * @param {HTMLElement} el - 目标元素
   * @param {string} className - 类名
   * @returns {boolean}
   */
  dom.hasClass = function (el, className) {
    if (!el || !className) return false;
    return el.classList.contains(className.trim());
  };

  /**
   * 显示元素
   * @param {HTMLElement} el - 目标元素
   * @param {string} [display=''] - display属性值
   * @returns {HTMLElement}
   */
  dom.show = function (el, display) {
    if (!el) return el;
    el.style.display = display || '';
    return el;
  };

  /**
   * 隐藏元素
   * @param {HTMLElement} el - 目标元素
   * @returns {HTMLElement}
   */
  dom.hide = function (el) {
    if (!el) return el;
    el.style.display = 'none';
    return el;
  };

  /**
   * 切换显示/隐藏
   * @param {HTMLElement} el - 目标元素
   * @returns {HTMLElement}
   */
  dom.toggle = function (el) {
    if (!el) return el;
    if (el.style.display === 'none') {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
    return el;
  };

  /**
   * 获取元素相对于文档的偏移位置
   * @param {HTMLElement} el - 目标元素
   * @returns {{top: number, left: number, width: number, height: number}}
   */
  dom.getOffset = function (el) {
    if (!el || !el.getBoundingClientRect) {
      return { top: 0, left: 0, width: 0, height: 0 };
    }

    var rect = el.getBoundingClientRect();
    var win = el.ownerDocument.defaultView;

    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset,
      width: rect.width,
      height: rect.height
    };
  };

  /**
   * 获取元素相对于父定位元素的位置
   * @param {HTMLElement} el - 目标元素
   * @returns {{top: number, left: number}}
   */
  dom.getPosition = function (el) {
    if (!el) return { top: 0, left: 0 };

    var parent = el.offsetParent;
    var top = el.offsetTop;
    var left = el.offsetLeft;

    while (parent && parent !== document.body) {
      top += parent.offsetTop;
      left += parent.offsetLeft;
      parent = parent.offsetParent;
    }

    return { top: top, left: left };
  };

  /**
   * 获取元素的尺寸信息
   * @param {HTMLElement} el - 目标元素
   * @returns {{width: number, height: number, innerWidth: number, innerHeight: number, outerWidth: number, outerHeight: number}}
   */
  dom.getSize = function (el) {
    if (!el) {
      return {
        width: 0, height: 0,
        innerWidth: 0, innerHeight: 0,
        outerWidth: 0, outerHeight: 0
      };
    }

    var style = window.getComputedStyle(el);
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var paddingLeft = parseFloat(style.paddingLeft) || 0;
    var paddingRight = parseFloat(style.paddingRight) || 0;
    var paddingTop = parseFloat(style.paddingTop) || 0;
    var paddingBottom = parseFloat(style.paddingBottom) || 0;
    var borderLeft = parseFloat(style.borderLeftWidth) || 0;
    var borderRight = parseFloat(style.borderRightWidth) || 0;
    var borderTop = parseFloat(style.borderTopWidth) || 0;
    var borderBottom = parseFloat(style.borderBottomWidth) || 0;
    var marginLeft = parseFloat(style.marginLeft) || 0;
    var marginRight = parseFloat(style.marginRight) || 0;
    var marginTop = parseFloat(style.marginTop) || 0;
    var marginBottom = parseFloat(style.marginBottom) || 0;

    return {
      width: width - paddingLeft - paddingRight - borderLeft - borderRight,
      height: height - paddingTop - paddingBottom - borderTop - borderBottom,
      innerWidth: width - borderLeft - borderRight,
      innerHeight: height - borderTop - borderBottom,
      outerWidth: width + marginLeft + marginRight,
      outerHeight: height + marginTop + marginBottom
    };
  };

  /**
   * 设置或获取元素的CSS属性
   * @param {HTMLElement} el - 目标元素
   * @param {string|Object} prop - 属性名或属性对象
   * @param {string} [value] - 属性值
   * @returns {string|HTMLElement}
   */
  dom.css = function (el, prop, value) {
    if (!el || !prop) return el;

    if (typeof prop === 'object') {
      _each(prop, function (key, val) {
        el.style[key] = val;
      });
      return el;
    }

    if (value === undefined) {
      return window.getComputedStyle(el)[prop];
    }

    el.style[prop] = value;
    return el;
  };

  /**
   * 获取或设置元素的HTML内容
   * @param {HTMLElement} el - 目标元素
   * @param {string} [html] - HTML内容
   * @returns {string|HTMLElement}
   */
  dom.html = function (el, html) {
    if (!el) return '';
    if (html === undefined) return el.innerHTML;
    el.innerHTML = html;
    return el;
  };

  /**
   * 获取或设置元素的文本内容
   * @param {HTMLElement} el - 目标元素
   * @param {string} [text] - 文本内容
   * @returns {string|HTMLElement}
   */
  dom.text = function (el, text) {
    if (!el) return '';
    if (text === undefined) return el.textContent;
    el.textContent = text;
    return el;
  };

  /**
   * 获取或设置元素的value
   * @param {HTMLElement} el - 目标元素
   * @param {string} [value] - 值
   * @returns {string|HTMLElement}
   */
  dom.val = function (el, value) {
    if (!el) return '';
    if (value === undefined) return el.value;
    el.value = value;
    return el;
  };

  /**
   * 获取或设置元素的属性
   * @param {HTMLElement} el - 目标元素
   * @param {string|Object} attr - 属性名或属性对象
   * @param {string} [value] - 属性值
   * @returns {string|null|HTMLElement}
   */
  dom.attr = function (el, attr, value) {
    if (!el || !attr) return el;

    if (typeof attr === 'object') {
      _each(attr, function (key, val) {
        if (val == null) {
          el.removeAttribute(key);
        } else {
          el.setAttribute(key, val);
        }
      });
      return el;
    }

    if (value === undefined) {
      return el.getAttribute(attr);
    }

    if (value == null) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, value);
    }
    return el;
  };

  /**
   * 获取或设置data属性
   * @param {HTMLElement} el - 目标元素
   * @param {string} key - data键名
   * @param {*} [value] - 值
   * @returns {*|HTMLElement}
   */
  dom.data = function (el, key, value) {
    if (!el) return el;

    if (typeof key === 'object') {
      _each(key, function (k, v) {
        el.dataset[k] = typeof v === 'object' ? JSON.stringify(v) : v;
      });
      return el;
    }

    if (value === undefined) {
      var val = el.dataset[key];
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }

    el.dataset[key] = typeof value === 'object' ? JSON.stringify(value) : value;
    return el;
  };

  /**
   * 在父元素末尾插入子元素
   * @param {HTMLElement} parent - 父元素
   * @param {HTMLElement} child - 子元素
   * @returns {HTMLElement} 父元素
   */
  dom.append = function (parent, child) {
    if (!parent || !child) return parent;
    parent.appendChild(child);
    return parent;
  };

  /**
   * 在父元素开头插入子元素
   * @param {HTMLElement} parent - 父元素
   * @param {HTMLElement} child - 子元素
   * @returns {HTMLElement} 父元素
   */
  dom.prepend = function (parent, child) {
    if (!parent || !child) return parent;
    parent.insertBefore(child, parent.firstChild);
    return parent;
  };

  /**
   * 在目标元素之前插入元素
   * @param {HTMLElement} target - 目标元素
   * @param {HTMLElement} el - 要插入的元素
   * @returns {HTMLElement} 目标元素
   */
  dom.before = function (target, el) {
    if (!target || !el || !target.parentNode) return target;
    target.parentNode.insertBefore(el, target);
    return target;
  };

  /**
   * 在目标元素之后插入元素
   * @param {HTMLElement} target - 目标元素
   * @param {HTMLElement} el - 要插入的元素
   * @returns {HTMLElement} 目标元素
   */
  dom.after = function (target, el) {
    if (!target || !el || !target.parentNode) return target;
    target.parentNode.insertBefore(el, target.nextSibling);
    return target;
  };

  /**
   * 移除元素
   * @param {HTMLElement} el - 目标元素
   * @returns {HTMLElement} 被移除的元素
   */
  dom.remove = function (el) {
    if (!el || !el.parentNode) return el;
    el.parentNode.removeChild(el);
    return el;
  };

  /**
   * 清空元素内容
   * @param {HTMLElement} el - 目标元素
   * @returns {HTMLElement}
   */
  dom.empty = function (el) {
    if (!el) return el;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    return el;
  };

  /**
   * 查找最近的匹配祖先元素
   * @param {HTMLElement} el - 起始元素
   * @param {string} selector - 选择器
   * @returns {HTMLElement|null}
   */
  dom.closest = function (el, selector) {
    if (!el) return null;
    if (el.closest) return el.closest(selector);

    // 兼容处理
    var current = el;
    while (current && current.nodeType === 1) {
      if (current.matches(selector)) return current;
      current = current.parentElement;
    }
    return null;
  };

  /**
   * 判断元素是否匹配选择器
   * @param {HTMLElement} el - 目标元素
   * @param {string} selector - 选择器
   * @returns {boolean}
   */
  dom.matches = function (el, selector) {
    if (!el) return false;
    var matches = el.matches || el.webkitMatchesSelector || el.msMatchesSelector;
    return matches.call(el, selector);
  };

  /**
   * 获取元素在父元素中的索引位置
   * @param {HTMLElement} el - 目标元素
   * @returns {number} 索引（从0开始），不存在返回-1
   */
  dom.index = function (el) {
    if (!el || !el.parentNode) return -1;
    var index = 0;
    var sibling = el.parentNode.firstChild;
    while (sibling) {
      if (sibling.nodeType === 1 && sibling !== el) {
        index++;
      }
      if (sibling === el) return index;
      sibling = sibling.nextSibling;
    }
    return -1;
  };

  // ============================================================
  //  事件工具
  // ============================================================

  /**
   * 事件工具模块
   * @namespace SZ.utils.event
   */
  var eventUtil = utils.event = {};

  /**
   * 绑定事件
   * @param {HTMLElement|Window|Document} el - 目标元素
   * @param {string} type - 事件类型（多个用空格分隔）
   * @param {Function} handler - 事件处理函数
   * @param {boolean|Object} [options=false] - 事件选项
   * @returns {Object} 事件绑定对象，可用于解绑
   *
   * @example
   * SZ.utils.event.on(btn, 'click', function(e) { ... })
   * SZ.utils.event.on(btn, 'click mouseenter', handler)
   */
  eventUtil.on = function (el, type, handler, options) {
    if (!el || !type || typeof handler !== 'function') return null;

    var types = type.trim().split(/\s+/);
    _each(types, function (_, t) {
      if (!t) return;
      el.addEventListener(t, handler, options || false);
    });

    return { el: el, type: type, handler: handler, options: options };
  };

  /**
   * 解绑事件
   * @param {HTMLElement|Window|Document} el - 目标元素
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {boolean|Object} [options=false] - 事件选项
   */
  eventUtil.off = function (el, type, handler, options) {
    if (!el || !type || typeof handler !== 'function') return;

    var types = type.trim().split(/\s+/);
    _each(types, function (_, t) {
      if (!t) return;
      el.removeEventListener(t, handler, options || false);
    });
  };

  /**
   * 绑定一次性事件
   * @param {HTMLElement|Window|Document} el - 目标元素
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {boolean|Object} [options=false] - 事件选项
   * @returns {Function} 包装后的处理函数
   */
  eventUtil.once = function (el, type, handler, options) {
    if (!el || !type || typeof handler !== 'function') return handler;

    var wrapper = function (e) {
      handler.call(el, e);
      eventUtil.off(el, type, wrapper, options);
    };

    eventUtil.on(el, type, wrapper, options);
    return wrapper;
  };

  /**
   * 事件委托
   * @param {HTMLElement} parent - 父元素
   * @param {string} selector - 子元素选择器
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {boolean} [useCapture=false] - 是否捕获阶段
   * @returns {Function} 委托处理函数
   *
   * @example
   * SZ.utils.event.delegate(list, '.item', 'click', function(e) {
   *   console.log(this); // => .item 元素
   * })
   */
  eventUtil.delegate = function (parent, selector, type, handler, useCapture) {
    if (!parent || !selector || !type || typeof handler !== 'function') return null;

    var delegateHandler = function (e) {
      var target = e.target;
      var matchTarget = dom.closest(target, selector);

      if (matchTarget && parent.contains(matchTarget)) {
        handler.call(matchTarget, e);
      }
    };

    eventUtil.on(parent, type, delegateHandler, useCapture);
    return delegateHandler;
  };

  /**
   * 触发自定义事件
   * @param {HTMLElement|Window|Document} el - 目标元素
   * @param {string} type - 事件类型
   * @param {Object} [data] - 自定义数据
   * @param {Object} [options] - 事件选项
   */
  eventUtil.trigger = function (el, type, data, options) {
    if (!el || !type) return;

    options = options || {};
    var event;

    if (typeof CustomEvent === 'function') {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: options.bubbles !== false,
        cancelable: options.cancelable !== false
      });
    } else {
      // IE 兼容
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(
        type,
        options.bubbles !== false,
        options.cancelable !== false,
        data
      );
    }

    el.dispatchEvent(event);
  };

  /**
   * 节流函数 - 规定时间内只执行一次
   * @param {Function} fn - 要节流的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @param {Object} [options] - 选项
   * @param {boolean} [options.leading=true] - 是否在开始时调用
   * @param {boolean} [options.trailing=true] - 是否在结束时调用
   * @returns {Function} 节流后的函数
   *
   * @example
   * var throttled = SZ.utils.event.throttle(function() {
   *   console.log('scroll');
   * }, 200);
   * window.addEventListener('scroll', throttled);
   */
  eventUtil.throttle = function (fn, delay, options) {
    if (typeof fn !== 'function') return fn;

    delay = delay || 300;
    options = options || {};

    var lastTime = 0;
    var timer = null;
    var context, args;

    var throttled = function () {
      context = this;
      args = arguments;
      var now = Date.now();

      // 首次执行控制
      if (!lastTime && options.leading === false) {
        lastTime = now;
      }

      var remaining = delay - (now - lastTime);

      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastTime = now;
        fn.apply(context, args);
      } else if (!timer && options.trailing !== false) {
        timer = setTimeout(function () {
          lastTime = options.leading === false ? 0 : Date.now();
          timer = null;
          fn.apply(context, args);
        }, remaining);
      }
    };

    /**
     * 取消节流
     */
    throttled.cancel = function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = 0;
    };

    return throttled;
  };

  /**
   * 防抖函数 - 等待指定时间后才执行，如果期间再次触发则重新计时
   * @param {Function} fn - 要防抖的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @param {boolean} [immediate=false] - 是否立即执行首次调用
   * @returns {Function} 防抖后的函数
   *
   * @example
   * var debounced = SZ.utils.event.debounce(function() {
   *   console.log('search');
   * }, 500);
   * input.addEventListener('input', debounced);
   */
  eventUtil.debounce = function (fn, delay, immediate) {
    if (typeof fn !== 'function') return fn;

    delay = delay || 300;
    var timer = null;
    var context, args, result;

    var debounced = function () {
      context = this;
      args = arguments;

      if (timer) clearTimeout(timer);

      if (immediate) {
        var callNow = !timer;
        timer = setTimeout(function () {
          timer = null;
        }, delay);
        if (callNow) {
          result = fn.apply(context, args);
        }
      } else {
        timer = setTimeout(function () {
          result = fn.apply(context, args);
          timer = null;
        }, delay);
      }

      return result;
    };

    /**
     * 取消防抖并立即执行
     */
    debounced.flush = function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        result = fn.apply(context, args);
      }
      return result;
    };

    /**
     * 取消防抖
     */
    debounced.cancel = function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    return debounced;
  };

  /**
   * 阻止事件冒泡
   * @param {Event} e - 事件对象
   */
  eventUtil.stopPropagation = function (e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  };

  /**
   * 阻止默认行为
   * @param {Event} e - 事件对象
   */
  eventUtil.preventDefault = function (e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  };

  /**
   * 同时阻止冒泡和默认行为
   * @param {Event} e - 事件对象
   */
  eventUtil.stopEvent = function (e) {
    eventUtil.stopPropagation(e);
    eventUtil.preventDefault(e);
  };

  /**
   * 获取事件目标元素
   * @param {Event} e - 事件对象
   * @returns {HTMLElement}
   */
  eventUtil.getTarget = function (e) {
    return e.target || e.srcElement;
  };

  /**
   * 获取页面坐标
   * @param {Event} e - 事件对象
   * @returns {{x: number, y: number}}
   */
  eventUtil.getPageXY = function (e) {
    if (e.pageX != null) {
      return { x: e.pageX, y: e.pageY };
    }
    return {
      x: e.clientX + document.documentElement.scrollLeft,
      y: e.clientY + document.documentElement.scrollTop
    };
  };

  /**
   * 页面加载完成后执行
   * @param {Function} callback - 回调函数
   */
  eventUtil.ready = function (callback) {
    if (typeof callback !== 'function') return;

    if (document.readyState === 'complete' ||
        document.readyState === 'interactive') {
      setTimeout(callback, 0);
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  };

  /**
   * 窗口大小改变时执行（已防抖）
   * @param {Function} callback - 回调函数
   * @param {number} [delay=150] - 防抖延迟
   * @returns {Function} 防抖处理函数
   */
  eventUtil.onResize = function (callback, delay) {
    var debounced = eventUtil.debounce(callback, delay || 150);
    window.addEventListener('resize', debounced);
    return debounced;
  };

  /**
   * 页面滚动时执行（已节流）
   * @param {Function} callback - 回调函数
   * @param {number} [delay=100] - 节流延迟
   * @returns {Function} 节流处理函数
   */
  eventUtil.onScroll = function (callback, delay) {
    var throttled = eventUtil.throttle(callback, delay || 100);
    window.addEventListener('scroll', throttled, { passive: true });
    return throttled;
  };

  // ============================================================
  //  数据工具
  // ============================================================

  /**
   * 数据工具模块
   * @namespace SZ.utils.data
   */
  var data = utils.data = {};

  /**
   * 深拷贝对象
   * @param {*} obj - 要拷贝的对象
   * @param {Map} [hash] - 内部循环引用检测
   * @returns {*} 拷贝后的对象
   *
   * @example
   * var obj = { a: { b: 1 } };
   * var copy = SZ.utils.data.deepClone(obj);
   * copy.a.b = 2;
   * console.log(obj.a.b); // => 1
   */
  data.deepClone = function (obj, hash) {
    // 基本类型和 null
    if (obj === null || typeof obj !== 'object') return obj;

    // 循环引用处理
    hash = hash || new Map();
    if (hash.has(obj)) return hash.get(obj);

    // Date
    if (obj instanceof Date) {
      var dateCopy = new Date(obj.getTime());
      hash.set(obj, dateCopy);
      return dateCopy;
    }

    // RegExp
    if (obj instanceof RegExp) {
      var flags = '';
      if (obj.global) flags += 'g';
      if (obj.ignoreCase) flags += 'i';
      if (obj.multiline) flags += 'm';
      if (obj.sticky) flags += 'y';
      if (obj.unicode) flags += 'u';
      var regCopy = new RegExp(obj.source, flags);
      regCopy.lastIndex = obj.lastIndex;
      hash.set(obj, regCopy);
      return regCopy;
    }

    // Map
    if (obj instanceof Map) {
      var mapCopy = new Map();
      hash.set(obj, mapCopy);
      obj.forEach(function (value, key) {
        mapCopy.set(key, data.deepClone(value, hash));
      });
      return mapCopy;
    }

    // Set
    if (obj instanceof Set) {
      var setCopy = new Set();
      hash.set(obj, setCopy);
      obj.forEach(function (value) {
        setCopy.add(data.deepClone(value, hash));
      });
      return setCopy;
    }

    // 数组
    if (Array.isArray(obj)) {
      var arrCopy = [];
      hash.set(obj, arrCopy);
      _each(obj, function (i, val) {
        arrCopy[i] = data.deepClone(val, hash);
      });
      return arrCopy;
    }

    // 普通对象
    var objCopy = {};
    hash.set(obj, objCopy);

    _each(obj, function (key, val) {
      objCopy[key] = data.deepClone(val, hash);
    });

    return objCopy;
  };

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {...Object} sources - 源对象（可多个）
   * @returns {Object} 合并后的目标对象
   *
   * @example
   * var target = { a: { b: 1 } };
   * var source = { a: { c: 2 } };
   * SZ.utils.data.deepMerge(target, source);
   * // => { a: { b: 1, c: 2 } }
   */
  data.deepMerge = function (target) {
    if (target == null || typeof target !== 'object') {
      target = {};
    }

    for (var i = 1, len = arguments.length; i < len; i++) {
      var source = arguments[i];
      if (source == null) continue;

      _each(source, function (key, value) {
        if (value === undefined) return;

        // 如果都是对象，递归合并
        if (data.isObject(target[key]) && data.isObject(value) &&
            !Array.isArray(value) && !(value instanceof Date) &&
            !(value instanceof RegExp)) {
          data.deepMerge(target[key], value);
        } else {
          target[key] = data.deepClone(value);
        }
      });
    }

    return target;
  };

  /**
   * 判断值是否为空
   * @param {*} val - 要判断的值
   * @returns {boolean}
   *
   * @example
   * SZ.utils.data.isEmpty(null) // => true
   * SZ.utils.data.isEmpty('') // => true
   * SZ.utils.data.isEmpty([]) // => true
   * SZ.utils.data.isEmpty({}) // => true
   * SZ.utils.data.isEmpty(0) // => false
   */
  data.isEmpty = function (val) {
    if (val == null) return true;
    if (typeof val === 'string') return val.trim() === '';
    if (Array.isArray(val)) return val.length === 0;
    if (data.isObject(val)) return Object.keys(val).length === 0;
    if (val instanceof Map || val instanceof Set) return val.size === 0;
    return false;
  };

  /**
   * 判断是否为字符串
   * @param {*} val
   * @returns {boolean}
   */
  data.isString = function (val) {
    return typeof val === 'string' || val instanceof String;
  };

  /**
   * 判断是否为数字
   * @param {*} val
   * @returns {boolean}
   */
  data.isNumber = function (val) {
    return typeof val === 'number' || val instanceof Number;
  };

  /**
   * 判断是否为有效数字（非NaN）
   * @param {*} val
   * @returns {boolean}
   */
  data.isValidNumber = function (val) {
    return data.isNumber(val) && !isNaN(val) && isFinite(val);
  };

  /**
   * 判断是否为数组
   * @param {*} val
   * @returns {boolean}
   */
  data.isArray = function (val) {
    return Array.isArray(val);
  };

  /**
   * 判断是否为纯对象
   * @param {*} val
   * @returns {boolean}
   */
  data.isObject = function (val) {
    return val !== null && typeof val === 'object' &&
      _type(val) === 'object' &&
      Object.getPrototypeOf(val) === Object.prototype;
  };

  /**
   * 判断是否为函数
   * @param {*} val
   * @returns {boolean}
   */
  data.isFunction = function (val) {
    return typeof val === 'function';
  };

  /**
   * 判断是否为布尔值
   * @param {*} val
   * @returns {boolean}
   */
  data.isBoolean = function (val) {
    return typeof val === 'boolean' || val instanceof Boolean;
  };

  /**
   * 判断是否为日期对象
   * @param {*} val
   * @returns {boolean}
   */
  data.isDate = function (val) {
    return val instanceof Date && !isNaN(val.getTime());
  };

  /**
   * 判断是否为正则表达式
   * @param {*} val
   * @returns {boolean}
   */
  data.isRegExp = function (val) {
    return val instanceof RegExp;
  };

  /**
   * 判断是否为 undefined
   * @param {*} val
   * @returns {boolean}
   */
  data.isUndefined = function (val) {
    return typeof val === 'undefined';
  };

  /**
   * 判断是否为 null
   * @param {*} val
   * @returns {boolean}
   */
  data.isNull = function (val) {
    return val === null;
  };

  /**
   * 判断是否为 null 或 undefined
   * @param {*} val
   * @returns {boolean}
   */
  data.isNil = function (val) {
    return val == null;
  };

  /**
   * 判断是否为类数组对象
   * @param {*} val
   * @returns {boolean}
   */
  data.isArrayLike = function (val) {
    return _isArrayLike(val);
  };

  /**
   * 生成指定范围内的随机整数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机整数 [min, max]
   *
   * @example
   * SZ.utils.data.random(1, 10) // => 5
   */
  data.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * 从数组中随机取一个元素
   * @param {Array} arr - 源数组
   * @returns {*} 随机元素
   */
  data.randomItem = function (arr) {
    if (!arr || !arr.length) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  /**
   * Fisher-Yates 洗牌算法（打乱数组顺序）
   * @param {Array} arr - 源数组
   * @returns {Array} 打乱后的新数组
   *
   * @example
   * SZ.utils.data.shuffle([1, 2, 3, 4, 5])
   * // => [3, 1, 5, 2, 4]
   */
  data.shuffle = function (arr) {
    if (!Array.isArray(arr)) return arr;

    var result = arr.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  };

  /**
   * 数组去重
   * @param {Array} arr - 源数组
   * @param {string|Function} [key] - 去重依据（对象数组时使用）
   * @returns {Array} 去重后的数组
   *
   * @example
   * // 基本类型去重
   * SZ.utils.data.unique([1, 2, 2, 3]) // => [1, 2, 3]
   *
   * // 对象数组按属性去重
   * SZ.utils.data.unique([{id:1}, {id:2}, {id:1}], 'id')
   * // => [{id:1}, {id:2}]
   */
  data.unique = function (arr, key) {
    if (!Array.isArray(arr)) return arr;

    if (key == null) {
      // 基本类型去重
      return arr.filter(function (item, index, self) {
        return self.indexOf(item) === index;
      });
    }

    // 对象数组按属性去重
    var seen = new Set();
    return arr.filter(function (item) {
      var val = typeof key === 'function' ? key(item) : item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  };

  /**
   * 数组分组
   * @param {Array} arr - 源数组
   * @param {string|Function} key - 分组依据（属性名或函数）
   * @returns {Object} 分组结果对象
   *
   * @example
   * var arr = [{type:'a', val:1}, {type:'b', val:2}, {type:'a', val:3}];
   * SZ.utils.data.groupBy(arr, 'type')
   * // => { a: [{type:'a', val:1}, {type:'a', val:3}], b: [{type:'b', val:2}] }
   */
  data.groupBy = function (arr, key) {
    var result = {};
    if (!Array.isArray(arr)) return result;

    _each(arr, function (_, item) {
      var groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
    });

    return result;
  };

  /**
   * 数组排序
   * @param {Array} arr - 源数组
   * @param {string|Function} key - 排序依据（属性名或函数）
   * @param {string} [order='asc'] - 排序方式 'asc' 或 'desc'
   * @returns {Array} 排序后的新数组
   *
   * @example
   * SZ.utils.data.sortBy([{age:20}, {age:18}, {age:25}], 'age')
   * // => [{age:18}, {age:20}, {age:25}]
   *
   * SZ.utils.data.sortBy([{age:20}, {age:18}], 'age', 'desc')
   * // => [{age:20}, {age:18}]
   */
  data.sortBy = function (arr, key, order) {
    if (!Array.isArray(arr)) return arr;

    order = order || 'asc';
    var isDesc = order.toLowerCase() === 'desc';

    var result = arr.slice();
    result.sort(function (a, b) {
      var valA = typeof key === 'function' ? key(a) : a[key];
      var valB = typeof key === 'function' ? key(b) : b[key];

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    return result;
  };

  /**
   * 数组扁平化
   * @param {Array} arr - 源数组
   * @param {number} [depth=Infinity] - 扁平化深度
   * @returns {Array}
   *
   * @example
   * SZ.utils.data.flatten([1, [2, [3, [4]]]])
   * // => [1, 2, 3, 4]
   *
   * SZ.utils.data.flatten([1, [2, [3]]], 1)
   * // => [1, 2, [3]]
   */
  data.flatten = function (arr, depth) {
    if (!Array.isArray(arr)) return arr;
    depth = depth == null ? Infinity : depth;

    var result = [];

    function flattenRecursive(array, currentDepth) {
      _each(array, function (_, item) {
        if (Array.isArray(item) && currentDepth > 0) {
          flattenRecursive(item, currentDepth - 1);
        } else {
          result.push(item);
        }
      });
    }

    flattenRecursive(arr, depth);
    return result;
  };

  /**
   * 查找数组中的最大值
   * @param {Array} arr - 源数组
   * @param {string|Function} [key] - 比较依据
   * @returns {*}
   */
  data.max = function (arr, key) {
    if (!arr || !arr.length) return undefined;

    if (!key) return Math.max.apply(null, arr);

    var maxItem = arr[0];
    var maxVal = typeof key === 'function' ? key(maxItem) : maxItem[key];

    _each(arr, function (_, item) {
      var val = typeof key === 'function' ? key(item) : item[key];
      if (val > maxVal) {
        maxVal = val;
        maxItem = item;
      }
    });

    return maxItem;
  };

  /**
   * 查找数组中的最小值
   * @param {Array} arr - 源数组
   * @param {string|Function} [key] - 比较依据
   * @returns {*}
   */
  data.min = function (arr, key) {
    if (!arr || !arr.length) return undefined;

    if (!key) return Math.min.apply(null, arr);

    var minItem = arr[0];
    var minVal = typeof key === 'function' ? key(minItem) : minItem[key];

    _each(arr, function (_, item) {
      var val = typeof key === 'function' ? key(item) : item[key];
      if (val < minVal) {
        minVal = val;
        minItem = item;
      }
    });

    return minItem;
  };

  /**
   * 数组求和
   * @param {Array} arr - 源数组
   * @param {string|Function} [key] - 取值依据
   * @returns {number}
   */
  data.sum = function (arr, key) {
    if (!arr || !arr.length) return 0;

    var total = 0;
    _each(arr, function (_, item) {
      var val = key
        ? (typeof key === 'function' ? key(item) : item[key])
        : item;
      total += Number(val) || 0;
    });

    return total;
  };

  /**
   * 数组平均值
   * @param {Array} arr - 源数组
   * @param {string|Function} [key] - 取值依据
   * @returns {number}
   */
  data.average = function (arr, key) {
    if (!arr || !arr.length) return 0;
    return data.sum(arr, key) / arr.length;
  };

  /**
   * 两个数组的交集
   * @param {Array} arr1 - 数组1
   * @param {Array} arr2 - 数组2
   * @param {Function} [comparator] - 比较函数
   * @returns {Array}
   */
  data.intersection = function (arr1, arr2, comparator) {
    if (!arr1 || !arr2) return [];

    if (!comparator) {
      return arr1.filter(function (item) {
        return arr2.indexOf(item) > -1;
      });
    }

    return arr1.filter(function (item1) {
      return arr2.some(function (item2) {
        return comparator(item1, item2);
      });
    });
  };

  /**
   * 两个数组的差集（arr1 中有但 arr2 中没有的元素）
   * @param {Array} arr1 - 数组1
   * @param {Array} arr2 - 数组2
   * @param {Function} [comparator] - 比较函数
   * @returns {Array}
   */
  data.difference = function (arr1, arr2, comparator) {
    if (!arr1) return [];
    if (!arr2) return arr1.slice();

    if (!comparator) {
      return arr1.filter(function (item) {
        return arr2.indexOf(item) === -1;
      });
    }

    return arr1.filter(function (item1) {
      return !arr2.some(function (item2) {
        return comparator(item1, item2);
      });
    });
  };

  /**
   * 两个数组的并集
   * @param {Array} arr1 - 数组1
   * @param {Array} arr2 - 数组2
   * @returns {Array}
   */
  data.union = function (arr1, arr2) {
    return data.unique((arr1 || []).concat(arr2 || []));
  };

  /**
   * 从对象中提取指定属性
   * @param {Object} obj - 源对象
   * @param {Array} keys - 要提取的属性名数组
   * @returns {Object}
   *
   * @example
   * SZ.utils.data.pick({a:1, b:2, c:3}, ['a', 'c'])
   * // => {a: 1, c: 3}
   */
  data.pick = function (obj, keys) {
    var result = {};
    if (!obj || !keys) return result;

    _each(keys, function (_, key) {
      if (key in obj) {
        result[key] = obj[key];
      }
    });

    return result;
  };

  /**
   * 从对象中排除指定属性
   * @param {Object} obj - 源对象
   * @param {Array} keys - 要排除的属性名数组
   * @returns {Object}
   *
   * @example
   * SZ.utils.data.omit({a:1, b:2, c:3}, ['b'])
   * // => {a: 1, c: 3}
   */
  data.omit = function (obj, keys) {
    var result = {};
    if (!obj) return result;

    var keySet = {};
    _each(keys || [], function (_, key) {
      keySet[key] = true;
    });

    _each(obj, function (key, val) {
      if (!keySet[key]) {
        result[key] = val;
      }
    });

    return result;
  };

  /**
   * 获取对象的第一个键
   * @param {Object} obj - 源对象
   * @returns {string|undefined}
   */
  data.firstKey = function (obj) {
    if (!obj) return undefined;
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return key;
    }
    return undefined;
  };

  /**
   * 获取对象键值对数量
   * @param {Object} obj
   * @returns {number}
   */
  data.size = function (obj) {
    if (obj == null) return 0;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length;
    if (obj instanceof Map || obj instanceof Set) return obj.size;
    return Object.keys(obj).length;
  };

  /**
   * 安全获取嵌套对象属性
   * @param {Object} obj - 源对象
   * @param {string|Array} path - 属性路径，如 'a.b.c' 或 ['a', 'b', 'c']
   * @param {*} [defaultValue] - 默认值
   * @returns {*}
   *
   * @example
   * var obj = { a: { b: { c: 1 } } };
   * SZ.utils.data.get(obj, 'a.b.c') // => 1
   * SZ.utils.data.get(obj, 'a.x.y', 'default') // => 'default'
   */
  data.get = function (obj, path, defaultValue) {
    if (obj == null || path == null) return defaultValue;

    var paths = Array.isArray(path) ? path : path.split('.');
    var result = obj;

    for (var i = 0, len = paths.length; i < len; i++) {
      if (result == null) return defaultValue;
      result = result[paths[i]];
    }

    return result === undefined ? defaultValue : result;
  };

  /**
   * 安全设置嵌套对象属性
   * @param {Object} obj - 源对象
   * @param {string|Array} path - 属性路径
   * @param {*} value - 值
   * @returns {Object}
   */
  data.set = function (obj, path, value) {
    if (obj == null || path == null) return obj;

    var paths = Array.isArray(path) ? path.slice() : path.split('.');
    var current = obj;

    for (var i = 0, len = paths.length - 1; i < len; i++) {
      var key = paths[i];
      if (current[key] == null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[paths[paths.length - 1]] = value;
    return obj;
  };

  /**
   * 浅比较两个值是否相等
   * @param {*} a
   * @param {*} b
   * @returns {boolean}
   */
  data.isEqual = function (a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
      return a.toString() === b.toString();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) {
        if (!data.isEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
      var keysA = Object.keys(a);
      var keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (var j = 0; j < keysA.length; j++) {
        if (!b.hasOwnProperty(keysA[j])) return false;
        if (!data.isEqual(a[keysA[j]], b[keysA[j]])) return false;
      }
      return true;
    }

    return false;
  };


  // ============================================================
  //  存储工具
  // ============================================================

  /**
   * 存储工具模块
   * @namespace SZ.utils.storage
   */
  var storage = utils.storage = {};

  /**
   * Storage 类 - 封装 localStorage，支持过期时间、命名空间
   * @class
   *
   * @example
   * var store = new SZ.utils.storage.Storage('shuzhuo');
   * store.set('user', {name: '张三'}, 3600); // 1小时过期
   * var user = store.get('user');
   */
  storage.Storage = function (namespace, options) {
    this.namespace = namespace || 'sz';
    this.options = options || {};
    this.storage = this.options.session ? window.sessionStorage : window.localStorage;
  };

  /**
   * 获取存储键的完整名称（带命名空间前缀）
   * @param {string} key - 键名
   * @returns {string} 完整键名
   * @private
   */
  storage.Storage.prototype._getKey = function (key) {
    return this.namespace + ':' + key;
  };

  /**
   * 设置存储项
   * @param {string} key - 键名
   * @param {*} value - 值（会自动JSON序列化）
   * @param {number} [expire] - 过期时间（秒），不设置则永不过期
   * @returns {boolean} 是否成功
   */
  storage.Storage.prototype.set = function (key, value, expire) {
    try {
      var data = {
        value: value,
        timestamp: Date.now()
      };

      if (expire && typeof expire === 'number') {
        data.expire = expire * 1000; // 转换为毫秒
      }

      var fullKey = this._getKey(key);
      this.storage.setItem(fullKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Storage set error:', e);
      return false;
    }
  };

  /**
   * 获取存储项
   * @param {string} key - 键名
   * @param {*} [defaultValue] - 默认值
   * @returns {*} 存储的值，如果过期返回默认值
   */
  storage.Storage.prototype.get = function (key, defaultValue) {
    try {
      var fullKey = this._getKey(key);
      var raw = this.storage.getItem(fullKey);

      if (raw == null) return defaultValue;

      var data = JSON.parse(raw);

      // 检查是否过期
      if (data.expire && Date.now() - data.timestamp > data.expire) {
        this.remove(key);
        return defaultValue;
      }

      return data.value;
    } catch (e) {
      console.warn('Storage get error:', e);
      return defaultValue;
    }
  };

  /**
   * 移除存储项
   * @param {string} key - 键名
   * @returns {boolean} 是否成功
   */
  storage.Storage.prototype.remove = function (key) {
    try {
      var fullKey = this._getKey(key);
      this.storage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.warn('Storage remove error:', e);
      return false;
    }
  };

  /**
   * 清空当前命名空间下的所有存储
   * @returns {boolean} 是否成功
   */
  storage.Storage.prototype.clear = function () {
    try {
      var prefix = this.namespace + ':';
      var keysToRemove = [];

      for (var i = 0, len = this.storage.length; i < len; i++) {
        var key = this.storage.key(i);
        if (key && key.indexOf(prefix) === 0) {
          keysToRemove.push(key);
        }
      }

      _each(keysToRemove, function (_, k) {
        this.storage.removeItem(k);
      }.bind(this));

      return true;
    } catch (e) {
      console.warn('Storage clear error:', e);
      return false;
    }
  };

  /**
   * 检查键是否存在（且未过期）
   * @param {string} key - 键名
   * @returns {boolean}
   */
  storage.Storage.prototype.has = function (key) {
    return this.get(key) !== undefined;
  };

  /**
   * 获取存储项数量
   * @returns {number}
   */
  storage.Storage.prototype.size = function () {
    var count = 0;
    var prefix = this.namespace + ':';

    for (var i = 0, len = this.storage.length; i < len; i++) {
      var key = this.storage.key(i);
      if (key && key.indexOf(prefix) === 0) {
        count++;
      }
    }

    return count;
  };

  /**
   * 获取所有键
   * @returns {Array} 键名数组（不含命名空间前缀）
   */
  storage.Storage.prototype.keys = function () {
    var keys = [];
    var prefix = this.namespace + ':';

    for (var i = 0, len = this.storage.length; i < len; i++) {
      var key = this.storage.key(i);
      if (key && key.indexOf(prefix) === 0) {
        keys.push(key.substr(prefix.length));
      }
    }

    return keys;
  };

  /**
   * 获取剩余过期时间（秒）
   * @param {string} key - 键名
   * @returns {number|null} 剩余秒数，永不过期返回null，不存在或已过期返回0
   */
  storage.Storage.prototype.getExpire = function (key) {
    try {
      var fullKey = this._getKey(key);
      var raw = this.storage.getItem(fullKey);

      if (raw == null) return 0;

      var data = JSON.parse(raw);

      if (!data.expire) return null;

      var remaining = data.expire - (Date.now() - data.timestamp);
      return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    } catch (e) {
      return 0;
    }
  };

  // 快捷方法 - 默认存储实例
  var _defaultStorage = new storage.Storage('sz');

  /**
   * 设置存储（使用默认命名空间）
   * @param {string} key
   * @param {*} value
   * @param {number} [expire]
   */
  storage.set = function (key, value, expire) {
    return _defaultStorage.set(key, value, expire);
  };

  /**
   * 获取存储（使用默认命名空间）
   * @param {string} key
   * @param {*} [defaultValue]
   */
  storage.get = function (key, defaultValue) {
    return _defaultStorage.get(key, defaultValue);
  };

  /**
   * 移除存储（使用默认命名空间）
   * @param {string} key
   */
  storage.remove = function (key) {
    return _defaultStorage.remove(key);
  };

  /**
   * 清空存储（使用默认命名空间）
   */
  storage.clear = function () {
    return _defaultStorage.clear();
  };

  /**
   * 检查存储是否可用
   * @returns {boolean}
   */
  storage.isAvailable = function () {
    try {
      var testKey = '__sz_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  // ============================================================
  //  时间工具
  // ============================================================

  /**
   * 时间工具模块
   * @namespace SZ.utils.time
   */
  var time = utils.time = {};

  /**
   * 日期格式化
   * @param {Date|number|string} date - 日期对象、时间戳或日期字符串
   * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式化字符串
   * @returns {string} 格式化后的日期字符串
   *
   * 格式化占位符：
   *   YYYY - 四位年份
   *   YY   - 两位年份
   *   MM   - 月份（补零）
   *   M    - 月份（不补零）
   *   DD   - 日期（补零）
   *   D    - 日期（不补零）
   *   HH   - 24小时制（补零）
   *   H    - 24小时制（不补零）
   *   hh   - 12小时制（补零）
   *   h    - 12小时制（不补零）
   *   mm   - 分钟（补零）
   *   m    - 分钟（不补零）
   *   ss   - 秒（补零）
   *   s    - 秒（不补零）
   *   SSS  - 毫秒（补零）
   *   A    - 上午/下午
   *   a    - 上午/下午（小写）
   *   dddd - 星期全称
   *   ddd  - 星期缩写
   *   dd   - 星期几（数字）
   *
   * @example
   * SZ.utils.time.formatDate(new Date(), 'YYYY-MM-DD')
   * // => '2024-01-15'
   *
   * SZ.utils.time.formatDate(1705276800000, 'YYYY/MM/DD HH:mm')
   * // => '2024/01/15 08:00'
   */
  time.formatDate = function (date, format) {
    date = time.toDate(date);
    if (!date) return '';

    format = format || 'YYYY-MM-DD HH:mm:ss';

    var weekDaysFull = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var weekDaysShort = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    var dayOfWeek = date.getDay();
    var hours12 = hours % 12 || 12;
    var ampm = hours < 12 ? '上午' : '下午';
    var ampml = hours < 12 ? 'am' : 'pm';

    function pad(num, len) {
      num = String(num);
      while (num.length < len) num = '0' + num;
      return num;
    }

    var replacements = {
      'YYYY': year,
      'YY': String(year).slice(-2),
      'MM': pad(month, 2),
      'M': month,
      'DD': pad(day, 2),
      'D': day,
      'HH': pad(hours, 2),
      'H': hours,
      'hh': pad(hours12, 2),
      'h': hours12,
      'mm': pad(minutes, 2),
      'm': minutes,
      'ss': pad(seconds, 2),
      's': seconds,
      'SSS': pad(milliseconds, 3),
      'A': ampm,
      'a': ampml,
      'dddd': weekDaysFull[dayOfWeek],
      'ddd': weekDaysShort[dayOfWeek],
      'dd': dayOfWeek
    };

    // 按长度从长到短排序，避免短的先替换
    var tokens = Object.keys(replacements).sort(function (a, b) {
      return b.length - a.length;
    });

    var result = format;
    _each(tokens, function (_, token) {
      result = result.replace(new RegExp(token, 'g'), replacements[token]);
    });

    return result;
  };

  /**
   * 转换为 Date 对象
   * @param {Date|number|string} val
   * @returns {Date|null}
   */
  time.toDate = function (val) {
    if (val instanceof Date) return val;
    if (val == null) return null;

    if (typeof val === 'number') {
      return new Date(val);
    }

    if (typeof val === 'string') {
      // 处理各种日期字符串格式
      // 替换 - 为 / 以兼容 Safari
      var dateStr = val.replace(/-/g, '/');
      var date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;

      // 尝试 ISO 格式
      date = new Date(val);
      if (!isNaN(date.getTime())) return date;

      return null;
    }

    return null;
  };

  /**
   * 时长格式化（秒转换为可读时间）
   * @param {number} seconds - 秒数
   * @param {Object} [options] - 选项
   * @param {boolean} [options.padZero=true] - 是否补零
   * @param {boolean} [options.showHour=true] - 是否显示小时
   * @param {boolean} [options.showDay=false] - 是否显示天
   * @returns {string}
   *
   * @example
   * SZ.utils.time.formatDuration(3661) // => '01:01:01'
   * SZ.utils.time.formatDuration(65) // => '01:05'
   */
  time.formatDuration = function (seconds, options) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));
    options = options || {};

    var padZero = options.padZero !== false;
    var showHour = options.showHour !== false;
    var showDay = options.showDay === true;

    function pad(num) {
      return padZero && num < 10 ? '0' + num : String(num);
    }

    var days = 0;
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;

    if (showDay) {
      days = Math.floor(hours / 24);
      hours = hours % 24;
      return days + '天 ' + pad(hours) + ':' + pad(minutes) + ':' + pad(secs);
    }

    if (showHour || hours > 0) {
      return pad(hours) + ':' + pad(minutes) + ':' + pad(secs);
    }

    return pad(minutes) + ':' + pad(secs);
  };

  /**
   * 时长格式化（中文友好格式）
   * @param {number} seconds - 秒数
   * @returns {string}
   *
   * @example
   * SZ.utils.time.formatDurationCN(3661) // => '1小时1分1秒'
   * SZ.utils.time.formatDurationCN(65) // => '1分5秒'
   */
  time.formatDurationCN = function (seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));

    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;

    var parts = [];
    if (days > 0) parts.push(days + '天');
    if (hours > 0) parts.push(hours + '小时');
    if (minutes > 0) parts.push(minutes + '分');
    if (secs > 0 || parts.length === 0) parts.push(secs + '秒');

    return parts.join('');
  };

  /**
   * 获取今天的开始时间（0点）
   * @returns {Date}
   */
  time.getToday = function () {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  /**
   * 获取本周的开始时间（周一0点）
   * @returns {Date}
   */
  time.getWeek = function () {
    var now = new Date();
    var day = now.getDay() || 7; // 周日为7
    now.setDate(now.getDate() - day + 1);
    now.setHours(0, 0, 0, 0);
    return now;
  };

  /**
   * 获取本月的开始时间（1号0点）
   * @returns {Date}
   */
  time.getMonth = function () {
    var now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  };

  /**
   * 获取今年的开始时间
   * @returns {Date}
   */
  time.getYear = function () {
    var now = new Date();
    now.setMonth(0, 1);
    now.setHours(0, 0, 0, 0);
    return now;
  };

  /**
   * 相对时间（几分钟前、几小时前等）
   * @param {Date|number|string} date - 日期
   * @param {Object} [options] - 选项
   * @param {boolean} [options.justNow=true] - 是否显示"刚刚"
   * @returns {string}
   *
   * @example
   * SZ.utils.time.relativeTime(new Date()) // => '刚刚'
   * SZ.utils.time.relativeTime(Date.now() - 3600000) // => '1小时前'
   * SZ.utils.time.relativeTime(Date.now() - 86400000) // => '1天前'
   */
  time.relativeTime = function (date, options) {
    date = time.toDate(date);
    if (!date) return '';

    options = options || {};
    var justNow = options.justNow !== false;

    var now = Date.now();
    var diff = now - date.getTime();
    var absDiff = Math.abs(diff);
    var isFuture = diff < 0;

    var second = 1000;
    var minute = 60 * second;
    var hour = 60 * minute;
    var day = 24 * hour;
    var month = 30 * day;
    var year = 365 * day;

    var result;

    if (absDiff < minute) {
      result = justNow ? '刚刚' : Math.floor(absDiff / second) + '秒';
    } else if (absDiff < hour) {
      result = Math.floor(absDiff / minute) + '分钟';
    } else if (absDiff < day) {
      result = Math.floor(absDiff / hour) + '小时';
    } else if (absDiff < month) {
      result = Math.floor(absDiff / day) + '天';
    } else if (absDiff < year) {
      result = Math.floor(absDiff / month) + '个月';
    } else {
      result = Math.floor(absDiff / year) + '年';
    }

    if (absDiff >= minute) {
      result += isFuture ? '后' : '前';
    }

    return result;
  };

  /**
   * 判断是否为今天
   * @param {Date|number|string} date
   * @returns {boolean}
   */
  time.isToday = function (date) {
    date = time.toDate(date);
    if (!date) return false;

    var today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  /**
   * 判断是否为昨天
   * @param {Date|number|string} date
   * @returns {boolean}
   */
  time.isYesterday = function (date) {
    date = time.toDate(date);
    if (!date) return false;

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getFullYear() === yesterday.getFullYear() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getDate() === yesterday.getDate();
  };

  /**
   * 判断是否为明天
   * @param {Date|number|string} date
   * @returns {boolean}
   */
  time.isTomorrow = function (date) {
    date = time.toDate(date);
    if (!date) return false;

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getFullYear() === tomorrow.getFullYear() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getDate() === tomorrow.getDate();
  };

  /**
   * 判断是否为同一年
   * @param {Date|number|string} date1
   * @param {Date|number|string} date2
   * @returns {boolean}
   */
  time.isSameYear = function (date1, date2) {
    var d1 = time.toDate(date1);
    var d2 = time.toDate(date2);
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear();
  };

  /**
   * 判断是否为同一月
   * @param {Date|number|string} date1
   * @param {Date|number|string} date2
   * @returns {boolean}
   */
  time.isSameMonth = function (date1, date2) {
    var d1 = time.toDate(date1);
    var d2 = time.toDate(date2);
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
  };

  /**
   * 判断是否为同一天
   * @param {Date|number|string} date1
   * @param {Date|number|string} date2
   * @returns {boolean}
   */
  time.isSameDay = function (date1, date2) {
    var d1 = time.toDate(date1);
    var d2 = time.toDate(date2);
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  /**
   * 获取两个日期之间的天数差
   * @param {Date|number|string} date1
   * @param {Date|number|string} date2
   * @returns {number}
   */
  time.diffDays = function (date1, date2) {
    var d1 = time.toDate(date1);
    var d2 = time.toDate(date2);
    if (!d1 || !d2) return 0;

    var ms1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    var ms2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();

    return Math.floor((ms2 - ms1) / (24 * 60 * 60 * 1000));
  };

  /**
   * 日期加法
   * @param {Date|number|string} date - 基准日期
   * @param {number} amount - 数量
   * @param {string} unit - 单位：'year', 'month', 'day', 'hour', 'minute', 'second'
   * @returns {Date}
   */
  time.add = function (date, amount, unit) {
    date = time.toDate(date);
    if (!date) return null;

    var result = new Date(date.getTime());
    amount = Number(amount) || 0;

    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + amount);
        break;
    }

    return result;
  };

  /**
   * 获取当月第一天
   * @param {Date|number|string} [date] - 基准日期，默认当前
   * @returns {Date}
   */
  time.getFirstDayOfMonth = function (date) {
    var d = time.toDate(date) || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  /**
   * 获取当月最后一天
   * @param {Date|number|string} [date] - 基准日期，默认当前
   * @returns {Date}
   */
  time.getLastDayOfMonth = function (date) {
    var d = time.toDate(date) || new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  /**
   * 获取当月天数
   * @param {Date|number|string} [date] - 基准日期，默认当前
   * @returns {number}
   */
  time.getDaysInMonth = function (date) {
    var d = time.toDate(date) || new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  };

  /**
   * 获取当前时间戳（秒）
   * @returns {number}
   */
  time.timestamp = function () {
    return Math.floor(Date.now() / 1000);
  };

  /**
   * 获取当前毫秒时间戳
   * @returns {number}
   */
  time.timestampMs = function () {
    return Date.now();
  };

  /**
   * 友好的日期显示（今天/昨天/前天/日期）
   * @param {Date|number|string} date
   * @param {string} [format] - 非近期日期的格式化方式
   * @returns {string}
   */
  time.friendlyDate = function (date, format) {
    date = time.toDate(date);
    if (!date) return '';

    format = format || 'YYYY-MM-DD';
    var diff = time.diffDays(new Date(), date);

    if (diff === 0) return '今天';
    if (diff === -1) return '昨天';
    if (diff === -2) return '前天';
    if (diff === 1) return '明天';
    if (diff === 2) return '后天';

    // 近7天显示星期几
    if (Math.abs(diff) < 7) {
      var weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weeks[date.getDay()];
    }

    return time.formatDate(date, format);
  };

  /**
   * 友好的日期时间显示
   * @param {Date|number|string} date
   * @returns {string}
   */
  time.friendlyDateTime = function (date) {
    date = time.toDate(date);
    if (!date) return '';

    var datePart = time.friendlyDate(date);
    var timePart = time.formatDate(date, 'HH:mm');

    return datePart + ' ' + timePart;
  };


  // ============================================================
  //  字符串工具
  // ============================================================

  /**
   * 字符串工具模块
   * @namespace SZ.utils.string
   */
  var strUtil = utils.string = {};

  /**
   * 去除字符串首尾空白字符
   * @param {string} str - 输入字符串
   * @returns {string}
   */
  strUtil.trim = function (str) {
    if (str == null) return '';
    return String.prototype.trim.call(String(str));
  };

  /**
   * 去除字符串左侧空白字符
   * @param {string} str
   * @returns {string}
   */
  strUtil.trimLeft = function (str) {
    if (str == null) return '';
    return String(str).replace(/^\s+/, '');
  };

  /**
   * 去除字符串右侧空白字符
   * @param {string} str
   * @returns {string}
   */
  strUtil.trimRight = function (str) {
    if (str == null) return '';
    return String(str).replace(/\s+$/, '');
  };

  /**
   * HTML转义（防止XSS攻击）
   * @param {string} str - 输入字符串
   * @returns {string} 转义后的字符串
   *
   * @example
   * SZ.utils.string.escapeHtml('<script>alert("xss")</script>')
   * // => '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
   */
  strUtil.escapeHtml = function (str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/`/g, '&#96;');
  };

  /**
   * HTML反转义
   * @param {string} str - 转义后的字符串
   * @returns {string} 原始字符串
   */
  strUtil.unescapeHtml = function (str) {
    if (str == null) return '';
    return String(str)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#96;/g, '`');
  };

  /**
   * 截断字符串（超出长度显示省略号）
   * @param {string} str - 输入字符串
   * @param {number} len - 最大长度
   * @param {string} [suffix='...'] - 省略符
   * @returns {string}
   *
   * @example
   * SZ.utils.string.truncate('Hello World', 8) // => 'Hello...'
   * SZ.utils.string.truncate('Hello', 10) // => 'Hello'
   */
  strUtil.truncate = function (str, len, suffix) {
    if (str == null) return '';
    str = String(str);
    if (len == null || str.length <= len) return str;

    suffix = suffix == null ? '...' : String(suffix);
    return str.slice(0, len - suffix.length) + suffix;
  };

  /**
   * 按字节数截断字符串（中文占2字节）
   * @param {string} str - 输入字符串
   * @param {number} len - 最大字节长度
   * @param {string} [suffix='...'] - 省略符
   * @returns {string}
   */
  strUtil.truncateByBytes = function (str, len, suffix) {
    if (str == null) return '';
    str = String(str);
    suffix = suffix == null ? '...' : String(suffix);

    var byteLen = 0;
    var result = '';

    for (var i = 0; i < str.length; i++) {
      byteLen += str.charCodeAt(i) > 127 ? 2 : 1;
      if (byteLen > len - suffix.length) {
        return result + suffix;
      }
      result += str[i];
    }

    return str;
  };

  /**
   * 首字母大写
   * @param {string} str
   * @returns {string}
   */
  strUtil.capitalize = function (str) {
    if (str == null || str === '') return '';
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  /**
   * 首字母小写
   * @param {string} str
   * @returns {string}
   */
  strUtil.uncapitalize = function (str) {
    if (str == null || str === '') return '';
    str = String(str);
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  /**
   * 转换为驼峰命名
   * @param {string} str - 输入字符串（如 'user-name' 或 'user_name'）
   * @returns {string}
   *
   * @example
   * SZ.utils.string.toCamelCase('user-name') // => 'userName'
   * SZ.utils.string.toCamelCase('user_name') // => 'userName'
   */
  strUtil.toCamelCase = function (str) {
    if (str == null) return '';
    return String(str).replace(/[-_\s]+(.)?/g, function (_, c) {
      return c ? c.toUpperCase() : '';
    });
  };

  /**
   * 转换为短横线命名
   * @param {string} str
   * @returns {string}
   */
  strUtil.toKebabCase = function (str) {
    if (str == null) return '';
    return String(str)
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  };

  /**
   * 转换为下划线命名
   * @param {string} str
   * @returns {string}
   */
  strUtil.toSnakeCase = function (str) {
    if (str == null) return '';
    return String(str)
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  };

  /**
   * 生成UUID (RFC4122 v4)
   * @returns {string} UUID字符串
   *
   * @example
   * SZ.utils.string.uuid()
   * // => '550e8400-e29b-41d4-a716-446655440000'
   */
  strUtil.uuid = function () {
    // 使用 crypto API（如果可用）
    if (global.crypto && global.crypto.getRandomValues) {
      var bytes = new Uint8Array(16);
      global.crypto.getRandomValues(bytes);

      // 设置版本（4）和变体（10）
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      var hex = [];
      for (var i = 0; i < 16; i++) {
        hex.push(('0' + bytes[i].toString(16)).slice(-2));
      }

      return hex.slice(0, 4).join('') + '-' +
             hex.slice(4, 6).join('') + '-' +
             hex.slice(6, 8).join('') + '-' +
             hex.slice(8, 10).join('') + '-' +
             hex.slice(10, 16).join('');
    }

    // 降级方案：使用 Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  /**
   * 生成短ID
   * @param {number} [length=8] - ID长度
   * @returns {string}
   */
  strUtil.shortId = function (length) {
    length = length || 8;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';

    if (global.crypto && global.crypto.getRandomValues) {
      var bytes = new Uint8Array(length);
      global.crypto.getRandomValues(bytes);
      for (var i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }
    } else {
      for (var j = 0; j < length; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return result;
  };

  /**
   * 计算两个字符串的编辑距离（Levenshtein距离）
   * @param {string} a - 字符串A
   * @param {string} b - 字符串B
   * @returns {number} 编辑距离
   *
   * @example
   * SZ.utils.string.levenshtein('kitten', 'sitting') // => 3
   * SZ.utils.string.levenshtein('flaw', 'lawn') // => 2
   */
  strUtil.levenshtein = function (a, b) {
    if (a == null) a = '';
    if (b == null) b = '';
    a = String(a);
    b = String(b);

    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // 使用一维数组优化空间复杂度
    var prev = new Array(b.length + 1);
    var curr = new Array(b.length + 1);

    for (var j = 0; j <= b.length; j++) {
      prev[j] = j;
    }

    for (var i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (var k = 1; k <= b.length; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        curr[k] = Math.min(
          curr[k - 1] + 1,      // 插入
          prev[k] + 1,          // 删除
          prev[k - 1] + cost    // 替换
        );
      }
      // 交换 prev 和 curr
      var temp = prev;
      prev = curr;
      curr = temp;
    }

    return prev[b.length];
  };

  /**
   * 计算字符串相似度（基于编辑距离）
   * @param {string} a
   * @param {string} b
   * @returns {number} 相似度 0-1
   */
  strUtil.similarity = function (a, b) {
    if (a == null || b == null) return 0;
    a = String(a);
    b = String(b);

    if (a === b) return 1;
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    var distance = strUtil.levenshtein(a, b);
    var maxLen = Math.max(a.length, b.length);
    return 1 - distance / maxLen;
  };

  /**
   * 关键词高亮（用HTML标签包裹关键词）
   * @param {string} text - 原始文本
   * @param {string} keyword - 关键词
   * @param {string} [tagName='em'] - 包裹标签
   * @param {string} [className] - 标签类名
   * @returns {string} 高亮后的HTML字符串
   *
   * @example
   * SZ.utils.string.highlight('Hello World', 'world')
   * // => 'Hello <em>World</em>'
   */
  strUtil.highlight = function (text, keyword, tagName, className) {
    if (text == null || !keyword) return text || '';

    tagName = tagName || 'em';
    text = String(text);
    keyword = String(keyword);

    // 转义关键词中的特殊正则字符
    var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(' + escapedKeyword + ')', 'gi');

    var classAttr = className ? ' class="' + strUtil.escapeHtml(className) + '"' : '';
    var openTag = '<' + tagName + classAttr + '>';
    var closeTag = '</' + tagName + '>';

    return text.replace(regex, openTag + '$1' + closeTag);
  };

  /**
   * 字符串重复
   * @param {string} str - 源字符串
   * @param {number} count - 重复次数
   * @returns {string}
   */
  strUtil.repeat = function (str, count) {
    if (str == null) return '';
    count = Math.max(0, Math.floor(count) || 0);
    return String(str).repeat ? String(str).repeat(count) : new Array(count + 1).join(str);
  };

  /**
   * 左侧填充字符串到指定长度
   * @param {string} str - 源字符串
   * @param {number} len - 目标长度
   * @param {string} [char=' '] - 填充字符
   * @returns {string}
   */
  strUtil.padStart = function (str, len, char) {
    if (str == null) str = '';
    str = String(str);
    if (str.length >= len) return str;
    char = char == null ? ' ' : String(char);
    var padLen = len - str.length;
    var padStr = char.repeat ? char.repeat(padLen) : new Array(padLen + 1).join(char);
    return padStr.slice(0, padLen) + str;
  };

  /**
   * 右侧填充字符串到指定长度
   * @param {string} str - 源字符串
   * @param {number} len - 目标长度
   * @param {string} [char=' '] - 填充字符
   * @returns {string}
   */
  strUtil.padEnd = function (str, len, char) {
    if (str == null) str = '';
    str = String(str);
    if (str.length >= len) return str;
    char = char == null ? ' ' : String(char);
    var padLen = len - str.length;
    var padStr = char.repeat ? char.repeat(padLen) : new Array(padLen + 1).join(char);
    return str + padStr.slice(0, padLen);
  };

  /**
   * 判断字符串是否以指定子串开头
   * @param {string} str
   * @param {string} prefix
   * @returns {boolean}
   */
  strUtil.startsWith = function (str, prefix) {
    if (str == null || prefix == null) return false;
    str = String(str);
    if (str.startsWith) return str.startsWith(prefix);
    return str.slice(0, prefix.length) === prefix;
  };

  /**
   * 判断字符串是否以指定子串结尾
   * @param {string} str
   * @param {string} suffix
   * @returns {boolean}
   */
  strUtil.endsWith = function (str, suffix) {
    if (str == null || suffix == null) return false;
    str = String(str);
    if (str.endsWith) return str.endsWith(suffix);
    return str.slice(-suffix.length) === suffix;
  };

  /**
   * 判断字符串是否包含指定子串
   * @param {string} str
   * @param {string} substring
   * @returns {boolean}
   */
  strUtil.includes = function (str, substring) {
    if (str == null || substring == null) return false;
    str = String(str);
    if (str.includes) return str.includes(substring);
    return str.indexOf(substring) > -1;
  };

  /**
   * 字符串反转
   * @param {string} str
   * @returns {string}
   */
  strUtil.reverse = function (str) {
    if (str == null) return '';
    return String(str).split('').reverse().join('');
  };

  /**
   * 获取字符串的字节长度（中文占2字节）
   * @param {string} str
   * @returns {number}
   */
  strUtil.byteLength = function (str) {
    if (str == null) return 0;
    str = String(str);
    var len = 0;
    for (var i = 0; i < str.length; i++) {
      len += str.charCodeAt(i) > 127 ? 2 : 1;
    }
    return len;
  };

  /**
   * 首字母大写每个单词
   * @param {string} str
   * @returns {string}
   */
  strUtil.titleCase = function (str) {
    if (str == null) return '';
    return String(str).replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  };

  /**
   * 去除HTML标签
   * @param {string} str
   * @returns {string}
   */
  strUtil.stripHtml = function (str) {
    if (str == null) return '';
    return String(str).replace(/<[^>]*>/g, '');
  };

  /**
   * 转义正则特殊字符
   * @param {string} str
   * @returns {string}
   */
  strUtil.escapeRegExp = function (str) {
    if (str == null) return '';
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  /**
   * 模板字符串替换
   * @param {string} template - 模板字符串，使用 {key} 作为占位符
   * @param {Object} data - 数据对象
   * @returns {string}
   *
   * @example
   * SZ.utils.string.template('Hello {name}!', { name: 'World' })
   * // => 'Hello World!'
   */
  strUtil.template = function (template, data) {
    if (template == null) return '';
    if (!data) return template;

    return String(template).replace(/\{(\w+)\}/g, function (match, key) {
      return data.hasOwnProperty(key) ? data[key] : match;
    });
  };

  // ============================================================
  //  数学工具
  // ============================================================

  /**
   * 数学工具模块
   * @namespace SZ.utils.math
   */
  var math = utils.math = {};

  /**
   * 将值限制在指定范围内
   * @param {number} value - 输入值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number}
   *
   * @example
   * SZ.utils.math.clamp(5, 0, 10) // => 5
   * SZ.utils.math.clamp(-1, 0, 10) // => 0
   * SZ.utils.math.clamp(15, 0, 10) // => 10
   */
  math.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  /**
   * 线性插值
   * @param {number} a - 起始值
   * @param {number} b - 结束值
   * @param {number} t - 插值因子 (0-1)
   * @returns {number}
   *
   * @example
   * SZ.utils.math.lerp(0, 100, 0.5) // => 50
   */
  math.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  /**
   * 数值映射 - 将值从一个范围映射到另一个范围
   * @param {number} value - 输入值
   * @param {number} inMin - 输入范围最小值
   * @param {number} inMax - 输入范围最大值
   * @param {number} outMin - 输出范围最小值
   * @param {number} outMax - 输出范围最大值
   * @param {boolean} [clamp=false] - 是否限制在输出范围内
   * @returns {number}
   *
   * @example
   * SZ.utils.math.map(50, 0, 100, 0, 255) // => 127.5
   */
  math.map = function (value, inMin, inMax, outMin, outMax, clamp) {
    if (inMax === inMin) return outMin;
    var result = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    if (clamp) {
      result = math.clamp(result, outMin, outMax);
    }
    return result;
  };

  /**
   * 计算百分比
   * @param {number} value - 当前值
   * @param {number} total - 总值
   * @param {number} [decimals=0] - 小数位数
   * @returns {number}
   *
   * @example
   * SZ.utils.math.percent(25, 100) // => 25
   * SZ.utils.math.percent(1, 3, 2) // => 33.33
   */
  math.percent = function (value, total, decimals) {
    if (total === 0) return 0;
    var result = (value / total) * 100;
    if (decimals != null) {
      var factor = Math.pow(10, decimals);
      return Math.round(result * factor) / factor;
    }
    return result;
  };

  /**
   * 计算反百分比
   * @param {number} percent - 百分比
   * @param {number} total - 总值
   * @returns {number}
   */
  math.percentOf = function (percent, total) {
    return (percent / 100) * total;
  };

  /**
   * 判断数值是否在指定范围内
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @param {boolean} [inclusive=true] - 是否包含边界值
   * @returns {boolean}
   */
  math.inRange = function (value, min, max, inclusive) {
    if (inclusive === false) {
      return value > min && value < max;
    }
    return value >= min && value <= max;
  };

  /**
   * 取最近的整数
   * @param {number} value
   * @param {number} [step=1] - 取整步长
   * @returns {number}
   *
   * @example
   * SZ.utils.math.roundTo(17, 10) // => 20
   * SZ.utils.math.roundTo(13, 5) // => 15
   */
  math.roundTo = function (value, step) {
    step = step || 1;
    return Math.round(value / step) * step;
  };

  /**
   * 向下取最近的整数
   * @param {number} value
   * @param {number} [step=1]
   * @returns {number}
   */
  math.floorTo = function (value, step) {
    step = step || 1;
    return Math.floor(value / step) * step;
  };

  /**
   * 向上取最近的整数
   * @param {number} value
   * @param {number} [step=1]
   * @returns {number}
   */
  math.ceilTo = function (value, step) {
    step = step || 1;
    return Math.ceil(value / step) * step;
  };

  /**
   * 数字格式化（千分位分隔）
   * @param {number} num - 数字
   * @param {number} [decimals] - 小数位数
   * @returns {string}
   *
   * @example
   * SZ.utils.math.formatNumber(1234567.89) // => '1,234,567.89'
   * SZ.utils.math.formatNumber(1234.5, 2) // => '1,234.50'
   */
  math.formatNumber = function (num, decimals) {
    if (num == null || isNaN(num)) return '';
    num = Number(num);

    var parts;
    if (decimals != null) {
      parts = num.toFixed(decimals).split('.');
    } else {
      parts = String(num).split('.');
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  /**
   * 文件大小格式化
   * @param {number} bytes - 字节数
   * @param {number} [decimals=2] - 小数位数
   * @returns {string}
   *
   * @example
   * SZ.utils.math.formatBytes(1024) // => '1.00 KB'
   * SZ.utils.math.formatBytes(1048576) // => '1.00 MB'
   */
  math.formatBytes = function (bytes, decimals) {
    if (bytes == null || isNaN(bytes)) return '';
    if (bytes === 0) return '0 B';

    decimals = decimals == null ? 2 : decimals;
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    i = Math.min(i, sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  /**
   * 计算最大公约数
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  math.gcd = function (a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  /**
   * 计算最小公倍数
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  math.lcm = function (a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / math.gcd(a, b);
  };

  /**
   * 阶乘
   * @param {number} n
   * @returns {number}
   */
  math.factorial = function (n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    var result = 1;
    for (var i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  /**
   * 斐波那契数列第n项
   * @param {number} n
   * @returns {number}
   */
  math.fibonacci = function (n) {
    if (n < 0) return NaN;
    if (n === 0) return 0;
    if (n === 1) return 1;
    var a = 0, b = 1;
    for (var i = 2; i <= n; i++) {
      var temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  };

  /**
   * 判断是否为质数
   * @param {number} n
   * @returns {boolean}
   */
  math.isPrime = function (n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    var i = 5;
    while (i * i <= n) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
      i += 6;
    }
    return true;
  };

  /**
   * 角度转弧度
   * @param {number} degrees - 角度
   * @returns {number} 弧度
   */
  math.degToRad = function (degrees) {
    return degrees * (Math.PI / 180);
  };

  /**
   * 弧度转角度
   * @param {number} radians - 弧度
   * @returns {number} 角度
   */
  math.radToDeg = function (radians) {
    return radians * (180 / Math.PI);
  };

  /**
   * 两点之间的距离
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  math.distance = function (x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * 三点角度（以p2为顶点）
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @returns {number} 角度（弧度）
   */
  math.angle = function (x1, y1, x2, y2, x3, y3) {
    var v1x = x1 - x2;
    var v1y = y1 - y2;
    var v2x = x3 - x2;
    var v2y = y3 - y2;
    var dot = v1x * v2x + v1y * v2y;
    var mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    var mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
    if (mag1 === 0 || mag2 === 0) return 0;
    return Math.acos(dot / (mag1 * mag2));
  };

  /**
   * 正态分布随机数（Box-Muller变换）
   * @param {number} [mean=0] - 均值
   * @param {number} [stdDev=1] - 标准差
   * @returns {number}
   */
  math.normalRandom = function (mean, stdDev) {
    mean = mean || 0;
    stdDev = stdDev || 1;
    var u1 = Math.random();
    var u2 = Math.random();
    var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  };

  /**
   * 加权随机选择
   * @param {Array} items - 选项数组
   * @param {Array|Function} weights - 权重数组或权重函数
   * @returns {*} 选中的项
   *
   * @example
   * SZ.utils.math.weightedRandom(['a', 'b', 'c'], [10, 20, 30])
   * // => 'c' 的概率最高
   */
  math.weightedRandom = function (items, weights) {
    if (!items || !items.length) return undefined;

    var weightArr = typeof weights === 'function'
      ? items.map(weights)
      : (weights || items.map(function () { return 1; }));

    var totalWeight = weightArr.reduce(function (sum, w) { return sum + w; }, 0);
    var random = Math.random() * totalWeight;

    for (var i = 0; i < items.length; i++) {
      random -= weightArr[i];
      if (random <= 0) return items[i];
    }

    return items[items.length - 1];
  };

  /**
   * 四舍五入到指定小数位
   * @param {number} value
   * @param {number} [decimals=0]
   * @returns {number}
   */
  math.round = function (value, decimals) {
    decimals = decimals || 0;
    var factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  /**
   * 数字精度修正（解决浮点运算精度问题）
   * @param {number} value
   * @param {number} [precision=12]
   * @returns {number}
   *
   * @example
   * 0.1 + 0.2 // => 0.30000000000000004
   * SZ.utils.math.precision(0.1 + 0.2) // => 0.3
   */
  math.precision = function (value, precision) {
    precision = precision || 12;
    return parseFloat(value.toPrecision(precision));
  };


  // ============================================================
  //  颜色工具
  // ============================================================

  /**
   * 颜色工具模块
   * @namespace SZ.utils.color
   */
  var color = utils.color = {};

  /**
   * HEX 颜色转 RGB
   * @param {string} hex - HEX颜色值，如 '#ff0000' 或 '#f00'
   * @returns {{r: number, g: number, b: number}|null} RGB对象
   *
   * @example
   * SZ.utils.color.hexToRgb('#ff0000') // => { r: 255, g: 0, b: 0 }
   */
  color.hexToRgb = function (hex) {
    if (!hex || typeof hex !== 'string') return null;

    // 去掉 # 号
    hex = hex.replace('#', '');

    // 支持 3 位缩写
    if (hex.length === 3) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }

    if (hex.length !== 6) return null;

    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  };

  /**
   * RGB 转 HEX 颜色
   * @param {number} r - 红色 (0-255)
   * @param {number} g - 绿色 (0-255)
   * @param {number} b - 蓝色 (0-255)
   * @returns {string} HEX颜色值
   *
   * @example
   * SZ.utils.color.rgbToHex(255, 0, 0) // => '#ff0000'
   */
  color.rgbToHex = function (r, g, b) {
    function componentToHex(c) {
      c = Math.max(0, Math.min(255, Math.round(c)));
      var hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }

    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  /**
   * HSL 转 RGB
   * @param {number} h - 色相 (0-360)
   * @param {number} s - 饱和度 (0-100)
   * @param {number} l - 亮度 (0-100)
   * @returns {{r: number, g: number, b: number}}
   *
   * @example
   * SZ.utils.color.hslToRgb(0, 100, 50) // => { r: 255, g: 0, b: 0 }
   */
  color.hslToRgb = function (h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r, g, b;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  /**
   * RGB 转 HSL
   * @param {number} r - 红色 (0-255)
   * @param {number} g - 绿色 (0-255)
   * @param {number} b - 蓝色 (0-255)
   * @returns {{h: number, s: number, l: number}}
   *
   * @example
   * SZ.utils.color.rgbToHsl(255, 0, 0) // => { h: 0, s: 100, l: 50 }
   */
  color.rgbToHsl = function (r, g, b) {
    r = Math.max(0, Math.min(255, r)) / 255;
    g = Math.max(0, Math.min(255, g)) / 255;
    b = Math.max(0, Math.min(255, b)) / 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  /**
   * HEX 转 HSL
   * @param {string} hex
   * @returns {{h: number, s: number, l: number}|null}
   */
  color.hexToHsl = function (hex) {
    var rgb = color.hexToRgb(hex);
    if (!rgb) return null;
    return color.rgbToHsl(rgb.r, rgb.g, rgb.b);
  };

  /**
   * HSL 转 HEX
   * @param {number} h
   * @param {number} s
   * @param {number} l
   * @returns {string}
   */
  color.hslToHex = function (h, s, l) {
    var rgb = color.hslToRgb(h, s, l);
    return color.rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  /**
   * 解析颜色字符串为RGB对象
   * @param {string} colorStr - 颜色字符串（hex, rgb, rgba, hsl, hsla）
   * @returns {{r: number, g: number, b: number, a: number}|null}
   */
  color.parse = function (colorStr) {
    if (!colorStr || typeof colorStr !== 'string') return null;

    colorStr = colorStr.trim().toLowerCase();

    // HEX
    if (colorStr.charAt(0) === '#') {
      var rgb = color.hexToRgb(colorStr);
      if (rgb) return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
      return null;
    }

    // rgb() / rgba()
    var rgbMatch = colorStr.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
        a: rgbMatch[4] != null ? parseFloat(rgbMatch[4]) : 1
      };
    }

    // hsl() / hsla()
    var hslMatch = colorStr.match(/^hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/);
    if (hslMatch) {
      var hslRgb = color.hslToRgb(
        parseInt(hslMatch[1], 10),
        parseFloat(hslMatch[2]),
        parseFloat(hslMatch[3])
      );
      return {
        r: hslRgb.r,
        g: hslRgb.g,
        b: hslRgb.b,
        a: hslMatch[4] != null ? parseFloat(hslMatch[4]) : 1
      };
    }

    // 命名颜色（支持常见的）
    var namedColors = {
      'white': [255, 255, 255],
      'black': [0, 0, 0],
      'red': [255, 0, 0],
      'green': [0, 128, 0],
      'blue': [0, 0, 255],
      'yellow': [255, 255, 0],
      'cyan': [0, 255, 255],
      'magenta': [255, 0, 255],
      'gray': [128, 128, 128],
      'grey': [128, 128, 128],
      'orange': [255, 165, 0],
      'purple': [128, 0, 128],
      'pink': [255, 192, 203],
      'brown': [165, 42, 42],
      'transparent': [0, 0, 0]
    };

    if (namedColors[colorStr]) {
      var nc = namedColors[colorStr];
      return {
        r: nc[0],
        g: nc[1],
        b: nc[2],
        a: colorStr === 'transparent' ? 0 : 1
      };
    }

    return null;
  };

  /**
   * RGB对象转为字符串
   * @param {{r: number, g: number, b: number, a?: number}} rgb
   * @returns {string}
   */
  color.toRgbString = function (rgb) {
    if (!rgb) return '';
    if (rgb.a != null && rgb.a < 1) {
      return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + rgb.a + ')';
    }
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
  };

  /**
   * RGB对象转为HEX字符串
   * @param {{r: number, g: number, b: number}} rgb
   * @returns {string}
   */
  color.toHexString = function (rgb) {
    if (!rgb) return '';
    return color.rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  /**
   * RGB对象转为HSL字符串
   * @param {{r: number, g: number, b: number, a?: number}} rgb
   * @returns {string}
   */
  color.toHslString = function (rgb) {
    if (!rgb) return '';
    var hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    if (rgb.a != null && rgb.a < 1) {
      return 'hsla(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%, ' + rgb.a + ')';
    }
    return 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
  };

  /**
   * 颜色变亮
   * @param {string} colorStr - 颜色字符串
   * @param {number} percent - 变亮百分比 (0-100)
   * @returns {string} HEX颜色值
   *
   * @example
   * SZ.utils.color.lighten('#000000', 50) // => '#808080'
   */
  color.lighten = function (colorStr, percent) {
    var rgb = color.parse(colorStr);
    if (!rgb) return colorStr;

    var hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + percent);

    var newRgb = color.hslToRgb(hsl.h, hsl.s, hsl.l);
    return color.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  };

  /**
   * 颜色变暗
   * @param {string} colorStr - 颜色字符串
   * @param {number} percent - 变暗百分比 (0-100)
   * @returns {string} HEX颜色值
   *
   * @example
   * SZ.utils.color.darken('#ffffff', 50) // => '#808080'
   */
  color.darken = function (colorStr, percent) {
    var rgb = color.parse(colorStr);
    if (!rgb) return colorStr;

    var hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - percent);

    var newRgb = color.hslToRgb(hsl.h, hsl.s, hsl.l);
    return color.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  };

  /**
   * 颜色饱和度调整
   * @param {string} colorStr
   * @param {number} percent - 正值增加饱和度，负值减少
   * @returns {string}
   */
  color.saturate = function (colorStr, percent) {
    var rgb = color.parse(colorStr);
    if (!rgb) return colorStr;

    var hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.max(0, Math.min(100, hsl.s + percent));

    var newRgb = color.hslToRgb(hsl.h, hsl.s, hsl.l);
    return color.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  };

  /**
   * 获取对比色（黑色或白色）
   * 根据颜色亮度返回黑色或白色，用于文本在彩色背景上的可读性
   * @param {string} colorStr - 背景颜色
   * @returns {string} '#000000' 或 '#ffffff'
   *
   * @example
   * SZ.utils.color.getContrastColor('#ffffff') // => '#000000'
   * SZ.utils.color.getContrastColor('#000000') // => '#ffffff'
   */
  color.getContrastColor = function (colorStr) {
    var rgb = color.parse(colorStr);
    if (!rgb) return '#000000';

    // 计算相对亮度（WCAG标准）
    var luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  /**
   * 计算颜色的相对亮度
   * @param {string} colorStr
   * @returns {number} 0-1
   */
  color.getLuminance = function (colorStr) {
    var rgb = color.parse(colorStr);
    if (!rgb) return 0;

    // sRGB 线性化
    function toLinear(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    var r = toLinear(rgb.r);
    var g = toLinear(rgb.g);
    var b = toLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  /**
   * 计算两个颜色的对比度（WCAG）
   * @param {string} color1
   * @param {string} color2
   * @returns {number} 对比度（1-21）
   */
  color.getContrastRatio = function (color1, color2) {
    var l1 = color.getLuminance(color1);
    var l2 = color.getLuminance(color2);

    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  /**
   * 生成随机颜色
   * @param {Object} [options] - 选项
   * @param {string} [options.format='hex'] - 输出格式：'hex', 'rgb', 'hsl'
   * @param {number} [options.minLightness] - 最小亮度
   * @param {number} [options.maxLightness] - 最大亮度
   * @returns {string}
   *
   * @example
   * SZ.utils.color.getRandomColor() // => '#3fa28f'
   * SZ.utils.color.getRandomColor({ format: 'rgb' }) // => 'rgb(63, 162, 143)'
   */
  color.getRandomColor = function (options) {
    options = options || {};

    var h = Math.floor(Math.random() * 360);
    var s = 50 + Math.floor(Math.random() * 50); // 50-100% 饱和度
    var l = 40 + Math.floor(Math.random() * 40); // 40-80% 亮度

    if (options.minLightness != null) {
      l = Math.max(l, options.minLightness);
    }
    if (options.maxLightness != null) {
      l = Math.min(l, options.maxLightness);
    }

    var rgb = color.hslToRgb(h, s, l);

    switch (options.format) {
      case 'rgb':
        return color.toRgbString(rgb);
      case 'hsl':
        return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
      case 'hex':
      default:
        return color.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  };

  /**
   * 颜色混合
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @param {number} [weight=0.5] - 颜色2的权重 (0-1)
   * @returns {string} HEX颜色值
   */
  color.mix = function (color1, color2, weight) {
    var rgb1 = color.parse(color1);
    var rgb2 = color.parse(color2);

    if (!rgb1 || !rgb2) return color1;

    weight = weight == null ? 0.5 : weight;
    var w1 = 1 - weight;
    var w2 = weight;

    var r = Math.round(rgb1.r * w1 + rgb2.r * w2);
    var g = Math.round(rgb1.g * w1 + rgb2.g * w2);
    var b = Math.round(rgb1.b * w1 + rgb2.b * w2);

    return color.rgbToHex(r, g, b);
  };

  /**
   * 颜色取反
   * @param {string} colorStr
   * @returns {string} HEX颜色值
   */
  color.invert = function (colorStr) {
    var rgb = color.parse(colorStr);
    if (!rgb) return colorStr;

    return color.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  };

  /**
   * 颜色灰度化
   * @param {string} colorStr
   * @returns {string} HEX颜色值
   */
  color.grayscale = function (colorStr) {
    var rgb = color.parse(colorStr);
    if (!rgb) return colorStr;

    // 标准灰度计算公式
    var gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    return color.rgbToHex(gray, gray, gray);
  };

  /**
   * 生成渐变色数组
   * @param {string} startColor - 起始颜色
   * @param {string} endColor - 结束颜色
   * @param {number} steps - 步数
   * @returns {Array<string>} HEX颜色数组
   */
  color.gradient = function (startColor, endColor, steps) {
    var rgb1 = color.parse(startColor);
    var rgb2 = color.parse(endColor);

    if (!rgb1 || !rgb2 || steps <= 1) return [startColor];

    var result = [];
    for (var i = 0; i < steps; i++) {
      var ratio = i / (steps - 1);
      var r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
      var g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
      var b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
      result.push(color.rgbToHex(r, g, b));
    }

    return result;
  };

  // ============================================================
  //  动画工具
  // ============================================================

  /**
   * 动画工具模块
   * @namespace SZ.utils.animate
   */
  var anim = utils.animate = {};

  /**
   * requestAnimationFrame 兼容封装
   * @type {Function}
   */
  anim.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function (callback) {
             return window.setTimeout(callback, 1000 / 60);
           };
  })();

  /**
   * cancelAnimationFrame 兼容封装
   * @type {Function}
   */
  anim.cancelAnimFrame = (function () {
    return window.cancelAnimationFrame ||
           window.webkitCancelAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.oCancelAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           window.msCancelAnimationFrame ||
           window.msCancelRequestAnimationFrame ||
           function (id) {
             window.clearTimeout(id);
           };
  })();

  /**
   * 缓动函数集合
   * 每个函数接收 t (0-1) 返回缓动后的值 (0-1)
   * @namespace SZ.utils.animate.easing
   */
  anim.easing = {
    /**
     * 线性
     * @param {number} t - 时间进度 0-1
     * @returns {number}
     */
    linear: function (t) {
      return t;
    },

    /**
     * 二次方缓入
     * @param {number} t
     * @returns {number}
     */
    easeInQuad: function (t) {
      return t * t;
    },

    /**
     * 二次方缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutQuad: function (t) {
      return t * (2 - t);
    },

    /**
     * 二次方缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutQuad: function (t) {
      if (t < 0.5) return 2 * t * t;
      return -1 + (4 - 2 * t) * t;
    },

    /**
     * 三次方缓入
     * @param {number} t
     * @returns {number}
     */
    easeInCubic: function (t) {
      return t * t * t;
    },

    /**
     * 三次方缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutCubic: function (t) {
      t--;
      return t * t * t + 1;
    },

    /**
     * 三次方缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutCubic: function (t) {
      if (t < 0.5) return 4 * t * t * t;
      t--;
      return 1 + 4 * t * t * t;
    },

    /**
     * 四次方缓入
     * @param {number} t
     * @returns {number}
     */
    easeInQuart: function (t) {
      return t * t * t * t;
    },

    /**
     * 四次方缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutQuart: function (t) {
      t--;
      return 1 - t * t * t * t;
    },

    /**
     * 四次方缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutQuart: function (t) {
      if (t < 0.5) return 8 * t * t * t * t;
      t--;
      return 1 - 8 * t * t * t * t;
    },

    /**
     * 五次方缓入
     * @param {number} t
     * @returns {number}
     */
    easeInQuint: function (t) {
      return t * t * t * t * t;
    },

    /**
     * 五次方缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutQuint: function (t) {
      t--;
      return 1 + t * t * t * t * t;
    },

    /**
     * 五次方缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutQuint: function (t) {
      if (t < 0.5) return 16 * t * t * t * t * t;
      t--;
      return 1 + 16 * t * t * t * t * t;
    },

    /**
     * 正弦缓入
     * @param {number} t
     * @returns {number}
     */
    easeInSine: function (t) {
      return 1 - Math.cos(t * Math.PI / 2);
    },

    /**
     * 正弦缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutSine: function (t) {
      return Math.sin(t * Math.PI / 2);
    },

    /**
     * 正弦缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutSine: function (t) {
      return -0.5 * (Math.cos(Math.PI * t) - 1);
    },

    /**
     * 指数缓入
     * @param {number} t
     * @returns {number}
     */
    easeInExpo: function (t) {
      return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    },

    /**
     * 指数缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutExpo: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },

    /**
     * 指数缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutExpo: function (t) {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) return 0.5 * Math.pow(2, 10 * (2 * t - 1));
      return 0.5 * (2 - Math.pow(2, -10 * (2 * t - 1)));
    },

    /**
     * 圆形缓入
     * @param {number} t
     * @returns {number}
     */
    easeInCirc: function (t) {
      return 1 - Math.sqrt(1 - t * t);
    },

    /**
     * 圆形缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutCirc: function (t) {
      t--;
      return Math.sqrt(1 - t * t);
    },

    /**
     * 圆形缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutCirc: function (t) {
      if (t < 0.5) {
        t = 2 * t;
        return 0.5 * (1 - Math.sqrt(1 - t * t));
      }
      t = 2 * t - 2;
      return 0.5 * (Math.sqrt(1 - t * t) + 1);
    },

    /**
     * 回弹缓入
     * @param {number} t
     * @returns {number}
     */
    easeInBack: function (t) {
      var s = 1.70158;
      return t * t * ((s + 1) * t - s);
    },

    /**
     * 回弹缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutBack: function (t) {
      var s = 1.70158;
      t--;
      return t * t * ((s + 1) * t + s) + 1;
    },

    /**
     * 回弹缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutBack: function (t) {
      var s = 1.70158 * 1.525;
      if (t < 0.5) {
        t = 2 * t;
        return 0.5 * (t * t * ((s + 1) * t - s));
      }
      t = 2 * t - 2;
      return 0.5 * (t * t * ((s + 1) * t + s) + 2);
    },

    /**
     * 弹性缓入
     * @param {number} t
     * @returns {number}
     */
    easeInElastic: function (t) {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },

    /**
     * 弹性缓出
     * @param {number} t
     * @returns {number}
     */
    easeOutElastic: function (t) {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },

    /**
     * 弹性缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutElastic: function (t) {
      if (t === 0) return 0;
      if (t === 1) return 1;
      t = t * 2;
      if (t < 1) {
        return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
      }
      return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
    },

    /**
     * 弹跳缓出
     * @param {number} t
     * @returns {number}
     */
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
     * 弹跳缓入
     * @param {number} t
     * @returns {number}
     */
    easeInBounce: function (t) {
      return 1 - anim.easing.easeOutBounce(1 - t);
    },

    /**
     * 弹跳缓入缓出
     * @param {number} t
     * @returns {number}
     */
    easeInOutBounce: function (t) {
      if (t < 0.5) {
        return anim.easing.easeInBounce(t * 2) * 0.5;
      }
      return anim.easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }
  };

  /**
   * 执行元素属性动画
   * @param {HTMLElement} element - 目标元素
   * @param {Object} properties - 动画属性对象
   * @param {number} [duration=400] - 动画时长（毫秒）
   * @param {string|Function} [easing='easeOutQuad'] - 缓动函数名或自定义函数
   * @param {Function} [callback] - 完成回调
   * @returns {Object} 动画控制对象（包含 cancel 方法）
   *
   * @example
   * var animation = SZ.utils.animate.animate(box, {
   *   left: '200px',
   *   opacity: 0.5
   * }, 500, 'easeOutCubic', function() {
   *   console.log('动画完成');
   * });
   *
   * // 取消动画
   * animation.cancel();
   */
  anim.animate = function (element, properties, duration, easing, callback) {
    if (!element || !properties) {
      if (callback) callback();
      return { cancel: function () {} };
    }

    duration = duration || 400;
    var easingFn;

    if (typeof easing === 'function') {
      easingFn = easing;
    } else if (typeof easing === 'string' && anim.easing[easing]) {
      easingFn = anim.easing[easing];
    } else if (easing == null) {
      easingFn = anim.easing.easeOutQuad;
    } else {
      easingFn = anim.easing.linear;
    }

    // 解析起始值和目标值
    var startValues = {};
    var endValues = {};
    var units = {};

    _each(properties, function (prop, targetVal) {
      var computedStyle = window.getComputedStyle(element);
      var currentVal = parseFloat(computedStyle[prop]) || 0;

      // 解析目标值和单位
      var targetNum = parseFloat(targetVal);
      var targetUnit = typeof targetVal === 'string'
        ? targetVal.replace(/^-?[\d.]+/, '')
        : '';

      // 如果没有单位，尝试从当前值获取
      if (!targetUnit && typeof computedStyle[prop] === 'string') {
        targetUnit = computedStyle[prop].replace(/^-?[\d.]+/, '');
      }

      startValues[prop] = currentVal;
      endValues[prop] = targetNum;
      units[prop] = targetUnit;
    });

    var startTime = null;
    var rafId = null;
    var cancelled = false;

    function step(timestamp) {
      if (cancelled) return;

      if (startTime === null) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easingFn(progress);

      // 更新属性
      _each(properties, function (prop) {
        var currentVal = startValues[prop] +
          (endValues[prop] - startValues[prop]) * easedProgress;
        element.style[prop] = currentVal + units[prop];
      });

      if (progress < 1) {
        rafId = anim.requestAnimFrame.call(window, step);
      } else {
        if (callback && !cancelled) {
          callback.call(element);
        }
      }
    }

    rafId = anim.requestAnimFrame.call(window, step);

    return {
      /**
       * 取消动画
       */
      cancel: function () {
        cancelled = true;
        if (rafId) {
          anim.cancelAnimFrame.call(window, rafId);
          rafId = null;
        }
      }
    };
  };

  /**
   * 淡入动画
   * @param {HTMLElement} element
   * @param {number} [duration=300]
   * @param {Function} [callback]
   * @returns {Object}
   */
  anim.fadeIn = function (element, duration, callback) {
    if (!element) return { cancel: function () {} };
    element.style.opacity = '0';
    element.style.display = '';
    return anim.animate(element, { opacity: 1 }, duration || 300, 'easeOutQuad', callback);
  };

  /**
   * 淡出动画
   * @param {HTMLElement} element
   * @param {number} [duration=300]
   * @param {Function} [callback]
   * @returns {Object}
   */
  anim.fadeOut = function (element, duration, callback) {
    if (!element) return { cancel: function () {} };
    return anim.animate(element, { opacity: 0 }, duration || 300, 'easeOutQuad', function () {
      element.style.display = 'none';
      if (callback) callback();
    });
  };

  /**
   * 滑入动画（从上到下）
   * @param {HTMLElement} element
   * @param {number} [duration=300]
   * @param {Function} [callback]
   * @returns {Object}
   */
  anim.slideDown = function (element, duration, callback) {
    if (!element) return { cancel: function () {} };

    element.style.overflow = 'hidden';
    element.style.display = '';
    var height = element.offsetHeight;
    element.style.height = '0';

    return anim.animate(element, { height: height }, duration || 300, 'easeOutQuad', function () {
      element.style.height = '';
      element.style.overflow = '';
      if (callback) callback();
    });
  };

  /**
   * 滑出动画（从下到上）
   * @param {HTMLElement} element
   * @param {number} [duration=300]
   * @param {Function} [callback]
   * @returns {Object}
   */
  anim.slideUp = function (element, duration, callback) {
    if (!element) return { cancel: function () {} };

    element.style.overflow = 'hidden';
    var height = element.offsetHeight;

    return anim.animate(element, { height: 0 }, duration || 300, 'easeOutQuad', function () {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      if (callback) callback();
    });
  };

  /**
   * 延迟执行
   * @param {Function} callback
   * @param {number} delay
   * @returns {number} timeout ID
   */
  anim.delay = function (callback, delay) {
    return setTimeout(callback, delay);
  };

  /**
   * 下一帧执行
   * @param {Function} callback
   * @returns {number} raf ID
   */
  anim.nextFrame = function (callback) {
    return anim.requestAnimFrame.call(window, callback);
  };

  /**
   * 创建一个动画循环
   * @param {Function} callback - 每帧回调，接收 progress (0-1) 参数
   * @param {number} duration - 持续时间（毫秒）
   * @param {string|Function} [easing='linear'] - 缓动函数
   * @returns {Object} 控制对象
   */
  anim.tween = function (callback, duration, easing) {
    if (typeof callback !== 'function') return { cancel: function () {} };

    duration = duration || 1000;
    var easingFn;

    if (typeof easing === 'function') {
      easingFn = easing;
    } else if (typeof easing === 'string' && anim.easing[easing]) {
      easingFn = anim.easing[easing];
    } else {
      easingFn = anim.easing.linear;
    }

    var startTime = null;
    var rafId = null;
    var cancelled = false;

    function step(timestamp) {
      if (cancelled) return;

      if (startTime === null) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easingFn(progress);

      callback(easedProgress, progress);

      if (progress < 1) {
        rafId = anim.requestAnimFrame.call(window, step);
      }
    }

    rafId = anim.requestAnimFrame.call(window, step);

    return {
      cancel: function () {
        cancelled = true;
        if (rafId) {
          anim.cancelAnimFrame.call(window, rafId);
          rafId = null;
        }
      }
    };
  };


  // ============================================================
  //  通知工具
  // ============================================================

  /**
   * 通知工具模块
   * @namespace SZ.utils.notify
   */
  var notify = utils.notify = {};

  /**
   * Toast 容器元素
   * @type {HTMLElement}
   * @private
   */
  var _toastContainer = null;

  /**
   * 获取或创建Toast容器
   * @returns {HTMLElement}
   * @private
   */
  function _getToastContainer() {
    if (_toastContainer && document.body.contains(_toastContainer)) {
      return _toastContainer;
    }

    _toastContainer = dom.createElement('div', {
      className: 'sz-toast-container',
      style: {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '9999',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }
    });

    document.body.appendChild(_toastContainer);
    return _toastContainer;
  }

  /**
   * Toast 提示
   * @param {string} message - 提示消息
   * @param {string} [type='info'] - 类型：'info', 'success', 'warning', 'error'
   * @param {number} [duration=2500] - 持续时间（毫秒）
   * @returns {HTMLElement} Toast元素
   *
   * @example
   * SZ.utils.notify.toast('操作成功', 'success');
   * SZ.utils.notify.toast('错误提示', 'error', 3000);
   */
  notify.toast = function (message, type, duration) {
    type = type || 'info';
    duration = duration || 2500;

    var container = _getToastContainer();

    // 类型对应的颜色
    var typeColors = {
      info: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    };

    var bgColor = typeColors[type] || typeColors.info;

    var toastEl = dom.createElement('div', {
      className: 'sz-toast sz-toast-' + type,
      style: {
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        borderRadius: '6px',
        fontSize: '14px',
        lineHeight: '1.5',
        maxWidth: '80vw',
        wordBreak: 'break-all',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease',
        pointerEvents: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderLeft: '4px solid ' + bgColor
      }
    }, message);

    container.appendChild(toastEl);

    // 入场动画
    requestAnimationFrame(function () {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';
    });

    // 自动消失
    var timer = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-20px)';
      setTimeout(function () {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, duration);

    // 点击关闭
    toastEl.addEventListener('click', function () {
      clearTimeout(timer);
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-20px)';
      setTimeout(function () {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    });

    return toastEl;
  };

  /**
   * 成功Toast
   * @param {string} message
   * @param {number} [duration]
   */
  notify.toastSuccess = function (message, duration) {
    return notify.toast(message, 'success', duration);
  };

  /**
   * 错误Toast
   * @param {string} message
   * @param {number} [duration]
   */
  notify.toastError = function (message, duration) {
    return notify.toast(message, 'error', duration);
  };

  /**
   * 警告Toast
   * @param {string} message
   * @param {number} [duration]
   */
  notify.toastWarning = function (message, duration) {
    return notify.toast(message, 'warning', duration);
  };

  /**
   * 信息Toast
   * @param {string} message
   * @param {number} [duration]
   */
  notify.toastInfo = function (message, duration) {
    return notify.toast(message, 'info', duration);
  };

  /**
   * 自定义确认对话框
   * @param {string} title - 标题
   * @param {string} message - 内容
   * @param {Function} [onOk] - 确认回调
   * @param {Function} [onCancel] - 取消回调
   * @param {Object} [options] - 选项
   * @param {string} [options.okText='确定'] - 确认按钮文字
   * @param {string} [options.cancelText='取消'] - 取消按钮文字
   *
   * @example
   * SZ.utils.notify.confirm('提示', '确定要删除吗？', function() {
   *   console.log('已确认');
   * }, function() {
   *   console.log('已取消');
   * });
   */
  notify.confirm = function (title, message, onOk, onCancel, options) {
    options = options || {};

    // 遮罩层
    var mask = dom.createElement('div', {
      className: 'sz-confirm-mask',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: 'opacity 0.2s ease'
      }
    });

    // 对话框
    var dialog = dom.createElement('div', {
      className: 'sz-confirm-dialog',
      style: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        width: '320px',
        maxWidth: '90vw',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        transform: 'scale(0.9)',
        transition: 'transform 0.2s ease',
        overflow: 'hidden'
      }
    });

    // 标题
    if (title) {
      var titleEl = dom.createElement('div', {
        className: 'sz-confirm-title',
        style: {
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '500',
          color: '#262626',
          borderBottom: '1px solid #f0f0f0'
        }
      }, title);
      dialog.appendChild(titleEl);
    }

    // 内容
    if (message) {
      var contentEl = dom.createElement('div', {
        className: 'sz-confirm-content',
        style: {
          padding: '20px 24px',
          fontSize: '14px',
          color: '#595959',
          lineHeight: '1.6'
        }
      }, message);
      dialog.appendChild(contentEl);
    }

    // 按钮区域
    var btnWrap = dom.createElement('div', {
      className: 'sz-confirm-btns',
      style: {
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        borderTop: '1px solid #f0f0f0'
      }
    });

    // 取消按钮
    var cancelBtn = dom.createElement('button', {
      className: 'sz-btn sz-btn-default sz-confirm-cancel',
      style: {
        padding: '6px 16px',
        fontSize: '14px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: '#fff',
        color: '#595959',
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      onMouseOver: function () {
        this.style.borderColor = '#40a9ff';
        this.style.color = '#40a9ff';
      },
      onMouseOut: function () {
        this.style.borderColor = '#d9d9d9';
        this.style.color = '#595959';
      },
      onClick: function () {
        closeDialog();
        if (onCancel) onCancel();
      }
    }, options.cancelText || '取消');

    // 确认按钮
    var okBtn = dom.createElement('button', {
      className: 'sz-btn sz-btn-primary sz-confirm-ok',
      style: {
        padding: '6px 16px',
        fontSize: '14px',
        border: '1px solid #1890ff',
        borderRadius: '4px',
        backgroundColor: '#1890ff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      onMouseOver: function () {
        this.style.backgroundColor = '#40a9ff';
        this.style.borderColor = '#40a9ff';
      },
      onMouseOut: function () {
        this.style.backgroundColor = '#1890ff';
        this.style.borderColor = '#1890ff';
      },
      onClick: function () {
        closeDialog();
        if (onOk) onOk();
      }
    }, options.okText || '确定');

    btnWrap.appendChild(cancelBtn);
    btnWrap.appendChild(okBtn);
    dialog.appendChild(btnWrap);
    mask.appendChild(dialog);
    document.body.appendChild(mask);

    // 入场动画
    requestAnimationFrame(function () {
      mask.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
    });

    // 关闭对话框
    function closeDialog() {
      mask.style.opacity = '0';
      dialog.style.transform = 'scale(0.9)';
      setTimeout(function () {
        if (mask.parentNode) {
          mask.parentNode.removeChild(mask);
        }
      }, 200);
    }

    // 点击遮罩关闭
    mask.addEventListener('click', function (e) {
      if (e.target === mask) {
        closeDialog();
        if (onCancel) onCancel();
      }
    });

    // ESC键关闭
    function escHandler(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeDialog();
        if (onCancel) onCancel();
        document.removeEventListener('keydown', escHandler);
      }
    }
    document.addEventListener('keydown', escHandler);
  };

  /**
   * Loading 工具
   * @namespace SZ.utils.notify.loading
   */
  notify.loading = (function () {
    var loadingEl = null;
    var count = 0;

    /**
     * 显示loading
     * @param {string} [text='加载中...'] - 提示文字
     */
    function show(text) {
      count++;
      if (loadingEl && document.body.contains(loadingEl)) {
        var textEl = dom.$('.sz-loading-text', loadingEl);
        if (textEl && text) textEl.textContent = text;
        return;
      }

      loadingEl = dom.createElement('div', {
        className: 'sz-loading',
        style: {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          zIndex: '9998',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: '0',
          transition: 'opacity 0.2s ease'
        }
      });

      // 加载动画
      var spinner = dom.createElement('div', {
        className: 'sz-loading-spinner',
        style: {
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'sz-spin 0.8s linear infinite'
        }
      });

      // 文字
      var textEl = dom.createElement('div', {
        className: 'sz-loading-text',
        style: {
          marginTop: '12px',
          color: '#fff',
          fontSize: '14px'
        }
      }, text || '加载中...');

      loadingEl.appendChild(spinner);
      loadingEl.appendChild(textEl);

      // 添加旋转动画
      if (!document.getElementById('sz-loading-style')) {
        var styleEl = dom.createElement('style', {
          id: 'sz-loading-style'
        });
        styleEl.textContent = '@keyframes sz-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(styleEl);
      }

      document.body.appendChild(loadingEl);

      requestAnimationFrame(function () {
        loadingEl.style.opacity = '1';
      });
    }

    /**
     * 隐藏loading
     */
    function hide() {
      count = Math.max(0, count - 1);
      if (count > 0) return;

      if (loadingEl) {
        loadingEl.style.opacity = '0';
        var el = loadingEl;
        setTimeout(function () {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 200);
        loadingEl = null;
      }
    }

    return {
      show: show,
      hide: hide
    };
  })();

  // ============================================================
  //  键盘快捷键
  // ============================================================

  /**
   * 键盘快捷键模块
   * @namespace SZ.utils.shortcut
   */
  var shortcut = utils.shortcut = {};

  /**
   * 快捷键注册表
   * @type {Object}
   * @private
   */
  var _shortcuts = {};

  /**
   * 快捷键是否已绑定
   * @type {boolean}
   * @private
   */
  var _shortcutBound = false;

  /**
   * 标准化快捷键字符串
   * @param {string} key - 快捷键字符串，如 'ctrl+s', 'cmd+shift+a'
   * @returns {string} 标准化后的字符串
   * @private
   */
  function _normalizeKey(key) {
    if (!key) return '';

    var parts = key.toLowerCase().split('+').map(function (p) {
      return p.trim();
    }).filter(function (p) {
      return p;
    });

    // 分离修饰键和主键
    var mods = [];
    var mainKey = '';

    _each(parts, function (_, part) {
      switch (part) {
        case 'ctrl':
        case 'control':
          mods.push('ctrl');
          break;
        case 'cmd':
        case 'command':
        case 'meta':
          mods.push('meta');
          break;
        case 'shift':
          mods.push('shift');
          break;
        case 'alt':
        case 'option':
          mods.push('alt');
          break;
        default:
          mainKey = part;
      }
    });

    // 修饰键排序
    mods.sort();

    return mods.concat(mainKey).join('+');
  }

  /**
   * 键盘事件处理函数
   * @param {KeyboardEvent} e
   * @private
   */
  function _handleKeydown(e) {
    // 如果焦点在输入框、文本域等元素中，不触发快捷键（除非是全局快捷键）
    var target = e.target;
    var tagName = target.tagName.toLowerCase();
    var isInput = tagName === 'input' || tagName === 'textarea' ||
                  tagName === 'select' || target.isContentEditable;

    // 构建快捷键字符串
    var mods = [];
    if (e.ctrlKey) mods.push('ctrl');
    if (e.metaKey) mods.push('meta');
    if (e.shiftKey) mods.push('shift');
    if (e.altKey) mods.push('alt');
    mods.sort();

    var key = e.key.toLowerCase();
    // 特殊键映射
    var keyMap = {
      ' ': 'space',
      'escape': 'esc'
    };
    if (keyMap[key]) key = keyMap[key];

    var shortcutStr = mods.concat(key).join('+');

    // 查找匹配的快捷键
    var handlers = _shortcuts[shortcutStr];
    if (handlers && handlers.length > 0) {
      // 检查是否是输入框中的快捷键
      var hasGlobal = handlers.some(function (h) { return h.global; });

      if (!isInput || hasGlobal) {
        e.preventDefault();
        _each(handlers, function (_, handler) {
          if (!isInput || handler.global) {
            handler.callback(e);
          }
        });
      }
    }
  }

  /**
   * 绑定键盘事件
   * @private
   */
  function _bindShortcutEvent() {
    if (_shortcutBound) return;
    document.addEventListener('keydown', _handleKeydown);
    _shortcutBound = true;
  }

  /**
   * 注册快捷键
   * @param {string} key - 快捷键组合，如 'ctrl+s', 'cmd+shift+a', 'f5'
   * @param {Function} callback - 回调函数
   * @param {Object} [options] - 选项
   * @param {boolean} [options.global=false] - 是否为全局快捷键（输入框中也触发）
   *
   * @example
   * SZ.utils.shortcut.registerShortcut('ctrl+s', function(e) {
   *   console.log('保存');
   * });
   *
   * SZ.utils.shortcut.registerShortcut('cmd+shift+p', function() {
   *   console.log('命令面板');
   * }, { global: true });
   */
  shortcut.registerShortcut = function (key, callback, options) {
    if (!key || typeof callback !== 'function') return;

    options = options || {};
    var normalizedKey = _normalizeKey(key);

    if (!_shortcuts[normalizedKey]) {
      _shortcuts[normalizedKey] = [];
    }

    _shortcuts[normalizedKey].push({
      callback: callback,
      global: options.global === true
    });

    _bindShortcutEvent();
  };

  /**
   * 注销快捷键
   * @param {string} key - 快捷键组合
   * @param {Function} [callback] - 要注销的回调函数，不传则注销所有该快捷键的回调
   */
  shortcut.unregisterShortcut = function (key, callback) {
    if (!key) return;

    var normalizedKey = _normalizeKey(key);
    var handlers = _shortcuts[normalizedKey];

    if (!handlers) return;

    if (callback) {
      _shortcuts[normalizedKey] = handlers.filter(function (h) {
        return h.callback !== callback;
      });
    } else {
      delete _shortcuts[normalizedKey];
    }
  };

  /**
   * 批量注册快捷键
   * @param {Object} map - 快捷键映射 { 'ctrl+s': callback }
   * @param {Object} [options] - 选项
   */
  shortcut.registerShortcuts = function (map, options) {
    if (!map) return;
    _each(map, function (key, callback) {
      shortcut.registerShortcut(key, callback, options);
    });
  };

  /**
   * 注销所有快捷键
   */
  shortcut.unregisterAll = function () {
    _shortcuts = {};
  };

  /**
   * 获取所有已注册的快捷键
   * @returns {Array<string>}
   */
  shortcut.getAll = function () {
    return Object.keys(_shortcuts);
  };

  // ============================================================
  //  文件工具
  // ============================================================

  /**
   * 文件工具模块
   * @namespace SZ.utils.file
   */
  var fileUtil = utils.file = {};

  /**
   * 下载文件
   * @param {Blob|string|Object} data - 文件数据
   * @param {string} filename - 文件名
   * @param {string} [type] - MIME类型
   *
   * @example
   * // 下载文本文件
   * SZ.utils.file.downloadFile('Hello World', 'test.txt', 'text/plain');
   *
   * // 下载JSON文件
   * SZ.utils.file.downloadFile({a: 1}, 'data.json', 'application/json');
   *
   * // 下载Blob
   * var blob = new Blob(['Hello'], {type: 'text/plain'});
   * SZ.utils.file.downloadFile(blob, 'test.txt');
   */
  fileUtil.downloadFile = function (data, filename, type) {
    var blob;

    if (data instanceof Blob) {
      blob = data;
    } else if (typeof data === 'object') {
      // 对象转JSON
      blob = new Blob([JSON.stringify(data, null, 2)], {
        type: type || 'application/json'
      });
    } else {
      blob = new Blob([String(data)], {
        type: type || 'text/plain'
      });
    }

    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /**
   * 读取文件为文本
   * @param {File} file - File对象
   * @returns {Promise<string>} 文件内容Promise
   *
   * @example
   * var input = document.querySelector('input[type=file]');
   * input.addEventListener('change', async function(e) {
   *   var content = await SZ.utils.file.readFileAsText(e.target.files[0]);
   *   console.log(content);
   * });
   */
  fileUtil.readFileAsText = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject(new Error('File is required'));
        return;
      }

      var reader = new FileReader();

      reader.onload = function (e) {
        resolve(e.target.result);
      };

      reader.onerror = function () {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  /**
   * 读取文件为DataURL（base64）
   * @param {File} file - File对象
   * @returns {Promise<string>}
   */
  fileUtil.readFileAsDataURL = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject(new Error('File is required'));
        return;
      }

      var reader = new FileReader();

      reader.onload = function (e) {
        resolve(e.target.result);
      };

      reader.onerror = function () {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * 读取文件为ArrayBuffer
   * @param {File} file - File对象
   * @returns {Promise<ArrayBuffer>}
   */
  fileUtil.readFileAsArrayBuffer = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject(new Error('File is required'));
        return;
      }

      var reader = new FileReader();

      reader.onload = function (e) {
        resolve(e.target.result);
      };

      reader.onerror = function () {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * 读取文件为JSON
   * @param {File} file - File对象
   * @returns {Promise<Object>}
   */
  fileUtil.readFileAsJSON = function (file) {
    return fileUtil.readFileAsText(file).then(function (text) {
      return JSON.parse(text);
    });
  };

  /**
   * 获取文件扩展名
   * @param {string} filename - 文件名
   * @returns {string} 扩展名（小写，不含点）
   */
  fileUtil.getExtension = function (filename) {
    if (!filename) return '';
    var dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === filename.length - 1) return '';
    return filename.slice(dotIndex + 1).toLowerCase();
  };

  /**
   * 获取文件名（不含扩展名）
   * @param {string} filename
   * @returns {string}
   */
  fileUtil.getBasename = function (filename) {
    if (!filename) return '';
    var dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1) return filename;
    return filename.slice(0, dotIndex);
  };

  /**
   * 文件大小格式化
   * @param {number} bytes - 字节数
   * @param {number} [decimals=2] - 小数位数
   * @returns {string}
   */
  fileUtil.formatSize = function (bytes, decimals) {
    return math.formatBytes(bytes, decimals);
  };

  /**
   * 判断文件是否为图片
   * @param {File|string} file - File对象或文件名/类型
   * @returns {boolean}
   */
  fileUtil.isImage = function (file) {
    var type = typeof file === 'string' ? file : (file && file.type);
    if (!type) {
      var ext = fileUtil.getExtension(typeof file === 'string' ? file : (file && file.name));
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].indexOf(ext) > -1;
    }
    return type.indexOf('image/') === 0;
  };

  /**
   * 判断文件是否为视频
   * @param {File|string} file
   * @returns {boolean}
   */
  fileUtil.isVideo = function (file) {
    var type = typeof file === 'string' ? file : (file && file.type);
    if (!type) {
      var ext = fileUtil.getExtension(typeof file === 'string' ? file : (file && file.name));
      return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].indexOf(ext) > -1;
    }
    return type.indexOf('video/') === 0;
  };

  /**
   * 判断文件是否为音频
   * @param {File|string} file
   * @returns {boolean}
   */
  fileUtil.isAudio = function (file) {
    var type = typeof file === 'string' ? file : (file && file.type);
    if (!type) {
      var ext = fileUtil.getExtension(typeof file === 'string' ? file : (file && file.name));
      return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma'].indexOf(ext) > -1;
    }
    return type.indexOf('audio/') === 0;
  };

  // ============================================================
  //  性能工具
  // ============================================================

  /**
   * 性能工具模块
   * @namespace SZ.utils.performance
   */
  var perf = utils.performance = {};

  /**
   * 函数记忆化（缓存函数结果）
   * @param {Function} fn - 要记忆的函数
   * @param {Function} [resolver] - 自定义缓存键生成函数
   * @returns {Function} 记忆化后的函数
   *
   * @example
   * var fibonacci = SZ.utils.performance.memoize(function(n) {
   *   return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
   * });
   *
   * fibonacci(40) // 第一次计算较慢
   * fibonacci(40) // 第二次从缓存读取，很快
   */
  perf.memoize = function (fn, resolver) {
    if (typeof fn !== 'function') return fn;

    var memoized = function () {
      var args = arguments;
      // 生成缓存键
      var key = resolver
        ? resolver.apply(null, args)
        : JSON.stringify(Array.prototype.slice.call(args));

      if (!memoized.cache.has(key)) {
        memoized.cache.set(key, fn.apply(this, args));
      }

      return memoized.cache.get(key);
    };

    memoized.cache = new Map();

    /**
     * 清除缓存
     */
    memoized.clear = function () {
      memoized.cache.clear();
    };

    /**
     * 删除指定缓存
     * @param {...*} args - 函数参数
     */
    memoized.delete = function () {
      var key = resolver
        ? resolver.apply(null, arguments)
        : JSON.stringify(Array.prototype.slice.call(arguments));
      memoized.cache.delete(key);
    };

    return memoized;
  };

  /**
   * 测量函数执行时间
   * @param {Function} fn - 要测量的函数
   * @param {string} [label] - 标签名
   * @returns {*} 函数返回值
   *
   * @example
   * var result = SZ.utils.performance.measureTime(function() {
   *   // 一些耗时操作
   *   return computeSomething();
   * }, 'compute');
   * // 控制台输出: [measureTime] compute: 123.45ms
   */
  perf.measureTime = function (fn, label) {
    if (typeof fn !== 'function') return undefined;

    label = label || 'anonymous';
    var startTime = performance.now();
    var result = fn();
    var endTime = performance.now();

    console.log('[measureTime] ' + label + ': ' + (endTime - startTime).toFixed(2) + 'ms');

    return result;
  };

  /**
   * 异步测量函数执行时间
   * @param {Function} fn - 异步函数
   * @param {string} [label] - 标签名
   * @returns {Promise<*>}
   */
  perf.measureTimeAsync = async function (fn, label) {
    if (typeof fn !== 'function') return undefined;

    label = label || 'anonymous';
    var startTime = performance.now();
    var result = await fn();
    var endTime = performance.now();

    console.log('[measureTimeAsync] ' + label + ': ' + (endTime - startTime).toFixed(2) + 'ms');

    return result;
  };

  /**
   * 创建一个计时器
   * @param {string} [label] - 标签名
   * @returns {{start: Function, end: Function, elapsed: Function}}
   *
   * @example
   * var timer = SZ.utils.performance.createTimer('test');
   * timer.start();
   * // ... 一些操作
   * console.log(timer.elapsed()); // 已用时间
   * timer.end(); // 结束并打印总时间
   */
  perf.createTimer = function (label) {
    var startTime = null;
    var endTime = null;

    return {
      /**
       * 开始计时
       */
      start: function () {
        startTime = performance.now();
        endTime = null;
      },

      /**
       * 结束计时
       * @returns {number} 总耗时（毫秒）
       */
      end: function () {
        endTime = performance.now();
        var elapsed = endTime - startTime;
        if (label) {
          console.log('[timer] ' + label + ': ' + elapsed.toFixed(2) + 'ms');
        }
        return elapsed;
      },

      /**
       * 获取已用时间（不停止计时）
       * @returns {number}
       */
      elapsed: function () {
        if (startTime == null) return 0;
        var now = endTime || performance.now();
        return now - startTime;
      },

      /**
       * 重置计时器
       */
      reset: function () {
        startTime = null;
        endTime = null;
      }
    };
  };

  /**
   * 函数节流（使用 requestAnimationFrame 优化）
   * @param {Function} fn
   * @returns {Function}
   */
  perf.rafThrottle = function (fn) {
    if (typeof fn !== 'function') return fn;

    var rafId = null;
    var args = null;
    var context = null;

    var throttled = function () {
      args = arguments;
      context = this;

      if (rafId != null) return;

      rafId = requestAnimationFrame(function () {
        fn.apply(context, args);
        rafId = null;
      });
    };

    throttled.cancel = function () {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    return throttled;
  };

  /**
   * 简单的对象池
   * @class
   * @param {Function} factory - 对象创建工厂函数
   * @param {Function} reset - 对象重置函数
   * @param {number} [maxSize=50] - 最大池大小
   *
   * @example
   * var pool = new SZ.utils.performance.ObjectPool(
   *   function() { return { x: 0, y: 0 }; },
   *   function(obj) { obj.x = 0; obj.y = 0; }
   * );
   *
   * var obj = pool.acquire(); // 获取对象
   * pool.release(obj); // 归还对象
   */
  perf.ObjectPool = function (factory, reset, maxSize) {
    this.factory = factory || function () { return {}; };
    this.reset = reset || function () {};
    this.maxSize = maxSize || 50;
    this.pool = [];
  };

  /**
   * 从对象池中获取对象
   * @returns {*}
   */
  perf.ObjectPool.prototype.acquire = function () {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  };

  /**
   * 将对象归还到池中
   * @param {*} obj - 要归还的对象
   */
  perf.ObjectPool.prototype.release = function (obj) {
    if (obj == null) return;
    if (this.pool.length >= this.maxSize) return;
    this.reset(obj);
    this.pool.push(obj);
  };

  /**
   * 清空对象池
   */
  perf.ObjectPool.prototype.clear = function () {
    this.pool.length = 0;
  };

  /**
   * 获取当前池大小
   * @returns {number}
   */
  perf.ObjectPool.prototype.size = function () {
    return this.pool.length;
  };

  /**
   * 预填充对象池
   * @param {number} count - 预创建数量
   */
  perf.ObjectPool.prototype.preallocate = function (count) {
    for (var i = 0; i < count && this.pool.length < this.maxSize; i++) {
      this.pool.push(this.factory());
    }
  };

  /**
   * 函数执行次数限制（只执行一次）
   * @param {Function} fn
   * @returns {Function}
   */
  perf.once = function (fn) {
    if (typeof fn !== 'function') return fn;

    var called = false;
    var result;

    return function () {
      if (!called) {
        called = true;
        result = fn.apply(this, arguments);
      }
      return result;
    };
  };

  /**
   * 函数执行次数限制（执行指定次数）
   * @param {Function} fn
   * @param {number} times - 最大执行次数
   * @returns {Function}
   */
  perf.maxTimes = function (fn, times) {
    if (typeof fn !== 'function') return fn;

    var count = 0;
    var result;

    return function () {
      if (count < times) {
        count++;
        result = fn.apply(this, arguments);
      }
      return result;
    };
  };

  // ============================================================
  //  版本信息
  // ============================================================

  /**
   * 版本号
   * @type {string}
   */
  utils.version = '1.0.0';

  /**
   * 库名称
   * @type {string}
   */
  utils.name = 'SZ.utils';

  /**
   * 获取库信息
   * @returns {{name: string, version: string, modules: Array<string>}}
   */
  utils.getInfo = function () {
    return {
      name: utils.name,
      version: utils.version,
      modules: [
        'dom', 'event', 'data', 'storage', 'time',
        'string', 'math', 'color', 'animate',
        'notify', 'shortcut', 'file', 'performance'
      ]
    };
  };

  // ============================================================
  //  模块导出（兼容 CommonJS / AMD）
  // ============================================================

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
  }

  if (typeof define === 'function' && define.amd) {
    define(function () { return utils; });
  }

})(window);
