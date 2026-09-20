/**
 * ============================================================
 *  刷题模式核心模块 - Shuzhuo Quiz Modes Engine
 *  命名空间: SZ.modes
 *  版本: 2.0.0
 *  描述: 刷题应用的核心刷题引擎，包含14种刷题模式
 * ============================================================
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.SZ = window.SZ || {};
    SZ.modes = SZ.modes || {};
    SZ.events = SZ.events || {};

    // ============================================================
    //  工具函数集合
    // ============================================================

    var Utils = {
        /**
         * 生成唯一ID
         */
        generateId: function () {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 数组洗牌算法 (Fisher-Yates)
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
         * 数组去重
         */
        unique: function (array) {
            return array.filter(function (item, index, arr) {
                return arr.indexOf(item) === index;
            });
        },

        /**
         * 深拷贝
         */
        deepClone: function (obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) {
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
         * 格式化时间 (秒 -> mm:ss)
         */
        formatTime: function (seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        },

        /**
         * 格式化日期
         */
        formatDate: function (date, format) {
            date = date instanceof Date ? date : new Date(date);
            format = format || 'YYYY-MM-DD';
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            return format
                .replace('YYYY', year)
                .replace('MM', month < 10 ? '0' + month : month)
                .replace('DD', day < 10 ? '0' + day : day)
                .replace('HH', hours < 10 ? '0' + hours : hours)
                .replace('mm', minutes < 10 ? '0' + minutes : minutes)
                .replace('ss', seconds < 10 ? '0' + seconds : seconds);
        },

        /**
         * 获取今天日期字符串
         */
        getToday: function () {
            return Utils.formatDate(new Date(), 'YYYY-MM-DD');
        },

        /**
         * 计算两个日期相差天数
         */
        daysBetween: function (date1, date2) {
            var d1 = new Date(date1);
            var d2 = new Date(date2);
            d1.setHours(0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);
            return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        },

        /**
         * 本地存储操作
         */
        storage: {
            get: function (key, defaultValue) {
                try {
                    var value = localStorage.getItem(key);
                    return value ? JSON.parse(value) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            set: function (key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            remove: function (key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },

        /**
         * 简单的事件触发器
         */
        triggerEvent: function (eventName, data) {
            if (SZ.events && typeof SZ.events.trigger === 'function') {
                SZ.events.trigger(eventName, data);
            }
            // 自定义事件
            try {
                var event = new CustomEvent('sz:' + eventName, { detail: data });
                window.dispatchEvent(event);
            } catch (e) {
                // 兼容旧浏览器
            }
        },

        /**
         * 数组随机取样
         */
        sample: function (array, count) {
            var shuffled = Utils.shuffle(array);
            return shuffled.slice(0, Math.min(count, array.length));
        },

        /**
         * 按权重随机选择
         */
        weightedRandom: function (items, weights) {
            var totalWeight = weights.reduce(function (sum, w) { return sum + w; }, 0);
            var random = Math.random() * totalWeight;
            var cumulative = 0;
            for (var i = 0; i < items.length; i++) {
                cumulative += weights[i];
                if (random <= cumulative) {
                    return items[i];
                }
            }
            return items[items.length - 1];
        },

        /**
         * 防抖函数
         */
        debounce: function (fn, delay) {
            var timer = null;
            return function () {
                var context = this;
                var args = arguments;
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },

        /**
         * 节流函数
         */
        throttle: function (fn, interval) {
            var lastTime = 0;
            return function () {
                var now = Date.now();
                if (now - lastTime >= interval) {
                    lastTime = now;
                    fn.apply(this, arguments);
                }
            };
        },

        /**
         * 校验答案是否正确
         * @param {Array|string} userAnswer 用户答案
         * @param {Array|string} correctAnswer 正确答案
         * @param {string} type 题型
         */
        checkAnswer: function (userAnswer, correctAnswer, type) {
            if (userAnswer === null || userAnswer === undefined) return false;

            // 标准化答案为数组
            var userArr = Array.isArray(userAnswer) ? userArr = userAnswer.slice().sort() : [String(userAnswer)].sort();
            var correctArr = Array.isArray(correctAnswer) ? correctAnswer.slice().sort() : [String(correctAnswer)].sort();

            // 判断题特殊处理
            if (type === 'judge' || type === 'boolean') {
                var userVal = userArr[0];
                var correctVal = correctArr[0];
                // 支持多种判断值格式
                var userBool = (userVal === true || userVal === 'true' || userVal === '对' || userVal === '正确' || userVal === '1' || userVal === 1 || userVal === 'T');
                var correctBool = (correctVal === true || correctVal === 'true' || correctVal === '对' || correctVal === '正确' || correctVal === '1' || correctVal === 1 || correctVal === 'T');
                return userBool === correctBool;
            }

            // 单选题
            if (type === 'single' || type === 'radio') {
                return userArr.length === 1 && userArr[0] === correctArr[0];
            }

            // 多选题
            if (type === 'multiple' || type === 'checkbox') {
                if (userArr.length !== correctArr.length) return false;
                for (var i = 0; i < userArr.length; i++) {
                    if (userArr[i] !== correctArr[i]) return false;
                }
                return true;
            }

            // 填空/简答 - 简单字符串匹配
            if (type === 'fill' || type === 'essay' || type === 'text') {
                var userText = String(userArr.join(' ')).trim().toLowerCase();
                var correctText = String(correctArr.join(' ')).trim().toLowerCase();
                return userText === correctText;
            }

            // 默认比较
            return JSON.stringify(userArr) === JSON.stringify(correctArr);
        },

        /**
         * 计算正确率
         */
        calculateAccuracy: function (correct, total) {
            if (total === 0) return 0;
            return Math.round((correct / total) * 1000) / 10;
        },

        /**
         * 限制数值范围
         */
        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        /**
         * 线性插值
         */
        lerp: function (start, end, t) {
            return start + (end - start) * t;
        }
    };

    // ============================================================
    //  事件系统 - EventEmitter
    // ============================================================

    /**
     * 事件发射器基类
     */
    function EventEmitter() {
        this._events = {};
    }

    EventEmitter.prototype.on = function (event, callback) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);
        return this;
    };

    EventEmitter.prototype.off = function (event, callback) {
        if (!this._events[event]) return this;
        if (!callback) {
            this._events[event] = [];
            return this;
        }
        this._events[event] = this._events[event].filter(function (cb) {
            return cb !== callback;
        });
        return this;
    };

    EventEmitter.prototype.emit = function (event) {
        if (!this._events[event]) return this;
        var args = Array.prototype.slice.call(arguments, 1);
        var eventCopy = this._events[event].slice();
        for (var i = 0; i < eventCopy.length; i++) {
            try {
                eventCopy[i].apply(this, args);
            } catch (e) {
                console.error('Event callback error:', e);
            }
        }
        return this;
    };

    EventEmitter.prototype.once = function (event, callback) {
        var self = this;
        var onceCallback = function () {
            callback.apply(self, arguments);
            self.off(event, onceCallback);
        };
        return this.on(event, onceCallback);
    };

    // ============================================================
    //  QuestionBank - 题库管理类
    // ============================================================

    /**
     * 题库管理类
     * 负责题目数据的加载、筛选、搜索、统计等
     */
    function QuestionBank(options) {
        EventEmitter.call(this);
        options = options || {};
        this.questions = [];
        this.questionMap = {};
        this.departments = [];
        this.departmentMap = {};
        this.isLoaded = false;
        this.loadError = null;
        this.storageKey = options.storageKey || 'sz_question_bank';
        this.metadata = {
            total: 0,
            types: {},
            departments: {},
            difficulty: { easy: 0, medium: 0, hard: 0 }
        };
        this._init();
    }

    // 继承EventEmitter
    QuestionBank.prototype = Object.create(EventEmitter.prototype);
    QuestionBank.prototype.constructor = QuestionBank;

    /**
     * 初始化
     */
    QuestionBank.prototype._init = function () {
        // 可以从本地缓存恢复数据
        var cached = Utils.storage.get(this.storageKey);
        if (cached && cached.questions && cached.questions.length > 0) {
            this.questions = cached.questions;
            this._buildIndex();
            this.isLoaded = true;
            this.emit('loaded', { source: 'cache', count: this.questions.length });
        }
    };

    /**
     * 从URL或JSON数据加载题库
     * @param {string|Array} source - JSON数据URL或题目数组
     */
    QuestionBank.prototype.load = function (source) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (Array.isArray(source)) {
                // 直接传入数组
                self._processQuestions(source);
                self.isLoaded = true;
                self.emit('loaded', { source: 'array', count: self.questions.length });
                resolve(self.questions);
            } else if (typeof source === 'string') {
                // 从URL加载
                var xhr = new XMLHttpRequest();
                xhr.open('GET', source, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                var questionList = data.questions || data;
                                self._processQuestions(questionList);
                                self.isLoaded = true;
                                self.emit('loaded', { source: 'url', count: self.questions.length });
                                resolve(self.questions);
                            } catch (e) {
                                self.loadError = e;
                                self.emit('error', { error: e });
                                reject(e);
                            }
                        } else {
                            var err = new Error('Failed to load question bank: ' + xhr.status);
                            self.loadError = err;
                            self.emit('error', { error: err });
                            reject(err);
                        }
                    }
                };
                xhr.onerror = function () {
                    var err = new Error('Network error loading question bank');
                    self.loadError = err;
                    self.emit('error', { error: err });
                    reject(err);
                };
                xhr.send();
            } else {
                reject(new Error('Invalid source type'));
            }
        });
    };

    /**
     * 处理题目数据，建立索引
     */
    QuestionBank.prototype._processQuestions = function (questionList) {
        this.questions = [];
        this.metadata = {
            total: 0,
            types: {},
            departments: {},
            difficulty: { easy: 0, medium: 0, hard: 0 }
        };

        for (var i = 0; i < questionList.length; i++) {
            var q = this._normalizeQuestion(questionList[i], i);
            this.questions.push(q);

            // 统计题型
            if (q.type) {
                this.metadata.types[q.type] = (this.metadata.types[q.type] || 0) + 1;
            }

            // 统计部门
            if (q.department) {
                this.metadata.departments[q.department] = (this.metadata.departments[q.department] || 0) + 1;
            }

            // 统计难度
            if (q.difficulty) {
                var diff = q.difficulty.toLowerCase();
                if (this.metadata.difficulty[diff] !== undefined) {
                    this.metadata.difficulty[diff]++;
                }
            }
        }

        this.metadata.total = this.questions.length;
        this._buildIndex();
        this._buildDepartmentIndex();

        // 缓存到本地
        Utils.storage.set(this.storageKey, { questions: this.questions });
    };

    /**
     * 标准化题目格式
     */
    QuestionBank.prototype._normalizeQuestion = function (q, index) {
        return {
            id: q.id || q.questionId || 'q_' + index,
            index: index,
            type: q.type || q.questionType || 'single',
            title: q.title || q.question || q.content || '',
            options: q.options || q.choices || q.answers || [],
            answer: q.answer !== undefined ? q.answer : (q.correctAnswer || q.correct || ''),
            explanation: q.explanation || q.analysis || q.explain || '',
            department: q.department || q.dept || q.category || '默认部门',
            difficulty: q.difficulty || q.level || 'medium',
            tags: q.tags || q.keywords || [],
            chapter: q.chapter || q.section || '',
            year: q.year || null,
            source: q.source || '',
            createdAt: q.createdAt || Date.now(),
            updatedAt: q.updatedAt || Date.now()
        };
    };

    /**
     * 建立题目ID索引
     */
    QuestionBank.prototype._buildIndex = function () {
        this.questionMap = {};
        for (var i = 0; i < this.questions.length; i++) {
            var q = this.questions[i];
            this.questionMap[q.id] = q;
        }
    };

    /**
     * 建立部门索引
     */
    QuestionBank.prototype._buildDepartmentIndex = function () {
        this.departments = [];
        this.departmentMap = {};

        for (var i = 0; i < this.questions.length; i++) {
            var dept = this.questions[i].department;
            if (!this.departmentMap[dept]) {
                this.departmentMap[dept] = [];
                this.departments.push(dept);
            }
            this.departmentMap[dept].push(this.questions[i].id);
        }
    };

    /**
     * 按ID获取题目
     * @param {string} id - 题目ID
     */
    QuestionBank.prototype.getById = function (id) {
        return this.questionMap[id] || null;
    };

    /**
     * 按索引获取题目
     * @param {number} index - 题目索引
     */
    QuestionBank.prototype.getByIndex = function (index) {
        if (index < 0 || index >= this.questions.length) return null;
        return this.questions[index];
    };

    /**
     * 筛选题目
     * @param {Object} filters - 筛选条件
     * @param {string|Array} [filters.type] - 题型
     * @param {string|Array} [filters.department] - 部门
     * @param {string|Array} [filters.difficulty] - 难度
     * @param {string|Array} [filters.tags] - 标签
     * @param {string} [filters.keyword] - 关键词
     * @param {number} [filters.limit] - 数量限制
     * @param {number} [filters.offset] - 偏移量
     * @param {string} [filters.sort] - 排序方式
     */
    QuestionBank.prototype.filter = function (filters) {
        filters = filters || {};
        var results = this.questions.slice();

        // 按题型筛选
        if (filters.type) {
            var types = Array.isArray(filters.type) ? filters.type : [filters.type];
            results = results.filter(function (q) {
                return types.indexOf(q.type) !== -1;
            });
        }

        // 按部门筛选
        if (filters.department) {
            var depts = Array.isArray(filters.department) ? filters.department : [filters.department];
            results = results.filter(function (q) {
                return depts.indexOf(q.department) !== -1;
            });
        }

        // 按难度筛选
        if (filters.difficulty) {
            var diffs = Array.isArray(filters.difficulty) ? filters.difficulty : [filters.difficulty];
            results = results.filter(function (q) {
                return diffs.indexOf(q.difficulty) !== -1;
            });
        }

        // 按标签筛选
        if (filters.tags) {
            var tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
            results = results.filter(function (q) {
                return tags.some(function (tag) {
                    return q.tags && q.tags.indexOf(tag) !== -1;
                });
            });
        }

        // 关键词搜索
        if (filters.keyword) {
            var keyword = filters.keyword.toLowerCase().trim();
            if (keyword) {
                results = results.filter(function (q) {
                    var searchText = (q.title + ' ' + (q.options ? q.options.join(' ') : '') + ' ' + (q.explanation || '')).toLowerCase();
                    return searchText.indexOf(keyword) !== -1;
                });
            }
        }

        // 排序
        if (filters.sort === 'random') {
            results = Utils.shuffle(results);
        } else if (filters.sort === 'difficulty') {
            var diffOrder = { easy: 1, medium: 2, hard: 3 };
            results.sort(function (a, b) {
                return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
            });
        } else if (filters.sort === 'type') {
            results.sort(function (a, b) {
                return a.type.localeCompare(b.type);
            });
        }
        // 默认按索引顺序

        // 分页
        var total = results.length;
        var offset = filters.offset || 0;
        var limit = filters.limit || results.length;
        var pagedResults = results.slice(offset, offset + limit);

        return {
            questions: pagedResults,
            total: total,
            offset: offset,
            limit: limit,
            hasMore: offset + limit < total,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        };
    };

    /**
     * 搜索题目
     * @param {string} keyword - 关键词
     * @param {Object} [options] - 搜索选项
     */
    QuestionBank.prototype.search = function (keyword, options) {
        options = options || {};
        var filters = Utils.deepClone(options);
        filters.keyword = keyword;
        return this.filter(filters);
    };

    /**
     * 随机抽取题目
     * @param {number} count - 抽取数量
     * @param {Object} [filters] - 筛选条件
     */
    QuestionBank.prototype.randomPick = function (count, filters) {
        filters = filters || {};
        filters.sort = 'random';
        filters.limit = count;
        var result = this.filter(filters);
        return result.questions;
    };

    /**
     * 按比例抽题（多题型混合）
     * @param {Object} ratios - 各题型比例 { single: 0.6, multiple: 0.3, judge: 0.1 }
     * @param {number} totalCount - 总题数
     * @param {Object} [filters] - 额外筛选条件
     */
    QuestionBank.prototype.pickByRatio = function (ratios, totalCount, filters) {
        filters = filters || {};
        var picked = [];
        var remaining = totalCount;
        var types = Object.keys(ratios);

        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var ratio = ratios[type];
            var count = Math.round(totalCount * ratio);

            // 最后一个类型补足剩余
            if (i === types.length - 1) {
                count = remaining;
            }

            var typeFilters = Utils.deepClone(filters);
            typeFilters.type = type;
            typeFilters.sort = 'random';
            typeFilters.limit = count;

            var result = this.filter(typeFilters);
            picked = picked.concat(result.questions);
            remaining -= result.questions.length;
        }

        // 如果不够，从所有题型中补
        if (picked.length < totalCount) {
            var pickedIds = picked.map(function (q) { return q.id; });
            var extraFilters = Utils.deepClone(filters);
            extraFilters.sort = 'random';
            extraFilters.limit = totalCount - picked.length;
            var extraResult = this.filter(extraFilters);
            for (var j = 0; j < extraResult.questions.length; j++) {
                if (pickedIds.indexOf(extraResult.questions[j].id) === -1) {
                    picked.push(extraResult.questions[j]);
                    pickedIds.push(extraResult.questions[j].id);
                }
            }
        }

        return Utils.shuffle(picked.slice(0, totalCount));
    };

    /**
     * 获取部门列表
     */
    QuestionBank.prototype.getDepartments = function () {
        return this.departments.slice();
    };

    /**
     * 获取部门详细信息（含题目数量）
     */
    QuestionBank.prototype.getDepartmentStats = function () {
        var stats = [];
        for (var dept in this.departmentMap) {
            if (this.departmentMap.hasOwnProperty(dept)) {
                var questionIds = this.departmentMap[dept];
                var typeCount = {};
                for (var i = 0; i < questionIds.length; i++) {
                    var q = this.questionMap[questionIds[i]];
                    if (q) {
                        typeCount[q.type] = (typeCount[q.type] || 0) + 1;
                    }
                }
                stats.push({
                    name: dept,
                    count: questionIds.length,
                    types: typeCount
                });
            }
        }
        return stats.sort(function (a, b) { return b.count - a.count; });
    };

    /**
     * 获取题型统计
     */
    QuestionBank.prototype.getTypeStats = function () {
        return Utils.deepClone(this.metadata.types);
    };

    /**
     * 获取难度统计
     */
    QuestionBank.prototype.getDifficultyStats = function () {
        return Utils.deepClone(this.metadata.difficulty);
    };

    /**
     * 获取元数据
     */
    QuestionBank.prototype.getMetadata = function () {
        return Utils.deepClone(this.metadata);
    };

    /**
     * 获取总题数
     */
    QuestionBank.prototype.getTotalCount = function () {
        return this.questions.length;
    };

    /**
     * 分页获取题目
     * @param {number} page - 页码（从1开始）
     * @param {number} pageSize - 每页数量
     * @param {Object} [filters] - 筛选条件
     */
    QuestionBank.prototype.getPage = function (page, pageSize, filters) {
        page = Math.max(1, page);
        pageSize = pageSize || 20;
        filters = filters || {};
        filters.offset = (page - 1) * pageSize;
        filters.limit = pageSize;
        return this.filter(filters);
    };

    /**
     * 添加题目
     */
    QuestionBank.prototype.addQuestion = function (question) {
        var q = this._normalizeQuestion(question, this.questions.length);
        this.questions.push(q);
        this.questionMap[q.id] = q;

        // 更新索引
        if (!this.departmentMap[q.department]) {
            this.departmentMap[q.department] = [];
            this.departments.push(q.department);
        }
        this.departmentMap[q.department].push(q.id);

        // 更新统计
        this.metadata.total++;
        this.metadata.types[q.type] = (this.metadata.types[q.type] || 0) + 1;
        this.metadata.departments[q.department] = (this.metadata.departments[q.department] || 0) + 1;
        var diff = q.difficulty.toLowerCase();
        if (this.metadata.difficulty[diff] !== undefined) {
            this.metadata.difficulty[diff]++;
        }

        this.emit('question:added', { question: q });
        return q;
    };

    /**
     * 更新题目
     */
    QuestionBank.prototype.updateQuestion = function (id, updates) {
        var q = this.questionMap[id];
        if (!q) return null;
        for (var key in updates) {
            if (updates.hasOwnProperty(key)) {
                q[key] = updates[key];
            }
        }
        q.updatedAt = Date.now();
        this.emit('question:updated', { question: q });
        return q;
    };

    /**
     * 删除题目
     */
    QuestionBank.prototype.removeQuestion = function (id) {
        var q = this.questionMap[id];
        if (!q) return false;

        // 从数组中移除
        var index = this.questions.indexOf(q);
        if (index !== -1) {
            this.questions.splice(index, 1);
        }

        // 从索引中移除
        delete this.questionMap[id];

        // 从部门索引中移除
        if (this.departmentMap[q.department]) {
            var deptIndex = this.departmentMap[q.department].indexOf(id);
            if (deptIndex !== -1) {
                this.departmentMap[q.department].splice(deptIndex, 1);
            }
        }

        // 更新统计
        this.metadata.total--;
        if (this.metadata.types[q.type]) {
            this.metadata.types[q.type]--;
        }
        if (this.metadata.departments[q.department]) {
            this.metadata.departments[q.department]--;
        }
        var diff = q.difficulty.toLowerCase();
        if (this.metadata.difficulty[diff] !== undefined) {
            this.metadata.difficulty[diff]--;
        }

        this.emit('question:removed', { id: id, question: q });
        return true;
    };

    /**
     * 清空题库
     */
    QuestionBank.prototype.clear = function () {
        this.questions = [];
        this.questionMap = {};
        this.departments = [];
        this.departmentMap = {};
        this.metadata = {
            total: 0,
            types: {},
            departments: {},
            difficulty: { easy: 0, medium: 0, hard: 0 }
        };
        this.isLoaded = false;
        Utils.storage.remove(this.storageKey);
        this.emit('cleared');
    };

    // ============================================================
    //  QuizEngine - 答题引擎基类
    // ============================================================

    /**
     * 答题引擎基类
     * 所有刷题模式的父类，提供基础的答题功能
     */
    function QuizEngine(options) {
        EventEmitter.call(this);
        options = options || {};

        // 题库引用
        this.questionBank = options.questionBank || null;

        // 题目队列
        this.questionQueue = [];
        this.currentIndex = -1;

        // 答题记录
        this.answers = {}; // { questionId: { answer: [], isCorrect: boolean, timeSpent: number, timestamp: number } }
        this.markedQuestions = {}; // { questionId: true }

        // 状态
        this.isStarted = false;
        this.isPaused = false;
        this.isEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.questionStartTime = null;

        // 统计
        this.stats = {
            total: 0,
            answered: 0,
            correct: 0,
            wrong: 0,
            skipped: 0,
            marked: 0,
            totalTimeSpent: 0
        };

        // 配置
        this.config = {
            showExplanation: true,
            autoNext: false,
            allowBack: true,
            allowJump: true,
            shuffleOptions: false,
            strictMode: false,
            saveProgress: true,
            ...options.config
        };

        // 模式名称
        this.modeName = 'base';
        this.modeTitle = '基础模式';

        // 进度保存键
        this.progressKey = 'sz_progress_' + this.modeName;

        this._init();
    }

    // 继承EventEmitter
    QuizEngine.prototype = Object.create(EventEmitter.prototype);
    QuizEngine.prototype.constructor = QuizEngine;

    /**
     * 初始化
     */
    QuizEngine.prototype._init = function () {
        // 子类可重写此方法进行初始化
    };

    /**
     * 初始化题目队列
     */
    QuizEngine.prototype._initQueue = function (questions) {
        this.questionQueue = questions || [];
        this.currentIndex = -1;
        this.answers = {};
        this.markedQuestions = {};
        this.stats.total = this.questionQueue.length;
        this.stats.answered = 0;
        this.stats.correct = 0;
        this.stats.wrong = 0;
        this.stats.skipped = 0;
        this.stats.marked = 0;
        this.stats.totalTimeSpent = 0;
    };

    /**
     * 初始化（外部调用）
     * @param {Object} options - 初始化选项
     */
    QuizEngine.prototype.init = function (options) {
        options = options || {};
        this.config = { ...this.config, ...options.config };
        if (options.questionBank) {
            this.questionBank = options.questionBank;
        }
        this.emit('init', { options: options });
        return this;
    };

    /**
     * 开始答题
     */
    QuizEngine.prototype.start = function () {
        if (!this.questionBank) {
            this.emit('error', { error: 'QuestionBank not set' });
            return this;
        }

        this.isStarted = true;
        this.isEnded = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.endTime = null;

        // 构建题目队列（子类实现）
        this._buildQueue();

        // 跳转到第一题
        if (this.questionQueue.length > 0) {
            this.currentIndex = 0;
            this.questionStartTime = Date.now();
            this.emit('start', {
                total: this.questionQueue.length,
                firstQuestion: this.getCurrentQuestion()
            });
            Utils.triggerEvent('quiz:start', { mode: this.modeName, total: this.questionQueue.length });
        } else {
            this.emit('error', { error: 'No questions available' });
        }

        return this;
    };

    /**
     * 构建题目队列（子类重写）
     */
    QuizEngine.prototype._buildQueue = function () {
        // 默认：获取全部题目
        if (this.questionBank) {
            this._initQueue(this.questionBank.questions.slice());
        }
    };

    /**
     * 获取当前题目
     */
    QuizEngine.prototype.getCurrentQuestion = function () {
        if (this.currentIndex < 0 || this.currentIndex >= this.questionQueue.length) {
            return null;
        }
        var q = this.questionQueue[this.currentIndex];
        // 打乱选项（如果配置了）
        if (this.config.shuffleOptions && q.options && q.options.length > 0) {
            var shuffledQ = Utils.deepClone(q);
            // 需要保存正确答案的原始位置对应关系
            var correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
            var optionIndices = q.options.map(function (_, i) { return i; });
            var shuffledIndices = Utils.shuffle(optionIndices);
            shuffledQ.options = shuffledIndices.map(function (idx) { return q.options[idx]; });
            // 重新映射正确答案
            shuffledQ.answer = correctAnswers.map(function (ans) {
                var originalIdx = typeof ans === 'number' ? ans : q.options.indexOf(ans);
                var newIdx = shuffledIndices.indexOf(originalIdx);
                return typeof ans === 'number' ? newIdx : shuffledQ.options[newIdx];
            });
            if (!Array.isArray(q.answer)) {
                shuffledQ.answer = shuffledQ.answer[0];
            }
            return shuffledQ;
        }
        return q;
    };

    /**
     * 提交答案
     * @param {Array|string} answer - 用户答案
     */
    QuizEngine.prototype.submitAnswer = function (answer) {
        if (this.isEnded) {
            return { success: false, reason: 'quiz_ended' };
        }

        var question = this.getCurrentQuestion();
        if (!question) {
            return { success: false, reason: 'no_question' };
        }

        var timeSpent = Date.now() - this.questionStartTime;
        var isCorrect = Utils.checkAnswer(answer, question.answer, question.type);

        // 检查是否已经答过
        var wasAnswered = this.answers[question.id] !== undefined;
        var wasCorrect = wasAnswered && this.answers[question.id].isCorrect;

        // 保存答案
        this.answers[question.id] = {
            answer: answer,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            timestamp: Date.now(),
            index: this.currentIndex
        };

        // 更新统计
        if (!wasAnswered) {
            this.stats.answered++;
            if (isCorrect) {
                this.stats.correct++;
            } else {
                this.stats.wrong++;
            }
        } else {
            // 之前答错现在答对
            if (!wasCorrect && isCorrect) {
                this.stats.correct++;
                this.stats.wrong--;
            }
            // 之前答对现在答错
            if (wasCorrect && !isCorrect) {
                this.stats.correct--;
                this.stats.wrong++;
            }
        }

        this.stats.totalTimeSpent += timeSpent;

        // 记录到统计系统
        this._recordAnswer(question, answer, isCorrect, timeSpent);

        // 触发事件
        this.emit('answer', {
            question: question,
            answer: answer,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            stats: this.getStats()
        });

        Utils.triggerEvent('quiz:answer', {
            mode: this.modeName,
            questionId: question.id,
            isCorrect: isCorrect
        });

        // 音效系统联动
        this._playSound(isCorrect ? 'correct' : 'wrong');

        // 粒子特效联动
        if (isCorrect) {
            this._triggerParticleEffect('correct');
        }

        var result = {
            success: true,
            isCorrect: isCorrect,
            question: question,
            userAnswer: answer,
            correctAnswer: question.answer,
            explanation: question.explanation,
            stats: this.getStats()
        };

        // 自动下一题
        if (this.config.autoNext && isCorrect) {
            var self = this;
            setTimeout(function () {
                self.next();
            }, 1000);
        }

        return result;
    };

    /**
     * 记录答题数据（子类可重写以接入统计系统）
     */
    QuizEngine.prototype._recordAnswer = function (question, answer, isCorrect, timeSpent) {
        // 与统计系统联动
        if (SZ.stats && typeof SZ.stats.recordAnswer === 'function') {
            SZ.stats.recordAnswer({
                mode: this.modeName,
                questionId: question.id,
                questionType: question.type,
                department: question.department,
                isCorrect: isCorrect,
                timeSpent: timeSpent,
                timestamp: Date.now()
            });
        }

        // 本地答题记录
        var recordKey = 'sz_answer_records';
        var records = Utils.storage.get(recordKey, []);
        records.push({
            mode: this.modeName,
            questionId: question.id,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            date: Utils.getToday(),
            timestamp: Date.now()
        });
        // 只保留最近10000条
        if (records.length > 10000) {
            records = records.slice(records.length - 10000);
        }
        Utils.storage.set(recordKey, records);
    };

    /**
     * 播放音效
     */
    QuizEngine.prototype._playSound = function (type) {
        if (SZ.sound && typeof SZ.sound.play === 'function') {
            SZ.sound.play(type);
        }
    };

    /**
     * 触发粒子特效
     */
    QuizEngine.prototype._triggerParticleEffect = function (type) {
        if (SZ.particles && typeof SZ.particles.trigger === 'function') {
            SZ.particles.trigger(type);
        }
    };

    /**
     * 下一题
     */
    QuizEngine.prototype.next = function () {
        if (this.isEnded) {
            this.emit('ended', this.getResult());
            return null;
        }

        if (this.currentIndex < this.questionQueue.length - 1) {
            this.currentIndex++;
            this.questionStartTime = Date.now();
            this.emit('next', {
                index: this.currentIndex,
                question: this.getCurrentQuestion()
            });
            this._saveProgress();
            return this.getCurrentQuestion();
        } else {
            // 已经是最后一题
            this._onLastQuestionReached();
            return null;
        }
    };

    /**
     * 到达最后一题（子类可重写）
     */
    QuizEngine.prototype._onLastQuestionReached = function () {
        this.emit('lastQuestion', { index: this.currentIndex });
    };

    /**
     * 上一题
     */
    QuizEngine.prototype.prev = function () {
        if (!this.config.allowBack) {
            this.emit('error', { error: 'Back navigation not allowed' });
            return null;
        }

        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.questionStartTime = Date.now();
            this.emit('prev', {
                index: this.currentIndex,
                question: this.getCurrentQuestion()
            });
            this._saveProgress();
            return this.getCurrentQuestion();
        }
        return null;
    };

    /**
     * 跳转到指定题目
     * @param {number} index - 题目索引
     */
    QuizEngine.prototype.jumpTo = function (index) {
        if (!this.config.allowJump) {
            this.emit('error', { error: 'Jump navigation not allowed' });
            return null;
        }

        if (index >= 0 && index < this.questionQueue.length) {
            this.currentIndex = index;
            this.questionStartTime = Date.now();
            this.emit('jump', {
                index: index,
                question: this.getCurrentQuestion()
            });
            this._saveProgress();
            return this.getCurrentQuestion();
        }
        return null;
    };

    /**
     * 跳转到指定ID的题目
     */
    QuizEngine.prototype.jumpToId = function (questionId) {
        for (var i = 0; i < this.questionQueue.length; i++) {
            if (this.questionQueue[i].id === questionId) {
                return this.jumpTo(i);
            }
        }
        return null;
    };

    /**
     * 获取进度
     */
    QuizEngine.prototype.getProgress = function () {
        var total = this.questionQueue.length;
        var current = this.currentIndex + 1;
        var answered = Object.keys(this.answers).length;
        var correct = this.stats.correct;
        var accuracy = answered > 0 ? Utils.calculateAccuracy(correct, answered) : 0;

        return {
            current: current,
            total: total,
            answered: answered,
            correct: correct,
            wrong: this.stats.wrong,
            accuracy: accuracy,
            percentage: total > 0 ? Math.round((current / total) * 100) : 0,
            answeredPercentage: total > 0 ? Math.round((answered / total) * 100) : 0,
            timeSpent: this.stats.totalTimeSpent,
            formattedTime: Utils.formatTime(Math.floor(this.stats.totalTimeSpent / 1000))
        };
    };

    /**
     * 获取统计数据
     */
    QuizEngine.prototype.getStats = function () {
        return Utils.deepClone(this.stats);
    };

    /**
     * 获取答题卡数据
     */
    QuizEngine.prototype.getAnswerCard = function () {
        var card = [];
        for (var i = 0; i < this.questionQueue.length; i++) {
            var q = this.questionQueue[i];
            var answerRecord = this.answers[q.id];
            var status = 'unanswered';
            if (answerRecord) {
                status = answerRecord.isCorrect ? 'correct' : 'wrong';
            }
            if (this.markedQuestions[q.id]) {
                status = 'marked';
            }
            card.push({
                index: i,
                number: i + 1,
                questionId: q.id,
                type: q.type,
                department: q.department,
                status: status,
                isCurrent: i === this.currentIndex,
                isMarked: !!this.markedQuestions[q.id],
                isAnswered: !!answerRecord,
                isCorrect: answerRecord ? answerRecord.isCorrect : null
            });
        }

        // 分区统计
        var byDepartment = {};
        var byType = {};
        for (var j = 0; j < card.length; j++) {
            var item = card[j];
            // 按部门
            if (!byDepartment[item.department]) {
                byDepartment[item.department] = { total: 0, answered: 0, correct: 0, wrong: 0, items: [] };
            }
            byDepartment[item.department].total++;
            if (item.isAnswered) byDepartment[item.department].answered++;
            if (item.isCorrect === true) byDepartment[item.department].correct++;
            if (item.isCorrect === false) byDepartment[item.department].wrong++;
            byDepartment[item.department].items.push(item);

            // 按题型
            if (!byType[item.type]) {
                byType[item.type] = { total: 0, answered: 0, correct: 0, wrong: 0, items: [] };
            }
            byType[item.type].total++;
            if (item.isAnswered) byType[item.type].answered++;
            if (item.isCorrect === true) byType[item.type].correct++;
            if (item.isCorrect === false) byType[item.type].wrong++;
            byType[item.type].items.push(item);
        }

        return {
            questions: card,
            total: card.length,
            answered: this.stats.answered,
            correct: this.stats.correct,
            wrong: this.stats.wrong,
            marked: Object.keys(this.markedQuestions).length,
            unanswered: card.length - this.stats.answered,
            byDepartment: byDepartment,
            byType: byType
        };
    };

    /**
     * 标记/取消标记题目
     */
    QuizEngine.prototype.toggleMark = function (questionId) {
        questionId = questionId || (this.getCurrentQuestion() && this.getCurrentQuestion().id);
        if (!questionId) return false;

        if (this.markedQuestions[questionId]) {
            delete this.markedQuestions[questionId];
            this.stats.marked--;
            this.emit('unmark', { questionId: questionId });
            return false;
        } else {
            this.markedQuestions[questionId] = true;
            this.stats.marked++;
            this.emit('mark', { questionId: questionId });
            return true;
        }
    };

    /**
     * 检查题目是否被标记
     */
    QuizEngine.prototype.isMarked = function (questionId) {
        return !!this.markedQuestions[questionId];
    };

    /**
     * 获取答题记录
     */
    QuizEngine.prototype.getAnswer = function (questionId) {
        questionId = questionId || (this.getCurrentQuestion() && this.getCurrentQuestion().id);
        return questionId ? this.answers[questionId] || null : null;
    };

    /**
     * 暂停
     */
    QuizEngine.prototype.pause = function () {
        if (this.isEnded || !this.isStarted) return false;
        this.isPaused = true;
        this.emit('pause', { timeSpent: this.stats.totalTimeSpent });
        return true;
    };

    /**
     * 继续
     */
    QuizEngine.prototype.resume = function () {
        if (!this.isPaused || this.isEnded) return false;
        this.isPaused = false;
        this.questionStartTime = Date.now();
        this.emit('resume');
        return true;
    };

    /**
     * 结束答题
     */
    QuizEngine.prototype.end = function () {
        if (this.isEnded) return this.getResult();

        this.isEnded = true;
        this.endTime = Date.now();

        var result = this.getResult();

        // 清除进度保存
        if (!this.config.saveProgress) {
            this._clearProgress();
        }

        this.emit('end', result);
        Utils.triggerEvent('quiz:end', {
            mode: this.modeName,
            result: result
        });

        return result;
    };

    /**
     * 获取最终结果
     */
    QuizEngine.prototype.getResult = function () {
        var total = this.questionQueue.length;
        var answered = this.stats.answered;
        var correct = this.stats.correct;
        var wrong = this.stats.wrong;
        var accuracy = answered > 0 ? Utils.calculateAccuracy(correct, answered) : 0;
        var totalTime = this.endTime ? (this.endTime - this.startTime) : (Date.now() - this.startTime);

        return {
            mode: this.modeName,
            modeTitle: this.modeTitle,
            total: total,
            answered: answered,
            unanswered: total - answered,
            correct: correct,
            wrong: wrong,
            accuracy: accuracy,
            score: Math.round(accuracy),
            totalTime: totalTime,
            formattedTotalTime: Utils.formatTime(Math.floor(totalTime / 1000)),
            avgTimePerQuestion: answered > 0 ? Math.round(totalTime / answered) : 0,
            marked: Object.keys(this.markedQuestions).length,
            wrongQuestions: this._getWrongQuestions(),
            correctQuestions: this._getCorrectQuestions(),
            answers: Utils.deepClone(this.answers),
            startTime: this.startTime,
            endTime: this.endTime || Date.now()
        };
    };

    /**
     * 获取错题列表
     */
    QuizEngine.prototype._getWrongQuestions = function () {
        var wrong = [];
        for (var id in this.answers) {
            if (this.answers.hasOwnProperty(id) && !this.answers[id].isCorrect) {
                var q = this.questionBank ? this.questionBank.getById(id) : null;
                if (q) {
                    wrong.push({
                        question: q,
                        userAnswer: this.answers[id].answer,
                        timeSpent: this.answers[id].timeSpent
                    });
                }
            }
        }
        return wrong;
    };

    /**
     * 获取正确题目列表
     */
    QuizEngine.prototype._getCorrectQuestions = function () {
        var correct = [];
        for (var id in this.answers) {
            if (this.answers.hasOwnProperty(id) && this.answers[id].isCorrect) {
                var q = this.questionBank ? this.questionBank.getById(id) : null;
                if (q) {
                    correct.push({
                        question: q,
                        userAnswer: this.answers[id].answer,
                        timeSpent: this.answers[id].timeSpent
                    });
                }
            }
        }
        return correct;
    };

    /**
     * 保存进度
     */
    QuizEngine.prototype._saveProgress = function () {
        if (!this.config.saveProgress) return;

        var progress = {
            mode: this.modeName,
            currentIndex: this.currentIndex,
            answers: this.answers,
            markedQuestions: this.markedQuestions,
            stats: this.stats,
            questionIds: this.questionQueue.map(function (q) { return q.id; }),
            startTime: this.startTime,
            savedAt: Date.now()
        };

        Utils.storage.set(this.progressKey, progress);
    };

    /**
     * 恢复进度
     */
    QuizEngine.prototype._restoreProgress = function () {
        var progress = Utils.storage.get(this.progressKey, null);
        if (!progress || !this.questionBank) return false;

        this.questionQueue = [];
        for (var i = 0; i < progress.questionIds.length; i++) {
            var q = this.questionBank.getById(progress.questionIds[i]);
            if (q) {
                this.questionQueue.push(q);
            }
        }

        this.currentIndex = progress.currentIndex || 0;
        this.answers = progress.answers || {};
        this.markedQuestions = progress.markedQuestions || {};
        this.stats = progress.stats || this.stats;
        this.startTime = progress.startTime || Date.now();
        this.isStarted = true;
        this.questionStartTime = Date.now();

        return true;
    };

    /**
     * 清除进度
     */
    QuizEngine.prototype._clearProgress = function () {
        Utils.storage.remove(this.progressKey);
    };

    /**
     * 重置
     */
    QuizEngine.prototype.reset = function () {
        this._initQueue([]);
        this.isStarted = false;
        this.isPaused = false;
        this.isEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.questionStartTime = null;
        this._clearProgress();
        this.emit('reset');
        return this;
    };

    /**
     * 批量标记
     * @param {Array} indices - 题目索引数组
     * @param {boolean} marked - 是否标记
     */
    QuizEngine.prototype.batchMark = function (indices, marked) {
        for (var i = 0; i < indices.length; i++) {
            var idx = indices[i];
            if (idx >= 0 && idx < this.questionQueue.length) {
                var qid = this.questionQueue[idx].id;
                if (marked) {
                    if (!this.markedQuestions[qid]) {
                        this.markedQuestions[qid] = true;
                        this.stats.marked++;
                    }
                } else {
                    if (this.markedQuestions[qid]) {
                        delete this.markedQuestions[qid];
                        this.stats.marked--;
                    }
                }
            }
        }
        this.emit('batchMark', { marked: marked, count: indices.length });
    };

    // ============================================================
    //  模式 1: 顺序模式 SequentialMode
    // ============================================================

    /**
     * 顺序模式
     * 按题号顺序刷题，支持从上次位置继续
     */
    function SequentialMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'sequential';
        this.modeTitle = '顺序模式';
        this.progressKey = 'sz_progress_sequential';

        this.startIndex = 0;
        this.filters = {
            department: null,
            type: null,
            difficulty: null
        };

        if (options) {
            if (options.startIndex !== undefined) {
                this.startIndex = options.startIndex;
            }
            if (options.filters) {
                this.filters = { ...this.filters, ...options.filters };
            }
            if (options.continueFromLast !== undefined) {
                this.continueFromLast = options.continueFromLast;
            }
        }
    }

    SequentialMode.prototype = Object.create(QuizEngine.prototype);
    SequentialMode.prototype.constructor = SequentialMode;

    SequentialMode.prototype._buildQueue = function () {
        var filters = {};
        if (this.filters.department) filters.department = this.filters.department;
        if (this.filters.type) filters.type = this.filters.type;
        if (this.filters.difficulty) filters.difficulty = this.filters.difficulty;

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);

        // 设置起始位置
        if (this.continueFromLast) {
            var restored = this._restoreProgress();
            if (restored) {
                this.emit('progressRestored', { index: this.currentIndex });
                return;
            }
        }

        this.currentIndex = Math.max(0, Math.min(this.startIndex, this.questionQueue.length - 1));
    };

    SequentialMode.prototype.setStartIndex = function (index) {
        this.startIndex = Math.max(0, index);
        return this;
    };

    SequentialMode.prototype.setFilters = function (filters) {
        this.filters = { ...this.filters, ...filters };
        return this;
    };

    SequentialMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.startIndex !== undefined) this.startIndex = options.startIndex;
        if (options.filters) this.filters = { ...this.filters, ...options.filters };
        if (options.continueFromLast !== undefined) this.continueFromLast = options.continueFromLast;
        return this;
    };

    // ============================================================
    //  模式 2: 乱序模式 ShuffleMode
    // ============================================================

    /**
     * 乱序模式
     * 题目随机打乱顺序，可重新洗牌
     */
    function ShuffleMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'shuffle';
        this.modeTitle = '乱序模式';
        this.progressKey = 'sz_progress_shuffle';

        this.filters = {
            department: null,
            type: null,
            difficulty: null
        };
        this.shuffleCount = 0;

        if (options) {
            if (options.filters) {
                this.filters = { ...this.filters, ...options.filters };
            }
        }
    }

    ShuffleMode.prototype = Object.create(QuizEngine.prototype);
    ShuffleMode.prototype.constructor = ShuffleMode;

    ShuffleMode.prototype._buildQueue = function () {
        var filters = { sort: 'random' };
        if (this.filters.department) filters.department = this.filters.department;
        if (this.filters.type) filters.type = this.filters.type;
        if (this.filters.difficulty) filters.difficulty = this.filters.difficulty;

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;
        this.shuffleCount++;
    };

    /**
     * 重新洗牌
     */
    ShuffleMode.prototype.reshuffle = function (keepProgress) {
        var currentAnswers = keepProgress ? Utils.deepClone(this.answers) : {};
        var currentMarked = keepProgress ? Utils.deepClone(this.markedQuestions) : {};

        var answeredIds = Object.keys(currentAnswers);
        var remainingQuestions = [];
        var answeredQuestions = [];

        // 重新获取所有题目并打乱
        var filters = { sort: 'random' };
        if (this.filters.department) filters.department = this.filters.department;
        if (this.filters.type) filters.type = this.filters.type;
        if (this.filters.difficulty) filters.difficulty = this.filters.difficulty;

        var result = this.questionBank.filter(filters);

        if (keepProgress) {
            // 分开已答和未答
            for (var i = 0; i < result.questions.length; i++) {
                var q = result.questions[i];
                if (answeredIds.indexOf(q.id) !== -1) {
                    answeredQuestions.push(q);
                } else {
                    remainingQuestions.push(q);
                }
            }
            this.questionQueue = remainingQuestions.concat(answeredQuestions);
        } else {
            this.questionQueue = result.questions;
        }

        this.answers = currentAnswers;
        this.markedQuestions = currentMarked;
        this.currentIndex = keepProgress ? remainingQuestions.length - 1 : -1;
        this.shuffleCount++;

        this.emit('reshuffle', {
            shuffleCount: this.shuffleCount,
            keepProgress: keepProgress,
            total: this.questionQueue.length
        });

        return this.questionQueue;
    };

    ShuffleMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.filters) this.filters = { ...this.filters, ...options.filters };
        return this;
    };

    // ============================================================
    //  模式 3: 组卷模式 ExamMode
    // ============================================================

    /**
     * 组卷模式（模拟考试）
     * 计时功能，交卷后评分，支持多题型混合抽题
     */
    function ExamMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'exam';
        this.modeTitle = '组卷模式';
        this.progressKey = 'sz_progress_exam';

        // 考试配置
        this.examConfig = {
            totalQuestions: 50,
            timeLimit: 3600, // 秒，默认60分钟
            passingScore: 60,
            questionRatios: {
                single: 0.6,
                multiple: 0.3,
                judge: 0.1
            },
            allowBack: false,
            showResult: true,
            autoSubmit: true,
            shuffleQuestions: true,
            shuffleOptions: true
        };

        // 考试状态
        this.timeRemaining = 0;
        this.timerId = null;
        this.isSubmitted = false;
        this.examResult = null;

        if (options && options.examConfig) {
            this.examConfig = { ...this.examConfig, ...options.examConfig };
        }

        this.config.allowBack = this.examConfig.allowBack;
        this.config.shuffleOptions = this.examConfig.shuffleOptions;
    }

    ExamMode.prototype = Object.create(QuizEngine.prototype);
    ExamMode.prototype.constructor = ExamMode;

    ExamMode.prototype._buildQueue = function () {
        var questions = [];

        if (this.examConfig.questionRatios && Object.keys(this.examConfig.questionRatios).length > 0) {
            // 按比例抽题
            questions = this.questionBank.pickByRatio(
                this.examConfig.questionRatios,
                this.examConfig.totalQuestions
            );
        } else {
            // 随机抽题
            questions = this.questionBank.randomPick(this.examConfig.totalQuestions);
        }

        if (this.examConfig.shuffleQuestions) {
            questions = Utils.shuffle(questions);
        }

        this._initQueue(questions);
        this.currentIndex = 0;

        // 设置计时
        this.timeRemaining = this.examConfig.timeLimit;
    };

    ExamMode.prototype.start = function () {
        QuizEngine.prototype.start.call(this);
        if (this.questionQueue.length > 0) {
            this._startTimer();
        }
        return this;
    };

    /**
     * 开始计时
     */
    ExamMode.prototype._startTimer = function () {
        var self = this;
        this.timerId = setInterval(function () {
            if (!self.isPaused && !self.isEnded && !self.isSubmitted) {
                self.timeRemaining--;
                self.emit('tick', { timeRemaining: self.timeRemaining, formattedTime: Utils.formatTime(self.timeRemaining) });

                if (self.timeRemaining <= 0) {
                    self._onTimeUp();
                }
            }
        }, 1000);
    };

    /**
     * 时间到
     */
    ExamMode.prototype._onTimeUp = function () {
        this.emit('timeUp');
        if (this.examConfig.autoSubmit) {
            this.submitExam();
        }
    };

    /**
     * 交卷
     */
    ExamMode.prototype.submitExam = function () {
        if (this.isSubmitted) return this.examResult;

        this.isSubmitted = true;
        this._stopTimer();

        var result = this.getExamResult();
        this.examResult = result;

        this.end();
        this.emit('submit', result);
        Utils.triggerEvent('exam:submit', result);

        return result;
    };

    /**
     * 停止计时
     */
    ExamMode.prototype._stopTimer = function () {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    };

    /**
     * 获取考试结果
     */
    ExamMode.prototype.getExamResult = function () {
        var baseResult = this.getResult();
        var totalQuestions = this.questionQueue.length;
        var score = totalQuestions > 0 ? Math.round((this.stats.correct / totalQuestions) * 100) : 0;
        var isPassed = score >= this.examConfig.passingScore;

        // 详细错题和正确题
        var wrongList = [];
        var correctList = [];
        var unansweredList = [];

        for (var i = 0; i < this.questionQueue.length; i++) {
            var q = this.questionQueue[i];
            var ans = this.answers[q.id];
            if (ans) {
                if (ans.isCorrect) {
                    correctList.push({ question: q, userAnswer: ans.answer, timeSpent: ans.timeSpent });
                } else {
                    wrongList.push({ question: q, userAnswer: ans.answer, correctAnswer: q.answer, timeSpent: ans.timeSpent });
                }
            } else {
                unansweredList.push(q);
            }
        }

        return {
            ...baseResult,
            score: score,
            passingScore: this.examConfig.passingScore,
            isPassed: isPassed,
            timeUsed: this.examConfig.timeLimit - this.timeRemaining,
            timeRemaining: this.timeRemaining,
            totalQuestions: totalQuestions,
            correctCount: this.stats.correct,
            wrongCount: this.stats.wrong,
            unansweredCount: totalQuestions - this.stats.answered,
            wrongQuestions: wrongList,
            correctQuestions: correctList,
            unansweredQuestions: unansweredList,
            rank: this._calculateRank(score),
            grade: this._calculateGrade(score)
        };
    };

    /**
     * 计算等级
     */
    ExamMode.prototype._calculateGrade = function (score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    /**
     * 计算排名（基于本地历史）
     */
    ExamMode.prototype._calculateRank = function (score) {
        var historyKey = 'sz_exam_history';
        var history = Utils.storage.get(historyKey, []);

        // 保存本次成绩
        history.push({
            score: score,
            date: Utils.getToday(),
            timestamp: Date.now(),
            totalQuestions: this.questionQueue.length,
            mode: this.modeName
        });

        // 只保留最近100次
        if (history.length > 100) {
            history = history.slice(history.length - 100);
        }

        Utils.storage.set(historyKey, history);

        // 计算排名百分比
        var betterCount = history.filter(function (h) { return h.score > score; }).length;
        var rankPercent = Math.round((history.length - betterCount) / history.length * 100);

        return {
            rank: betterCount + 1,
            total: history.length,
            percentile: rankPercent,
            bestScore: Math.max.apply(null, history.map(function (h) { return h.score; })),
            avgScore: Math.round(history.reduce(function (sum, h) { return sum + h.score; }, 0) / history.length)
        };
    };

    ExamMode.prototype.end = function () {
        this._stopTimer();
        return QuizEngine.prototype.end.call(this);
    };

    ExamMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.examConfig) {
            this.examConfig = { ...this.examConfig, ...options.examConfig };
            this.config.allowBack = this.examConfig.allowBack;
            this.config.shuffleOptions = this.examConfig.shuffleOptions;
        }
        return this;
    };

    ExamMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this.isSubmitted = false;
        this.examResult = null;
        this.timeRemaining = this.examConfig.timeLimit;
        this._stopTimer();
        return this;
    };

    // ============================================================
    //  模式 4: 按部门刷题 DepartmentMode
    // ============================================================

    /**
     * 按部门刷题模式
     * 选择部门后刷题，显示部门掌握度
     */
    function DepartmentMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'department';
        this.modeTitle = '按部门刷题';
        this.progressKey = 'sz_progress_department';

        this.currentDepartment = null;
        this.departmentOrder = 'sequential'; // sequential | shuffle
        this.departmentStats = {};

        if (options) {
            if (options.department) this.currentDepartment = options.department;
            if (options.order) this.departmentOrder = options.order;
        }
    }

    DepartmentMode.prototype = Object.create(QuizEngine.prototype);
    DepartmentMode.prototype.constructor = DepartmentMode;

    DepartmentMode.prototype._buildQueue = function () {
        if (!this.currentDepartment) {
            // 默认选第一个部门
            var depts = this.questionBank.getDepartments();
            this.currentDepartment = depts[0] || null;
        }

        var filters = { department: this.currentDepartment };
        if (this.departmentOrder === 'shuffle') {
            filters.sort = 'random';
        }

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;

        // 加载部门掌握度
        this._loadDepartmentStats();
    };

    /**
     * 加载部门掌握度统计
     */
    DepartmentMode.prototype._loadDepartmentStats = function () {
        var statsKey = 'sz_department_stats';
        var allStats = Utils.storage.get(statsKey, {});
        this.departmentStats = allStats[this.currentDepartment] || {
            totalAnswered: 0,
            totalCorrect: 0,
            masteryLevel: 0,
            lastStudyTime: null,
            studyDays: 0
        };
    };

    /**
     * 保存部门掌握度
     */
    DepartmentMode.prototype._saveDepartmentStats = function () {
        var statsKey = 'sz_department_stats';
        var allStats = Utils.storage.get(statsKey, {});
        this.departmentStats.lastStudyTime = Date.now();

        // 更新掌握度
        var total = this.questionQueue.length;
        var answered = this.stats.answered;
        var correct = this.stats.correct;
        var accuracy = answered > 0 ? correct / answered : 0;

        // 掌握度 = 正确率 * 完成率，范围 0-100
        var completionRate = answered / Math.max(1, total);
        this.departmentStats.masteryLevel = Math.round(accuracy * completionRate * 100);
        this.departmentStats.totalAnswered = answered;
        this.departmentStats.totalCorrect = correct;

        allStats[this.currentDepartment] = this.departmentStats;
        Utils.storage.set(statsKey, allStats);
    };

    /**
     * 获取部门掌握度
     */
    DepartmentMode.prototype.getDepartmentMastery = function () {
        var total = this.questionQueue.length;
        var answered = this.stats.answered;
        var correct = this.stats.correct;
        var accuracy = answered > 0 ? Utils.calculateAccuracy(correct, answered) : 0;

        return {
            department: this.currentDepartment,
            total: total,
            answered: answered,
            correct: correct,
            accuracy: accuracy,
            masteryLevel: this.departmentStats.masteryLevel || 0,
            progress: total > 0 ? Math.round((answered / total) * 100) : 0,
            lastStudyTime: this.departmentStats.lastStudyTime
        };
    };

    /**
     * 切换部门
     */
    DepartmentMode.prototype.switchDepartment = function (dept) {
        this.currentDepartment = dept;
        this._saveDepartmentStats();

        // 重建队列
        var filters = { department: dept };
        if (this.departmentOrder === 'shuffle') {
            filters.sort = 'random';
        }
        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;
        this.startTime = Date.now();
        this.questionStartTime = Date.now();

        this._loadDepartmentStats();

        this.emit('departmentSwitch', {
            department: dept,
            total: this.questionQueue.length,
            mastery: this.getDepartmentMastery()
        });

        return this.getCurrentQuestion();
    };

    /**
     * 切换顺序/乱序
     */
    DepartmentMode.prototype.switchOrder = function (order) {
        this.departmentOrder = order;

        // 保持当前进度重新排序
        var currentId = this.getCurrentQuestion() ? this.getCurrentQuestion().id : null;
        var filters = { department: this.currentDepartment };
        if (order === 'shuffle') filters.sort = 'random';

        var result = this.questionBank.filter(filters);
        this.questionQueue = result.questions;

        // 定位到当前题
        if (currentId) {
            for (var i = 0; i < this.questionQueue.length; i++) {
                if (this.questionQueue[i].id === currentId) {
                    this.currentIndex = i;
                    break;
                }
            }
        }

        this.emit('orderSwitch', { order: order });
        return this;
    };

    DepartmentMode.prototype.submitAnswer = function (answer) {
        var result = QuizEngine.prototype.submitAnswer.call(this, answer);
        if (result.success) {
            this._saveDepartmentStats();
        }
        return result;
    };

    DepartmentMode.prototype.end = function () {
        this._saveDepartmentStats();
        return QuizEngine.prototype.end.call(this);
    };

    DepartmentMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.department) this.currentDepartment = options.department;
        if (options.order) this.departmentOrder = options.order;
        return this;
    };

    // ============================================================
    //  模式 5: 遗忘曲线模式 ForgettingCurveMode
    // ============================================================

    /**
     * 遗忘曲线模式
     * 基于艾宾浩斯遗忘曲线，复习间隔：1天、2天、4天、7天、15天
     * 掌握度等级系统（0-5级）
     */
    function ForgettingCurveMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'forgetting_curve';
        this.modeTitle = '遗忘曲线模式';
        this.progressKey = 'sz_progress_forgetting';

        // 艾宾浩斯复习间隔（天）
        this.reviewIntervals = [1, 2, 4, 7, 15, 30];
        // 掌握度等级 0-5
        this.masteryData = {}; // { questionId: { level: 0-5, lastReview: timestamp, nextReview: timestamp, reviewCount: 0 } }
        this.masteryStorageKey = 'sz_mastery_data';

        // 配置
        this.forgettingConfig = {
            maxDailyReviews: 100,
            includeNewQuestions: true,
            newQuestionRatio: 0.3,
            minMasteryToAdvance: 2, // 答对几次后升级
            autoSchedule: true
        };

        if (options && options.forgettingConfig) {
            this.forgettingConfig = { ...this.forgettingConfig, ...options.forgettingConfig };
        }

        this._loadMasteryData();
    }

    ForgettingCurveMode.prototype = Object.create(QuizEngine.prototype);
    ForgettingCurveMode.prototype.constructor = ForgettingCurveMode;

    /**
     * 加载掌握度数据
     */
    ForgettingCurveMode.prototype._loadMasteryData = function () {
        this.masteryData = Utils.storage.get(this.masteryStorageKey, {});
    };

    /**
     * 保存掌握度数据
     */
    ForgettingCurveMode.prototype._saveMasteryData = function () {
        Utils.storage.set(this.masteryStorageKey, this.masteryData);
    };

    ForgettingCurveMode.prototype._buildQueue = function () {
        var self = this;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        // 获取所有需要复习的题目（下次复习时间在今天或之前）
        var dueQuestions = [];
        var newQuestions = [];
        var allQuestions = this.questionBank.questions;

        for (var i = 0; i < allQuestions.length; i++) {
            var q = allQuestions[i];
            var mastery = this.masteryData[q.id];

            if (!mastery) {
                // 新题目
                newQuestions.push(q);
            } else if (mastery.nextReview <= todayTime && mastery.level < 6) {
                // 需要复习的题目
                dueQuestions.push({ question: q, mastery: mastery });
            }
        }

        // 按紧急程度排序（越逾期越靠前）
        dueQuestions.sort(function (a, b) {
            var urgencyA = todayTime - a.mastery.nextReview;
            var urgencyB = todayTime - b.mastery.nextReview;
            // 优先级：逾期程度 > 掌握度低 > 复习次数少
            if (urgencyB !== urgencyA) return urgencyB - urgencyA;
            if (a.mastery.level !== b.mastery.level) return a.mastery.level - b.mastery.level;
            return a.mastery.reviewCount - b.mastery.reviewCount;
        });

        // 计算新题数量
        var maxQuestions = this.forgettingConfig.maxDailyReviews;
        var dueCount = Math.min(dueQuestions.length, maxQuestions);
        var newCount = this.forgettingConfig.includeNewQuestions
            ? Math.min(
                newQuestions.length,
                Math.floor(maxQuestions * this.forgettingConfig.newQuestionRatio),
                maxQuestions - dueCount
            )
            : 0;

        // 选择复习题
        var selectedDue = dueQuestions.slice(0, dueCount).map(function (d) { return d.question; });

        // 选择新题（随机）
        var selectedNew = Utils.sample(newQuestions, newCount);

        // 组合队列：新题和复习题交替出现，或者复习题在前
        this._initQueue(this._interleaveQuestions(selectedDue, selectedNew));
        this.currentIndex = 0;

        this.dueCount = dueCount;
        this.newCount = newCount;
    };

    /**
     * 交错排列复习题和新题
     */
    ForgettingCurveMode.prototype._interleaveQuestions = function (reviewQ, newQ) {
        var result = [];
        var rIdx = 0;
        var nIdx = 0;

        // 先复习后新题
        while (rIdx < reviewQ.length) {
            result.push(reviewQ[rIdx++]);
        }
        while (nIdx < newQ.length) {
            result.push(newQ[nIdx++]);
        }

        return result;
    };

    /**
     * 提交答案并更新掌握度
     */
    ForgettingCurveMode.prototype.submitAnswer = function (answer) {
        var result = QuizEngine.prototype.submitAnswer.call(this, answer);
        if (!result.success) return result;

        var question = result.question;
        var isCorrect = result.isCorrect;

        // 更新掌握度
        this._updateMastery(question.id, isCorrect);

        // 触发事件
        var mastery = this.masteryData[question.id];
        this.emit('masteryUpdate', {
            questionId: question.id,
            level: mastery.level,
            nextReview: mastery.nextReview,
            reviewCount: mastery.reviewCount
        });

        return result;
    };

    /**
     * 更新掌握度等级
     */
    ForgettingCurveMode.prototype._updateMastery = function (questionId, isCorrect) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        if (!this.masteryData[questionId]) {
            this.masteryData[questionId] = {
                level: 0,
                lastReview: null,
                nextReview: todayTime,
                reviewCount: 0,
                correctCount: 0,
                wrongCount: 0
            };
        }

        var mastery = this.masteryData[questionId];
        mastery.lastReview = Date.now();
        mastery.reviewCount++;

        if (isCorrect) {
            mastery.correctCount++;
            // 连续答对升级
            mastery.level = Math.min(mastery.level + 1, this.reviewIntervals.length);
        } else {
            mastery.wrongCount++;
            // 答错降级（但不低于0）
            mastery.level = Math.max(mastery.level - 1, 0);
            if (mastery.level === 0) {
                // 0级答错了，当天再复习
                mastery.level = 0;
            }
        }

        // 计算下次复习时间
        if (mastery.level < this.reviewIntervals.length) {
            var intervalDays = this.reviewIntervals[mastery.level] || 1;
            mastery.nextReview = todayTime + intervalDays * 24 * 60 * 60 * 1000;
        } else {
            // 完全掌握了，30天后再复习
            mastery.nextReview = todayTime + 30 * 24 * 60 * 60 * 1000;
        }

        this._saveMasteryData();
    };

    /**
     * 获取今日待复习统计
     */
    ForgettingCurveMode.prototype.getTodayStats = function () {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        var dueCount = 0;
        var newCount = 0;
        var masteredCount = 0;
        var totalQuestions = this.questionBank.getTotalCount();

        for (var id in this.masteryData) {
            if (this.masteryData.hasOwnProperty(id)) {
                var m = this.masteryData[id];
                if (m.nextReview <= todayTime && m.level < 6) {
                    dueCount++;
                }
                if (m.level >= 5) {
                    masteredCount++;
                }
            }
        }

        // 新题数 = 总题数 - 已学过的
        var learnedCount = Object.keys(this.masteryData).length;
        newCount = Math.max(0, totalQuestions - learnedCount);

        return {
            dueCount: dueCount,
            newCount: newCount,
            masteredCount: masteredCount,
            learnedCount: learnedCount,
            totalCount: totalQuestions,
            masteryRate: totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0,
            learnedRate: totalQuestions > 0 ? Math.round((learnedCount / totalQuestions) * 100) : 0
        };
    };

    /**
     * 获取掌握度分布
     */
    ForgettingCurveMode.prototype.getMasteryDistribution = function () {
        var distribution = [0, 0, 0, 0, 0, 0]; // 0-5级
        for (var id in this.masteryData) {
            if (this.masteryData.hasOwnProperty(id)) {
                var level = Math.min(this.masteryData[id].level, 5);
                distribution[level]++;
            }
        }
        return distribution;
    };

    /**
     * 重置某题掌握度
     */
    ForgettingCurveMode.prototype.resetMastery = function (questionId) {
        if (this.masteryData[questionId]) {
            delete this.masteryData[questionId];
            this._saveMasteryData();
            this.emit('masteryReset', { questionId: questionId });
            return true;
        }
        return false;
    };

    /**
     * 手动设置掌握度
     */
    ForgettingCurveMode.prototype.setMastery = function (questionId, level) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();
        level = Utils.clamp(level, 0, 5);

        this.masteryData[questionId] = this.masteryData[questionId] || {
            reviewCount: 0,
            correctCount: 0,
            wrongCount: 0
        };

        this.masteryData[questionId].level = level;
        this.masteryData[questionId].lastReview = Date.now();

        if (level < this.reviewIntervals.length) {
            this.masteryData[questionId].nextReview = todayTime + this.reviewIntervals[level] * 24 * 60 * 60 * 1000;
        } else {
            this.masteryData[questionId].nextReview = todayTime + 30 * 24 * 60 * 60 * 1000;
        }

        this._saveMasteryData();
        return this.masteryData[questionId];
    };

    ForgettingCurveMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.forgettingConfig) {
            this.forgettingConfig = { ...this.forgettingConfig, ...options.forgettingConfig };
        }
        this._loadMasteryData();
        return this;
    };

    ForgettingCurveMode.prototype.end = function () {
        this._saveMasteryData();
        return QuizEngine.prototype.end.call(this);
    };

    // ============================================================
    //  模式 6: 循环刷题模式 LoopMode
    // ============================================================

    /**
     * 循环刷题模式
     * 选择题号范围，错题按遗忘曲线再次出现
     * 完全掌握的题目移出循环
     */
    function LoopMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'loop';
        this.modeTitle = '循环刷题模式';
        this.progressKey = 'sz_progress_loop';

        this.loopConfig = {
            ranges: [], // 题号范围，如 [[1, 50], [200, 500]]
            department: null,
            loopCount: 0, // 当前循环次数
            maxLoops: 10, // 最大循环次数
            masteryThreshold: 3, // 答对N次后移出循环
            wrongReappearDelay: 5, // 错题多少题后再次出现
            enableForgettingCurve: true
        };

        // 循环内部状态
        this.originalQuestions = []; // 原始题目列表
        this.loopQueue = []; // 当前循环队列
        this.currentLoopIndex = 0;
        this.masteryCounts = {}; // { questionId: 连续正确次数 }
        this.wrongQueue = []; // 待重做的错题队列
        this.masteredIds = {}; // 已掌握移出的题目ID

        if (options && options.loopConfig) {
            this.loopConfig = { ...this.loopConfig, ...options.loopConfig };
        }
    }

    LoopMode.prototype = Object.create(QuizEngine.prototype);
    LoopMode.prototype.constructor = LoopMode;

    LoopMode.prototype._buildQueue = function () {
        var self = this;
        var allQuestions = [];

        if (this.loopConfig.ranges && this.loopConfig.ranges.length > 0) {
            // 按范围选
            for (var r = 0; r < this.loopConfig.ranges.length; r++) {
                var range = this.loopConfig.ranges[r];
                var start = Math.max(0, range[0] - 1); // 转换为0索引
                var end = range[1]; // 不包含
                for (var i = start; i < end && i < this.questionBank.questions.length; i++) {
                    var q = this.questionBank.questions[i];
                    if (this.loopConfig.department && q.department !== this.loopConfig.department) {
                        continue;
                    }
                    allQuestions.push(q);
                }
            }
        } else {
            // 全量或按部门
            var filters = {};
            if (this.loopConfig.department) filters.department = this.loopConfig.department;
            var result = this.questionBank.filter(filters);
            allQuestions = result.questions;
        }

        this.originalQuestions = allQuestions;
        this.loopQueue = allQuestions.slice();
        this.questionQueue = this.loopQueue;
        this._initQueue(this.loopQueue);
        this.currentIndex = 0;
        this.currentLoopIndex = 0;
    };

    /**
     * 提交答案，处理循环逻辑
     */
    LoopMode.prototype.submitAnswer = function (answer) {
        var result = QuizEngine.prototype.submitAnswer.call(this, answer);
        if (!result.success) return result;

        var question = result.question;
        var isCorrect = result.isCorrect;

        // 更新掌握计数
        if (!this.masteryCounts[question.id]) {
            this.masteryCounts[question.id] = 0;
        }

        if (isCorrect) {
            this.masteryCounts[question.id]++;
            // 达到掌握阈值，移出循环
            if (this.masteryCounts[question.id] >= this.loopConfig.masteryThreshold) {
                this.masteredIds[question.id] = true;
                this.emit('mastered', {
                    questionId: question.id,
                    masteryCount: this.masteryCounts[question.id]
                });
            }
        } else {
            this.masteryCounts[question.id] = 0; // 重置连续正确计数
            // 错题加入重做队列
            if (this.wrongQueue.indexOf(question.id) === -1) {
                this.wrongQueue.push(question.id);
            }
        }

        return result;
    };

    /**
     * 下一题（循环模式特殊处理）
     */
    LoopMode.prototype.next = function () {
        if (this.isEnded) {
            this.emit('ended', this.getResult());
            return null;
        }

        // 错题注入：在适当位置插入错题重做
        this._maybeInjectWrongQuestions();

        if (this.currentIndex < this.questionQueue.length - 1) {
            this.currentIndex++;
            this.questionStartTime = Date.now();
            this.emit('next', {
                index: this.currentIndex,
                question: this.getCurrentQuestion()
            });
            this._saveProgress();
            return this.getCurrentQuestion();
        } else {
            // 当前循环结束，检查是否开始下一轮
            return this._nextLoop();
        }
    };

    /**
     * 在适当位置注入错题
     */
    LoopMode.prototype._maybeInjectWrongQuestions = function () {
        var delay = this.loopConfig.wrongReappearDelay;
        // 每隔delay题，注入一道错题
        if (this.wrongQueue.length > 0 &&
            this.currentIndex > 0 &&
            this.currentIndex % delay === 0) {

            var wrongId = this.wrongQueue.shift();
            var wrongQ = this.questionBank.getById(wrongId);
            if (wrongQ && !this.masteredIds[wrongId]) {
                // 在当前位置之后插入
                var insertPos = this.currentIndex + Math.floor(delay / 2);
                insertPos = Math.min(insertPos, this.questionQueue.length);
                this.questionQueue.splice(insertPos, 0, wrongQ);
                this.stats.total++;
                this.emit('wrongReappear', {
                    questionId: wrongId,
                    position: insertPos
                });
            }
        }
    };

    /**
     * 进入下一轮循环
     */
    LoopMode.prototype._nextLoop = function () {
        if (this.currentLoopIndex >= this.loopConfig.maxLoops) {
            return this._finishLoop();
        }

        // 收集未掌握的题目
        var remainingQuestions = [];
        for (var i = 0; i < this.originalQuestions.length; i++) {
            var q = this.originalQuestions[i];
            if (!this.masteredIds[q.id]) {
                remainingQuestions.push(q);
            }
        }

        // 加上错题队列中的
        for (var j = 0; j < this.wrongQueue.length; j++) {
            var wq = this.questionBank.getById(this.wrongQueue[j]);
            if (wq && !this.masteredIds[wq.id]) {
                remainingQuestions.push(wq);
            }
        }

        if (remainingQuestions.length === 0) {
            return this._finishLoop();
        }

        // 打乱顺序进入下一轮
        this.currentLoopIndex++;
        this.questionQueue = Utils.shuffle(remainingQuestions);
        this.currentIndex = 0;
        this.wrongQueue = [];
        this.questionStartTime = Date.now();

        this.emit('nextLoop', {
            loopIndex: this.currentLoopIndex,
            remainingCount: this.questionQueue.length,
            masteredCount: Object.keys(this.masteredIds).length
        });

        return this.getCurrentQuestion();
    };

    /**
     * 结束循环
     */
    LoopMode.prototype._finishLoop = function () {
        this.emit('loopComplete', {
            totalLoops: this.currentLoopIndex + 1,
            masteredCount: Object.keys(this.masteredIds).length,
            totalOriginal: this.originalQuestions.length,
            masteryRate: Math.round((Object.keys(this.masteredIds).length / this.originalQuestions.length) * 100)
        });
        return this.end();
    };

    /**
     * 获取循环进度
     */
    LoopMode.prototype.getLoopProgress = function () {
        return {
            currentLoop: this.currentLoopIndex + 1,
            maxLoops: this.loopConfig.maxLoops,
            totalOriginal: this.originalQuestions.length,
            masteredCount: Object.keys(this.masteredIds).length,
            remainingInLoop: this.questionQueue.length - this.currentIndex - 1,
            wrongQueueCount: this.wrongQueue.length,
            masteryRate: this.originalQuestions.length > 0
                ? Math.round((Object.keys(this.masteredIds).length / this.originalQuestions.length) * 100)
                : 0
        };
    };

    LoopMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.loopConfig) {
            this.loopConfig = { ...this.loopConfig, ...options.loopConfig };
        }
        return this;
    };

    LoopMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this.originalQuestions = [];
        this.loopQueue = [];
        this.currentLoopIndex = 0;
        this.masteryCounts = {};
        this.wrongQueue = [];
        this.masteredIds = {};
        return this;
    };

    // ============================================================
    //  模式 7: 背题模式 StudyMode
    // ============================================================

    /**
     * 背题模式
     * 先显示题目和答案，用户确认已记住后下一题
     * 支持标记不熟悉
     */
    function StudyMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'study';
        this.modeTitle = '背题模式';
        this.progressKey = 'sz_progress_study';

        this.studyConfig = {
            mode: 'all', // all | wrong | favorite | marked
            department: null,
            type: null,
            autoShowAnswer: false,
            requireConfirm: true
        };

        this.studyState = {
            rememberedCount: 0, // 标记已记住的数量
            unfamiliarCount: 0, // 标记不熟悉的数量
            rememberedIds: {},
            unfamiliarIds: {}
        };

        if (options && options.studyConfig) {
            this.studyConfig = { ...this.studyConfig, ...options.studyConfig };
        }
    }

    StudyMode.prototype = Object.create(QuizEngine.prototype);
    StudyMode.prototype.constructor = StudyMode;

    StudyMode.prototype._buildQueue = function () {
        var filters = {};

        if (this.studyConfig.department) filters.department = this.studyConfig.department;
        if (this.studyConfig.type) filters.type = this.studyConfig.type;

        var allQuestions = this.questionBank.filter(filters).questions;

        // 根据模式筛选
        if (this.studyConfig.mode === 'wrong') {
            var wrongKey = 'sz_wrong_book';
            var wrongIds = Utils.storage.get(wrongKey, []);
            allQuestions = allQuestions.filter(function (q) {
                return wrongIds.indexOf(q.id) !== -1;
            });
        } else if (this.studyConfig.mode === 'favorite') {
            var favKey = 'sz_favorites';
            var favIds = Utils.storage.get(favKey, []);
            allQuestions = allQuestions.filter(function (q) {
                return favIds.indexOf(q.id) !== -1;
            });
        }

        this._initQueue(allQuestions);
        this.currentIndex = 0;

        // 加载背诵状态
        this._loadStudyState();
    };

    /**
     * 加载背诵状态
     */
    StudyMode.prototype._loadStudyState = function () {
        var stateKey = 'sz_study_state';
        var state = Utils.storage.get(stateKey, null);
        if (state && state.mode === this.studyConfig.mode) {
            this.studyState = state;
        }
    };

    /**
     * 保存背诵状态
     */
    StudyMode.prototype._saveStudyState = function () {
        var stateKey = 'sz_study_state';
        this.studyState.mode = this.studyConfig.mode;
        Utils.storage.set(stateKey, this.studyState);
    };

    /**
     * 标记已记住
     */
    StudyMode.prototype.markRemembered = function (questionId) {
        questionId = questionId || (this.getCurrentQuestion() && this.getCurrentQuestion().id);
        if (!questionId) return false;

        // 如果之前标记为不熟悉，移除
        if (this.studyState.unfamiliarIds[questionId]) {
            delete this.studyState.unfamiliarIds[questionId];
            this.studyState.unfamiliarCount--;
        }

        if (!this.studyState.rememberedIds[questionId]) {
            this.studyState.rememberedIds[questionId] = true;
            this.studyState.rememberedCount++;
        }

        this._saveStudyState();
        this.emit('remembered', { questionId: questionId });

        return true;
    };

    /**
     * 标记不熟悉
     */
    StudyMode.prototype.markUnfamiliar = function (questionId) {
        questionId = questionId || (this.getCurrentQuestion() && this.getCurrentQuestion().id);
        if (!questionId) return false;

        // 如果之前标记为已记住，移除
        if (this.studyState.rememberedIds[questionId]) {
            delete this.studyState.rememberedIds[questionId];
            this.studyState.rememberedCount--;
        }

        if (!this.studyState.unfamiliarIds[questionId]) {
            this.studyState.unfamiliarIds[questionId] = true;
            this.studyState.unfamiliarCount++;
        }

        this._saveStudyState();
        this.emit('unfamiliar', { questionId: questionId });

        return true;
    };

    /**
     * 确认已记住并进入下一题
     */
    StudyMode.prototype.confirmAndNext = function (remembered) {
        var currentQ = this.getCurrentQuestion();
        if (!currentQ) return null;

        if (remembered) {
            this.markRemembered(currentQ.id);
        } else {
            this.markUnfamiliar(currentQ.id);
        }

        // 记录答题（背题模式不判分，只记录学习过）
        if (!this.answers[currentQ.id]) {
            this.answers[currentQ.id] = {
                answer: null,
                isCorrect: remembered,
                timeSpent: Date.now() - this.questionStartTime,
                timestamp: Date.now(),
                index: this.currentIndex,
                studyMode: true,
                remembered: remembered
            };
            this.stats.answered++;
            if (remembered) {
                this.stats.correct++;
            } else {
                this.stats.wrong++;
            }
        }

        return this.next();
    };

    /**
     * 显示答案
     */
    StudyMode.prototype.showAnswer = function () {
        var question = this.getCurrentQuestion();
        if (!question) return null;

        this.emit('showAnswer', { question: question });
        return {
            question: question,
            answer: question.answer,
            explanation: question.explanation,
            options: question.options
        };
    };

    /**
     * 获取背诵进度
     */
    StudyMode.prototype.getStudyProgress = function () {
        var total = this.questionQueue.length;
        return {
            total: total,
            current: this.currentIndex + 1,
            remembered: this.studyState.rememberedCount,
            unfamiliar: this.studyState.unfamiliarCount,
            remaining: total - this.stats.answered,
            rememberedRate: total > 0 ? Math.round((this.studyState.rememberedCount / total) * 100) : 0,
            progress: total > 0 ? Math.round((this.stats.answered / total) * 100) : 0
        };
    };

    /**
     * 重做不熟悉的题目
     */
    StudyMode.prototype.reviewUnfamiliar = function () {
        var unfamiliarQuestions = [];
        for (var i = 0; i < this.questionQueue.length; i++) {
            var q = this.questionQueue[i];
            if (this.studyState.unfamiliarIds[q.id]) {
                unfamiliarQuestions.push(q);
            }
        }

        if (unfamiliarQuestions.length === 0) {
            this.emit('noUnfamiliar');
            return null;
        }

        this.questionQueue = Utils.shuffle(unfamiliarQuestions);
        this.currentIndex = 0;
        this.questionStartTime = Date.now();

        this.emit('reviewUnfamiliar', { count: this.questionQueue.length });
        return this.getCurrentQuestion();
    };

    StudyMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.studyConfig) {
            this.studyConfig = { ...this.studyConfig, ...options.studyConfig };
        }
        return this;
    };

    StudyMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this.studyState = {
            rememberedCount: 0,
            unfamiliarCount: 0,
            rememberedIds: {},
            unfamiliarIds: {}
        };
        return this;
    };

    // ============================================================
    //  模式 8: 闪卡模式 FlashcardMode
    // ============================================================

    /**
     * 闪卡模式
     * 卡片式记忆，正面显示题目，翻转显示答案
     * 难易度自评，基于间隔重复算法
     */
    function FlashcardMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'flashcard';
        this.modeTitle = '闪卡模式';
        this.progressKey = 'sz_progress_flashcard';

        this.flashcardConfig = {
            department: null,
            type: null,
            shuffle: true,
            // 间隔重复间隔（天），对应4个难度等级
            intervals: {
                forgot: 1,      // 忘记了 - 1天后
                hard: 2,        // 困难 - 2天后
                good: 4,        // 记得 - 4天后
                easy: 7         // 简单 - 7天后
            },
            showTimer: false,
            autoFlip: false,
            autoFlipDelay: 5000
        };

        // 卡片状态
        this.cardState = {
            isFlipped: false,
            flipCount: 0,
            currentRating: null
        };

        // 间隔重复数据
        this.srsData = {}; // { questionId: { interval: days, easeFactor: number, repetitions: number, dueDate: timestamp } }
        this.srsStorageKey = 'sz_flashcard_srs';

        if (options && options.flashcardConfig) {
            this.flashcardConfig = { ...this.flashcardConfig, ...options.flashcardConfig };
        }

        this._loadSRSData();
    }

    FlashcardMode.prototype = Object.create(QuizEngine.prototype);
    FlashcardMode.prototype.constructor = FlashcardMode;

    FlashcardMode.prototype._loadSRSData = function () {
        this.srsData = Utils.storage.get(this.srsStorageKey, {});
    };

    FlashcardMode.prototype._saveSRSData = function () {
        Utils.storage.set(this.srsStorageKey, this.srsData);
    };

    FlashcardMode.prototype._buildQueue = function () {
        var filters = {};
        if (this.flashcardConfig.department) filters.department = this.flashcardConfig.department;
        if (this.flashcardConfig.type) filters.type = this.flashcardConfig.type;
        if (this.flashcardConfig.shuffle) filters.sort = 'random';

        var result = this.questionBank.filter(filters);

        // 优先安排到期的卡片
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        var dueCards = [];
        var newCards = [];

        for (var i = 0; i < result.questions.length; i++) {
            var q = result.questions[i];
            var srs = this.srsData[q.id];
            if (srs && srs.dueDate <= todayTime) {
                dueCards.push(q);
            } else if (!srs) {
                newCards.push(q);
            }
        }

        // 到期的在前，新卡片在后
        this._initQueue(dueCards.concat(newCards));
        this.currentIndex = 0;
        this.cardState.isFlipped = false;
    };

    /**
     * 翻转卡片
     */
    FlashcardMode.prototype.flipCard = function () {
        this.cardState.isFlipped = !this.cardState.isFlipped;
        this.cardState.flipCount++;

        this.emit('flip', {
            isFlipped: this.cardState.isFlipped,
            question: this.getCurrentQuestion()
        });

        // 3D翻转动画触发
        this._triggerFlipAnimation();

        return this.cardState.isFlipped;
    };

    /**
     * 触发翻转动画
     */
    FlashcardMode.prototype._triggerFlipAnimation = function () {
        if (SZ.animation && typeof SZ.animation.triggerFlip === 'function') {
            SZ.animation.triggerFlip({
                direction: this.cardState.isFlipped ? 'front-to-back' : 'back-to-front',
                duration: 600
            });
        }
        Utils.triggerEvent('flashcard:flip', { isFlipped: this.cardState.isFlipped });
    };

    /**
     * 评分并进入下一张
     * 难度等级: forgot | hard | good | easy
     */
    FlashcardMode.prototype.rateCard = function (rating) {
        var question = this.getCurrentQuestion();
        if (!question) return null;

        var validRatings = ['forgot', 'hard', 'good', 'easy'];
        if (validRatings.indexOf(rating) === -1) {
            return { success: false, error: 'Invalid rating' };
        }

        this.cardState.currentRating = rating;

        // 更新SRS数据
        this._updateSRS(question.id, rating);

        // 记录答题
        var isCorrect = rating !== 'forgot';
        this.answers[question.id] = {
            answer: null,
            isCorrect: isCorrect,
            timeSpent: Date.now() - this.questionStartTime,
            timestamp: Date.now(),
            index: this.currentIndex,
            rating: rating,
            flashcard: true
        };
        this.stats.answered++;
        if (isCorrect) {
            this.stats.correct++;
        } else {
            this.stats.wrong++;
        }

        this.emit('rate', {
            questionId: question.id,
            rating: rating,
            srs: this.srsData[question.id]
        });

        // 自动进入下一张
        this.cardState.isFlipped = false;
        return this.next();
    };

    /**
     * 更新SRS（间隔重复系统）数据
     * 基于简化版SM-2算法
     */
    FlashcardMode.prototype._updateSRS = function (questionId, rating) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        if (!this.srsData[questionId]) {
            this.srsData[questionId] = {
                interval: 0,
                easeFactor: 2.5,
                repetitions: 0,
                dueDate: todayTime,
                lastReview: null
            };
        }

        var srs = this.srsData[questionId];
        srs.lastReview = Date.now();

        // 评分对应的质量分（0-5）
        var qualityMap = {
            forgot: 0,
            hard: 2,
            good: 4,
            easy: 5
        };
        var q = qualityMap[rating] || 3;

        if (q < 3) {
            // 答错了，重置重复次数
            srs.repetitions = 0;
            srs.interval = 1; // 1天后重新复习
        } else {
            if (srs.repetitions === 0) {
                srs.interval = 1;
            } else if (srs.repetitions === 1) {
                srs.interval = this.flashcardConfig.intervals[rating] || 4;
            } else {
                srs.interval = Math.round(srs.interval * srs.easeFactor);
            }
            srs.repetitions++;
        }

        // 更新易度因子
        srs.easeFactor = srs.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (srs.easeFactor < 1.3) srs.easeFactor = 1.3;

        // 计算下次到期时间
        srs.dueDate = todayTime + srs.interval * 24 * 60 * 60 * 1000;

        this._saveSRSData();
    };

    /**
     * 获取闪卡统计
     */
    FlashcardMode.prototype.getFlashcardStats = function () {
        var totalCards = this.questionQueue.length;
        var dueCount = 0;
        var newCount = 0;
        var masteredCount = 0;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayTime = today.getTime();

        for (var id in this.srsData) {
            if (this.srsData.hasOwnProperty(id)) {
                var srs = this.srsData[id];
                if (srs.dueDate <= todayTime) dueCount++;
                if (srs.interval >= 21) masteredCount++; // 间隔超过3周算掌握
            }
        }

        // 新卡片 = 队列中没有SRS数据的
        var newCardCount = 0;
        for (var i = 0; i < this.questionQueue.length; i++) {
            if (!this.srsData[this.questionQueue[i].id]) {
                newCardCount++;
            }
        }

        return {
            total: totalCards,
            due: dueCount,
            new: newCardCount,
            mastered: masteredCount,
            currentStreak: 0,
            totalReviews: Object.keys(this.srsData).length,
            avgEaseFactor: this._calculateAvgEaseFactor()
        };
    };

    FlashcardMode.prototype._calculateAvgEaseFactor = function () {
        var ids = Object.keys(this.srsData);
        if (ids.length === 0) return 2.5;
        var sum = 0;
        for (var i = 0; i < ids.length; i++) {
            sum += this.srsData[ids[i]].easeFactor;
        }
        return Math.round(sum / ids.length * 100) / 100;
    };

    FlashcardMode.prototype.next = function () {
        this.cardState.isFlipped = false;
        this.cardState.currentRating = null;
        return QuizEngine.prototype.next.call(this);
    };

    FlashcardMode.prototype.prev = function () {
        this.cardState.isFlipped = false;
        this.cardState.currentRating = null;
        return QuizEngine.prototype.prev.call(this);
    };

    FlashcardMode.prototype.jumpTo = function (index) {
        this.cardState.isFlipped = false;
        this.cardState.currentRating = null;
        return QuizEngine.prototype.jumpTo.call(this, index);
    };

    FlashcardMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.flashcardConfig) {
            this.flashcardConfig = { ...this.flashcardConfig, ...options.flashcardConfig };
        }
        this._loadSRSData();
        return this;
    };

    FlashcardMode.prototype.end = function () {
        this._saveSRSData();
        return QuizEngine.prototype.end.call(this);
    };

    // ============================================================
    //  模式 9: 快答模式 SpeedMode
    // ============================================================

    /**
     * 快答模式
     * 限时答题，倒计时显示，超时自动判错
     * 连击系统，最终得分和正确率，排行榜
     */
    function SpeedMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'speed';
        this.modeTitle = '快答模式';
        this.progressKey = 'sz_progress_speed';

        this.speedConfig = {
            timePerQuestion: 5, // 秒
            totalQuestions: 20,
            department: null,
            type: null,
            difficulty: null,
            comboBonus: true,
            baseScore: 10,
            comboMultiplier: 0.5, // 每连击加0.5倍
            maxComboMultiplier: 5,
            timeBonus: true,
            timeBonusRate: 1 // 每秒剩余加1分
        };

        // 快答状态
        this.speedState = {
            timeRemaining: 0,
            timerId: null,
            combo: 0,
            maxCombo: 0,
            score: 0,
            totalEarnedScore: 0,
            questionStartTime: 0
        };

        // 排行榜
        this.leaderboardKey = 'sz_speed_leaderboard';

        if (options && options.speedConfig) {
            this.speedConfig = { ...this.speedConfig, ...options.speedConfig };
        }
    }

    SpeedMode.prototype = Object.create(QuizEngine.prototype);
    SpeedMode.prototype.constructor = SpeedMode;

    SpeedMode.prototype._buildQueue = function () {
        var filters = { sort: 'random', limit: this.speedConfig.totalQuestions };
        if (this.speedConfig.department) filters.department = this.speedConfig.department;
        if (this.speedConfig.type) filters.type = this.speedConfig.type;
        if (this.speedConfig.difficulty) filters.difficulty = this.speedConfig.difficulty;

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;

        this.speedState.score = 0;
        this.speedState.combo = 0;
        this.speedState.maxCombo = 0;
    };

    SpeedMode.prototype.start = function () {
        QuizEngine.prototype.start.call(this);
        if (this.questionQueue.length > 0) {
            this._startQuestionTimer();
        }
        return this;
    };

    /**
     * 开始单题计时
     */
    SpeedMode.prototype._startQuestionTimer = function () {
        var self = this;
        this._stopQuestionTimer();
        this.speedState.timeRemaining = this.speedConfig.timePerQuestion;
        this.speedState.questionStartTime = Date.now();

        this.speedState.timerId = setInterval(function () {
            if (!self.isPaused && !self.isEnded) {
                self.speedState.timeRemaining -= 0.1;
                if (self.speedState.timeRemaining <= 0) {
                    self.speedState.timeRemaining = 0;
                    self._onQuestionTimeout();
                }
                self.emit('tick', {
                    timeRemaining: Math.max(0, self.speedState.timeRemaining),
                    formattedTime: Utils.formatTime(Math.ceil(Math.max(0, self.speedState.timeRemaining))),
                    percentage: (self.speedState.timeRemaining / self.speedConfig.timePerQuestion) * 100
                });
            }
        }, 100);
    };

    /**
     * 停止单题计时
     */
    SpeedMode.prototype._stopQuestionTimer = function () {
        if (this.speedState.timerId) {
            clearInterval(this.speedState.timerId);
            this.speedState.timerId = null;
        }
    };

    /**
     * 单题超时
     */
    SpeedMode.prototype._onQuestionTimeout = function () {
        this._stopQuestionTimer();

        var question = this.getCurrentQuestion();
        if (!question) return;

        // 超时自动判错
        this.answers[question.id] = {
            answer: null,
            isCorrect: false,
            timeSpent: this.speedConfig.timePerQuestion * 1000,
            timestamp: Date.now(),
            index: this.currentIndex,
            timeout: true
        };

        this.stats.answered++;
        this.stats.wrong++;
        this.speedState.combo = 0; // 连击中断

        this.emit('timeout', {
            question: question,
            combo: this.speedState.combo,
            score: this.speedState.score
        });

        this._playSound('timeout');

        // 延迟进入下一题
        var self = this;
        setTimeout(function () {
            self._goNextOrEnd();
        }, 800);
    };

    /**
     * 提交答案（快答模式）
     */
    SpeedMode.prototype.submitAnswer = function (answer) {
        if (this.isEnded) {
            return { success: false, reason: 'quiz_ended' };
        }

        var question = this.getCurrentQuestion();
        if (!question) {
            return { success: false, reason: 'no_question' };
        }

        this._stopQuestionTimer();

        var timeSpent = Date.now() - this.speedState.questionStartTime;
        var isCorrect = Utils.checkAnswer(answer, question.answer, question.type);

        // 更新连击
        if (isCorrect) {
            this.speedState.combo++;
            if (this.speedState.combo > this.speedState.maxCombo) {
                this.speedState.maxCombo = this.speedState.combo;
            }
        } else {
            this.speedState.combo = 0;
        }

        // 计算得分
        var earnedScore = this._calculateScore(isCorrect, timeSpent);
        this.speedState.score += earnedScore;
        this.speedState.totalEarnedScore += earnedScore;

        // 保存答案
        this.answers[question.id] = {
            answer: answer,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            timestamp: Date.now(),
            index: this.currentIndex,
            score: earnedScore,
            combo: this.speedState.combo
        };

        if (!this.stats.answered) {
            this.stats.answered = 0;
        }
        if (!this.answers._wasCounted) {
            this.stats.answered++;
            if (isCorrect) {
                this.stats.correct++;
            } else {
                this.stats.wrong++;
            }
        }

        this._recordAnswer(question, answer, isCorrect, timeSpent);

        // 触发事件
        this.emit('answer', {
            question: question,
            answer: answer,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            score: earnedScore,
            totalScore: this.speedState.score,
            combo: this.speedState.combo,
            maxCombo: this.speedState.maxCombo
        });

        if (isCorrect) {
            this._playSound('correct');
            this._triggerParticleEffect('correct');
            if (this.speedState.combo > 0 && this.speedState.combo % 5 === 0) {
                this._playSound('combo');
                this._triggerParticleEffect('combo');
                this.emit('comboMilestone', { combo: this.speedState.combo });
            }
        } else {
            this._playSound('wrong');
        }

        // 延迟进入下一题
        var self = this;
        setTimeout(function () {
            self._goNextOrEnd();
        }, 500);

        return {
            success: true,
            isCorrect: isCorrect,
            question: question,
            userAnswer: answer,
            correctAnswer: question.answer,
            score: earnedScore,
            totalScore: this.speedState.score,
            combo: this.speedState.combo,
            maxCombo: this.speedState.maxCombo,
            timeSpent: timeSpent
        };
    };

    /**
     * 计算得分
     */
    SpeedMode.prototype._calculateScore = function (isCorrect, timeSpent) {
        if (!isCorrect) return 0;

        var baseScore = this.speedConfig.baseScore;
        var timeBonus = 0;
        var comboBonus = 0;

        // 时间奖励
        if (this.speedConfig.timeBonus) {
            var timeRemaining = this.speedConfig.timePerQuestion - timeSpent / 1000;
            timeBonus = Math.max(0, Math.floor(timeRemaining * this.speedConfig.timeBonusRate));
        }

        // 连击奖励
        if (this.speedConfig.comboBonus && this.speedState.combo > 1) {
            var multiplier = Math.min(
                1 + (this.speedState.combo - 1) * this.speedConfig.comboMultiplier,
                this.speedConfig.maxComboMultiplier
            );
            comboBonus = Math.floor(baseScore * (multiplier - 1));
        }

        return baseScore + timeBonus + comboBonus;
    };

    /**
     * 进入下一题或结束
     */
    SpeedMode.prototype._goNextOrEnd = function () {
        if (this.currentIndex < this.questionQueue.length - 1) {
            this.currentIndex++;
            this.questionStartTime = Date.now();
            this._startQuestionTimer();
            this.emit('next', {
                index: this.currentIndex,
                question: this.getCurrentQuestion()
            });
        } else {
            this._finishSpeedMode();
        }
    };

    /**
     * 完成快答模式
     */
    SpeedMode.prototype._finishSpeedMode = function () {
        this._stopQuestionTimer();
        var result = this.getSpeedResult();

        // 更新排行榜
        this._updateLeaderboard(result);

        this.end();
        this.emit('speedComplete', result);
    };

    /**
     * 获取快答结果
     */
    SpeedMode.prototype.getSpeedResult = function () {
        var baseResult = this.getResult();
        var accuracy = this.stats.answered > 0
            ? Utils.calculateAccuracy(this.stats.correct, this.stats.answered)
            : 0;

        return {
            ...baseResult,
            score: this.speedState.score,
            maxCombo: this.speedState.maxCombo,
            accuracy: accuracy,
            avgTimePerQuestion: this.stats.answered > 0
                ? Math.round(this.stats.totalTimeSpent / this.stats.answered)
                : 0,
            timePerQuestion: this.speedConfig.timePerQuestion,
            totalQuestions: this.questionQueue.length,
            rank: this._getCurrentRank(this.speedState.score)
        };
    };

    /**
     * 更新排行榜
     */
    SpeedMode.prototype._updateLeaderboard = function (result) {
        var leaderboard = Utils.storage.get(this.leaderboardKey, []);
        leaderboard.push({
            score: result.score,
            accuracy: result.accuracy,
            maxCombo: result.maxCombo,
            totalQuestions: result.totalQuestions,
            date: Utils.getToday(),
            timestamp: Date.now()
        });

        // 按分数排序，保留前100
        leaderboard.sort(function (a, b) { return b.score - a.score; });
        leaderboard = leaderboard.slice(0, 100);

        Utils.storage.set(this.leaderboardKey, leaderboard);
    };

    /**
     * 获取当前排名
     */
    SpeedMode.prototype._getCurrentRank = function (score) {
        var leaderboard = Utils.storage.get(this.leaderboardKey, []);
        var rank = leaderboard.findIndex(function (item) { return item.score <= score; });
        return rank === -1 ? leaderboard.length + 1 : rank + 1;
    };

    /**
     * 获取排行榜
     */
    SpeedMode.prototype.getLeaderboard = function (limit) {
        limit = limit || 10;
        var leaderboard = Utils.storage.get(this.leaderboardKey, []);
        return leaderboard.slice(0, limit);
    };

    SpeedMode.prototype.next = function () {
        // 快答模式下手动next不重置计时器，由submitAnswer控制
        return QuizEngine.prototype.next.call(this);
    };

    SpeedMode.prototype.end = function () {
        this._stopQuestionTimer();
        return QuizEngine.prototype.end.call(this);
    };

    SpeedMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.speedConfig) {
            this.speedConfig = { ...this.speedConfig, ...options.speedConfig };
        }
        return this;
    };

    SpeedMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this._stopQuestionTimer();
        this.speedState = {
            timeRemaining: 0,
            timerId: null,
            combo: 0,
            maxCombo: 0,
            score: 0,
            totalEarnedScore: 0,
            questionStartTime: 0
        };
        return this;
    };

    // ============================================================
    //  模式 10: 选题模式 AnswerCardMode
    // ============================================================

    /**
     * 选题模式（答题卡模式）
     * 答题卡视图，点击题号跳转到对应题目
     * 显示各题状态，分区显示，批量标记功能
     */
    function AnswerCardMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'answer_card';
        this.modeTitle = '选题模式';
        this.progressKey = 'sz_progress_answer_card';

        this.cardConfig = {
            department: null,
            type: null,
            groupBy: 'department', // department | type | difficulty
            showNumber: true,
            allowBatchMark: true,
            allowBatchJump: true
        };

        // 视图状态
        this.cardView = {
            isVisible: false,
            activeGroup: null,
            filterStatus: 'all' // all | unanswered | correct | wrong | marked
        };

        if (options && options.cardConfig) {
            this.cardConfig = { ...this.cardConfig, ...options.cardConfig };
        }
    }

    AnswerCardMode.prototype = Object.create(QuizEngine.prototype);
    AnswerCardMode.prototype.constructor = AnswerCardMode;

    AnswerCardMode.prototype._buildQueue = function () {
        var filters = {};
        if (this.cardConfig.department) filters.department = this.cardConfig.department;
        if (this.cardConfig.type) filters.type = this.cardConfig.type;

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;
    };

    /**
     * 显示答题卡
     */
    AnswerCardMode.prototype.showCard = function () {
        this.cardView.isVisible = true;
        this.emit('cardShow', { cardData: this.getAnswerCard() });
        return this.getAnswerCard();
    };

    /**
     * 隐藏答题卡
     */
    AnswerCardMode.prototype.hideCard = function () {
        this.cardView.isVisible = false;
        this.emit('cardHide');
        return true;
    };

    /**
     * 切换答题卡显示
     */
    AnswerCardMode.prototype.toggleCard = function () {
        if (this.cardView.isVisible) {
            this.hideCard();
            return false;
        } else {
            this.showCard();
            return true;
        }
    };

    /**
     * 按题号跳转
     * @param {number} questionNumber - 题号（从1开始）
     */
    AnswerCardMode.prototype.jumpToNumber = function (questionNumber) {
        var index = questionNumber - 1;
        this.hideCard();
        return this.jumpTo(index);
    };

    /**
     * 按分组跳转（跳到某组第一题）
     */
    AnswerCardMode.prototype.jumpToGroup = function (groupName) {
        var card = this.getAnswerCard();
        var group = card.byDepartment[groupName] || card.byType[groupName];
        if (group && group.items && group.items.length > 0) {
            this.hideCard();
            return this.jumpTo(group.items[0].index);
        }
        return null;
    };

    /**
     * 设置筛选状态
     */
    AnswerCardMode.prototype.setFilter = function (status) {
        this.cardView.filterStatus = status;
        this.emit('filterChange', { status: status });
        return this.getFilteredCard();
    };

    /**
     * 获取筛选后的答题卡数据
     */
    AnswerCardMode.prototype.getFilteredCard = function () {
        var card = this.getAnswerCard();
        var status = this.cardView.filterStatus;

        if (status === 'all') return card;

        var filtered = card.questions.filter(function (item) {
            switch (status) {
                case 'unanswered': return !item.isAnswered;
                case 'correct': return item.isCorrect === true;
                case 'wrong': return item.isCorrect === false;
                case 'marked': return item.isMarked;
                default: return true;
            }
        });

        return {
            ...card,
            questions: filtered,
            filteredCount: filtered.length,
            filterStatus: status
        };
    };

    /**
     * 批量标记未答题
     */
    AnswerCardMode.prototype.batchMarkUnanswered = function (marked) {
        if (!this.cardConfig.allowBatchMark) return 0;

        var indices = [];
        for (var i = 0; i < this.questionQueue.length; i++) {
            if (!this.answers[this.questionQueue[i].id]) {
                indices.push(i);
            }
        }

        this.batchMark(indices, marked);
        return indices.length;
    };

    /**
     * 批量标记错题
     */
    AnswerCardMode.prototype.batchMarkWrong = function (marked) {
        if (!this.cardConfig.allowBatchMark) return 0;

        var indices = [];
        for (var i = 0; i < this.questionQueue.length; i++) {
            var ans = this.answers[this.questionQueue[i].id];
            if (ans && !ans.isCorrect) {
                indices.push(i);
            }
        }

        this.batchMark(indices, marked);
        return indices.length;
    };

    /**
     * 批量标记指定部门的题
     */
    AnswerCardMode.prototype.batchMarkDepartment = function (department, marked) {
        if (!this.cardConfig.allowBatchMark) return 0;

        var indices = [];
        for (var i = 0; i < this.questionQueue.length; i++) {
            if (this.questionQueue[i].department === department) {
                indices.push(i);
            }
        }

        this.batchMark(indices, marked);
        return indices.length;
    };

    /**
     * 获取分组统计
     */
    AnswerCardMode.prototype.getGroupStats = function () {
        var card = this.getAnswerCard();
        var groupBy = this.cardConfig.groupBy;
        var groups = groupBy === 'type' ? card.byType : card.byDepartment;

        var result = [];
        for (var name in groups) {
            if (groups.hasOwnProperty(name)) {
                var g = groups[name];
                result.push({
                    name: name,
                    total: g.total,
                    answered: g.answered,
                    correct: g.correct,
                    wrong: g.wrong,
                    accuracy: g.answered > 0 ? Math.round((g.correct / g.answered) * 100) : 0,
                    progress: g.total > 0 ? Math.round((g.answered / g.total) * 100) : 0,
                    firstIndex: g.items.length > 0 ? g.items[0].index : -1
                });
            }
        }

        return result.sort(function (a, b) { return a.firstIndex - b.firstIndex; });
    };

    /**
     * 跳转到下一个未答题
     */
    AnswerCardMode.prototype.jumpToNextUnanswered = function () {
        for (var i = this.currentIndex + 1; i < this.questionQueue.length; i++) {
            if (!this.answers[this.questionQueue[i].id]) {
                return this.jumpTo(i);
            }
        }
        // 从开头找
        for (var j = 0; j < this.currentIndex; j++) {
            if (!this.answers[this.questionQueue[j].id]) {
                return this.jumpTo(j);
            }
        }
        return null;
    };

    /**
     * 跳转到下一道错题
     */
    AnswerCardMode.prototype.jumpToNextWrong = function () {
        for (var i = this.currentIndex + 1; i < this.questionQueue.length; i++) {
            var ans = this.answers[this.questionQueue[i].id];
            if (ans && !ans.isCorrect) {
                return this.jumpTo(i);
            }
        }
        for (var j = 0; j < this.currentIndex; j++) {
            var ans2 = this.answers[this.questionQueue[j].id];
            if (ans2 && !ans2.isCorrect) {
                return this.jumpTo(j);
            }
        }
        return null;
    };

    AnswerCardMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.cardConfig) {
            this.cardConfig = { ...this.cardConfig, ...options.cardConfig };
        }
        return this;
    };

    AnswerCardMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this.cardView = {
            isVisible: false,
            activeGroup: null,
            filterStatus: 'all'
        };
        return this;
    };

    // ============================================================
    //  模式 11: 错题本模式 WrongBookMode
    // ============================================================

    /**
     * 错题本模式
     * 错题收集，按时间/部门/题型筛选
     * 错题移除（答对后），错题重做，错题统计
     */
    function WrongBookMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'wrong_book';
        this.modeTitle = '错题本模式';
        this.progressKey = 'sz_progress_wrong_book';

        this.wrongConfig = {
            filterType: 'all', // all | date | department | type
            filterValue: null,
            dateRange: null, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
            removeOnCorrect: true, // 答对后移除错题本
            showSource: true // 显示错题来源
        };

        // 错题数据
        this.wrongBook = []; // [{ questionId, wrongCount, lastWrongTime, firstWrongTime, sourceMode }]
        this.wrongStorageKey = 'sz_wrong_book_data';

        if (options && options.wrongConfig) {
            this.wrongConfig = { ...this.wrongConfig, ...options.wrongConfig };
        }

        this._loadWrongBook();
    }

    WrongBookMode.prototype = Object.create(QuizEngine.prototype);
    WrongBookMode.prototype.constructor = WrongBookMode;

    WrongBookMode.prototype._loadWrongBook = function () {
        this.wrongBook = Utils.storage.get(this.wrongStorageKey, []);
    };

    WrongBookMode.prototype._saveWrongBook = function () {
        Utils.storage.set(this.wrongStorageKey, this.wrongBook);
    };

    WrongBookMode.prototype._buildQueue = function () {
        var self = this;
        var wrongIds = this.wrongBook.map(function (w) { return w.questionId; });
        var questions = [];

        for (var i = 0; i < wrongIds.length; i++) {
            var q = this.questionBank.getById(wrongIds[i]);
            if (q) {
                questions.push(q);
            }
        }

        // 应用筛选
        if (this.wrongConfig.filterType === 'department' && this.wrongConfig.filterValue) {
            questions = questions.filter(function (q) {
                return q.department === self.wrongConfig.filterValue;
            });
        } else if (this.wrongConfig.filterType === 'type' && this.wrongConfig.filterValue) {
            questions = questions.filter(function (q) {
                return q.type === self.wrongConfig.filterValue;
            });
        } else if (this.wrongConfig.filterType === 'date' && this.wrongConfig.dateRange) {
            var start = new Date(this.wrongConfig.dateRange.start).getTime();
            var end = new Date(this.wrongConfig.dateRange.end).getTime() + 86400000;
            questions = questions.filter(function (q) {
                var wrongData = self.wrongBook.find(function (w) { return w.questionId === q.id; });
                if (!wrongData) return false;
                return wrongData.lastWrongTime >= start && wrongData.lastWrongTime <= end;
            });
        }

        // 按错误次数排序（错得越多越靠前）
        questions.sort(function (a, b) {
            var aWrong = self.wrongBook.find(function (w) { return w.questionId === a.id; });
            var bWrong = self.wrongBook.find(function (w) { return w.questionId === b.id; });
            var aCount = aWrong ? aWrong.wrongCount : 0;
            var bCount = bWrong ? bWrong.wrongCount : 0;
            return bCount - aCount;
        });

        this._initQueue(questions);
        this.currentIndex = 0;
    };

    /**
     * 提交答案（错题模式特殊处理）
     */
    WrongBookMode.prototype.submitAnswer = function (answer) {
        var result = QuizEngine.prototype.submitAnswer.call(this, answer);
        if (!result.success) return result;

        var question = result.question;
        var isCorrect = result.isCorrect;

        if (isCorrect && this.wrongConfig.removeOnCorrect) {
            // 答对后从错题本移除
            this._removeFromWrongBook(question.id);
            this.emit('removedFromWrongBook', { questionId: question.id });
        } else if (!isCorrect) {
            // 又错了，增加错误次数
            this._updateWrongCount(question.id);
        }

        return result;
    };

    /**
     * 添加错题到错题本
     */
    WrongBookMode.prototype.addToWrongBook = function (questionId, sourceMode) {
        var existing = this.wrongBook.find(function (w) { return w.questionId === questionId; });
        if (existing) {
            existing.wrongCount++;
            existing.lastWrongTime = Date.now();
            if (sourceMode) existing.sourceMode = sourceMode;
        } else {
            this.wrongBook.push({
                questionId: questionId,
                wrongCount: 1,
                firstWrongTime: Date.now(),
                lastWrongTime: Date.now(),
                sourceMode: sourceMode || 'unknown'
            });
        }
        this._saveWrongBook();
        this.emit('addedToWrongBook', { questionId: questionId });
    };

    /**
     * 从错题本移除
     */
    WrongBookMode.prototype._removeFromWrongBook = function (questionId) {
        var index = this.wrongBook.findIndex(function (w) { return w.questionId === questionId; });
        if (index !== -1) {
            this.wrongBook.splice(index, 1);
            this._saveWrongBook();
            return true;
        }
        return false;
    };

    /**
     * 手动移除错题
     */
    WrongBookMode.prototype.removeFromWrongBook = function (questionId) {
        var removed = this._removeFromWrongBook(questionId);
        if (removed) {
            // 从队列中也移除
            var qIndex = -1;
            for (var i = 0; i < this.questionQueue.length; i++) {
                if (this.questionQueue[i].id === questionId) {
                    qIndex = i;
                    break;
                }
            }
            if (qIndex !== -1) {
                this.questionQueue.splice(qIndex, 1);
                this.stats.total--;
                if (this.currentIndex >= this.questionQueue.length) {
                    this.currentIndex = this.questionQueue.length - 1;
                }
            }
            this.emit('removedFromWrongBook', { questionId: questionId, manual: true });
        }
        return removed;
    };

    /**
     * 更新错误次数
     */
    WrongBookMode.prototype._updateWrongCount = function (questionId) {
        var existing = this.wrongBook.find(function (w) { return w.questionId === questionId; });
        if (existing) {
            existing.wrongCount++;
            existing.lastWrongTime = Date.now();
            this._saveWrongBook();
        }
    };

    /**
     * 获取错题统计
     */
    WrongBookMode.prototype.getWrongStats = function () {
        var self = this;
        var total = this.wrongBook.length;
        var byDepartment = {};
        var byType = {};
        var byDate = {};
        var totalWrongCount = 0;

        for (var i = 0; i < this.wrongBook.length; i++) {
            var w = this.wrongBook[i];
            var q = this.questionBank.getById(w.questionId);
            if (!q) continue;

            totalWrongCount += w.wrongCount;

            // 按部门
            if (!byDepartment[q.department]) {
                byDepartment[q.department] = { count: 0, wrongCount: 0 };
            }
            byDepartment[q.department].count++;
            byDepartment[q.department].wrongCount += w.wrongCount;

            // 按题型
            if (!byType[q.type]) {
                byType[q.type] = { count: 0, wrongCount: 0 };
            }
            byType[q.type].count++;
            byType[q.type].wrongCount += w.wrongCount;

            // 按日期
            var dateStr = Utils.formatDate(new Date(w.lastWrongTime), 'YYYY-MM-DD');
            if (!byDate[dateStr]) {
                byDate[dateStr] = 0;
            }
            byDate[dateStr]++;
        }

        return {
            totalWrongQuestions: total,
            totalWrongCount: totalWrongCount,
            avgWrongCount: total > 0 ? Math.round(totalWrongCount / total * 10) / 10 : 0,
            byDepartment: byDepartment,
            byType: byType,
            byDate: byDate,
            currentSessionCorrect: this.stats.correct,
            currentSessionWrong: this.stats.wrong,
            removedThisSession: 0
        };
    };

    /**
     * 清空错题本
     */
    WrongBookMode.prototype.clearWrongBook = function () {
        this.wrongBook = [];
        this._saveWrongBook();
        this.emit('wrongBookCleared');
    };

    /**
     * 导出错题
     */
    WrongBookMode.prototype.exportWrongBook = function (format) {
        format = format || 'json';
        var data = [];

        for (var i = 0; i < this.wrongBook.length; i++) {
            var w = this.wrongBook[i];
            var q = this.questionBank.getById(w.questionId);
            if (q) {
                data.push({
                    question: q.title,
                    options: q.options,
                    correctAnswer: q.answer,
                    explanation: q.explanation,
                    wrongCount: w.wrongCount,
                    department: q.department,
                    type: q.type,
                    firstWrongTime: w.firstWrongTime,
                    lastWrongTime: w.lastWrongTime
                });
            }
        }

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }

        return data;
    };

    /**
     * 设置筛选条件
     */
    WrongBookMode.prototype.setFilter = function (filterType, filterValue, dateRange) {
        this.wrongConfig.filterType = filterType;
        this.wrongConfig.filterValue = filterValue;
        if (dateRange) this.wrongConfig.dateRange = dateRange;

        // 重建队列
        var currentId = this.getCurrentQuestion() ? this.getCurrentQuestion().id : null;
        this._buildQueue();

        // 尝试定位到当前题
        if (currentId) {
            for (var i = 0; i < this.questionQueue.length; i++) {
                if (this.questionQueue[i].id === currentId) {
                    this.currentIndex = i;
                    break;
                }
            }
        }

        this.emit('filterChange', { filterType: filterType, filterValue: filterValue });
        return this.questionQueue.length;
    };

    WrongBookMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.wrongConfig) {
            this.wrongConfig = { ...this.wrongConfig, ...options.wrongConfig };
        }
        this._loadWrongBook();
        return this;
    };

    WrongBookMode.prototype.end = function () {
        this._saveWrongBook();
        return QuizEngine.prototype.end.call(this);
    };

    WrongBookMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        return this;
    };

    // ============================================================
    //  模式 12: 收藏模式 FavoriteMode
    // ============================================================

    /**
     * 收藏模式
     * 收藏/取消收藏，收藏列表，按分类筛选收藏，收藏题复习
     */
    function FavoriteMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'favorite';
        this.modeTitle = '收藏模式';
        this.progressKey = 'sz_progress_favorite';

        this.favoriteConfig = {
            filterCategory: 'all', // all | department | type | custom
            filterValue: null,
            order: 'time_desc' // time_desc | time_asc | department | type
        };

        // 收藏数据
        this.favorites = []; // [{ questionId, addedAt, category, note }]
        this.favoriteStorageKey = 'sz_favorites_data';

        if (options && options.favoriteConfig) {
            this.favoriteConfig = { ...this.favoriteConfig, ...options.favoriteConfig };
        }

        this._loadFavorites();
    }

    FavoriteMode.prototype = Object.create(QuizEngine.prototype);
    FavoriteMode.prototype.constructor = FavoriteMode;

    FavoriteMode.prototype._loadFavorites = function () {
        this.favorites = Utils.storage.get(this.favoriteStorageKey, []);
    };

    FavoriteMode.prototype._saveFavorites = function () {
        Utils.storage.set(this.favoriteStorageKey, this.favorites);
    };

    FavoriteMode.prototype._buildQueue = function () {
        var self = this;
        var favIds = this.favorites.map(function (f) { return f.questionId; });
        var questions = [];

        for (var i = 0; i < favIds.length; i++) {
            var q = this.questionBank.getById(favIds[i]);
            if (q) {
                questions.push(q);
            }
        }

        // 应用筛选
        if (this.favoriteConfig.filterCategory === 'department' && this.favoriteConfig.filterValue) {
            questions = questions.filter(function (q) {
                return q.department === self.favoriteConfig.filterValue;
            });
        } else if (this.favoriteConfig.filterCategory === 'type' && this.favoriteConfig.filterValue) {
            questions = questions.filter(function (q) {
                return q.type === self.favoriteConfig.filterValue;
            });
        } else if (this.favoriteConfig.filterCategory === 'custom' && this.favoriteConfig.filterValue) {
            var cat = this.favoriteConfig.filterValue;
            questions = questions.filter(function (q) {
                var fav = self.favorites.find(function (f) { return f.questionId === q.id; });
                return fav && fav.category === cat;
            });
        }

        // 排序
        if (this.favoriteConfig.order === 'time_desc') {
            questions.sort(function (a, b) {
                var fa = self.favorites.find(function (f) { return f.questionId === a.id; });
                var fb = self.favorites.find(function (f) { return f.questionId === b.id; });
                return (fb ? fb.addedAt : 0) - (fa ? fa.addedAt : 0);
            });
        } else if (this.favoriteConfig.order === 'time_asc') {
            questions.sort(function (a, b) {
                var fa = self.favorites.find(function (f) { return f.questionId === a.id; });
                var fb = self.favorites.find(function (f) { return f.questionId === b.id; });
                return (fa ? fa.addedAt : 0) - (fb ? fb.addedAt : 0);
            });
        } else if (this.favoriteConfig.order === 'department') {
            questions.sort(function (a, b) { return a.department.localeCompare(b.department); });
        } else if (this.favoriteConfig.order === 'type') {
            questions.sort(function (a, b) { return a.type.localeCompare(b.type); });
        }

        this._initQueue(questions);
        this.currentIndex = 0;
    };

    /**
     * 添加收藏
     */
    FavoriteMode.prototype.addFavorite = function (questionId, category, note) {
        var existing = this.favorites.find(function (f) { return f.questionId === questionId; });
        if (existing) {
            // 更新分类和备注
            if (category) existing.category = category;
            if (note !== undefined) existing.note = note;
        } else {
            this.favorites.push({
                questionId: questionId,
                addedAt: Date.now(),
                category: category || 'default',
                note: note || ''
            });
        }
        this._saveFavorites();
        this.emit('favoriteAdded', { questionId: questionId, category: category });
        return true;
    };

    /**
     * 取消收藏
     */
    FavoriteMode.prototype.removeFavorite = function (questionId) {
        var index = this.favorites.findIndex(function (f) { return f.questionId === questionId; });
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this._saveFavorites();

            // 从队列中移除
            var qIndex = -1;
            for (var i = 0; i < this.questionQueue.length; i++) {
                if (this.questionQueue[i].id === questionId) {
                    qIndex = i;
                    break;
                }
            }
            if (qIndex !== -1) {
                this.questionQueue.splice(qIndex, 1);
                this.stats.total--;
                if (this.currentIndex >= this.questionQueue.length) {
                    this.currentIndex = Math.max(0, this.questionQueue.length - 1);
                }
            }

            this.emit('favoriteRemoved', { questionId: questionId });
            return true;
        }
        return false;
    };

    /**
     * 切换收藏状态
     */
    FavoriteMode.prototype.toggleFavorite = function (questionId) {
        var isFav = this.isFavorite(questionId);
        if (isFav) {
            this.removeFavorite(questionId);
            return false;
        } else {
            this.addFavorite(questionId);
            return true;
        }
    };

    /**
     * 检查是否已收藏
     */
    FavoriteMode.prototype.isFavorite = function (questionId) {
        return this.favorites.some(function (f) { return f.questionId === questionId; });
    };

    /**
     * 更新收藏备注
     */
    FavoriteMode.prototype.updateNote = function (questionId, note) {
        var fav = this.favorites.find(function (f) { return f.questionId === questionId; });
        if (fav) {
            fav.note = note;
            this._saveFavorites();
            this.emit('noteUpdated', { questionId: questionId, note: note });
            return true;
        }
        return false;
    };

    /**
     * 获取收藏分类列表
     */
    FavoriteMode.prototype.getCategories = function () {
        var categories = {};
        for (var i = 0; i < this.favorites.length; i++) {
            var cat = this.favorites[i].category || 'default';
            if (!categories[cat]) {
                categories[cat] = 0;
            }
            categories[cat]++;
        }
        return categories;
    };

    /**
     * 获取收藏统计
     */
    FavoriteMode.prototype.getFavoriteStats = function () {
        var byDepartment = {};
        var byType = {};
        var total = this.favorites.length;

        for (var i = 0; i < this.favorites.length; i++) {
            var q = this.questionBank.getById(this.favorites[i].questionId);
            if (q) {
                if (!byDepartment[q.department]) byDepartment[q.department] = 0;
                byDepartment[q.department]++;
                if (!byType[q.type]) byType[q.type] = 0;
                byType[q.type]++;
            }
        }

        return {
            total: total,
            byDepartment: byDepartment,
            byType: byType,
            categories: this.getCategories()
        };
    };

    /**
     * 设置筛选
     */
    FavoriteMode.prototype.setFilter = function (category, value) {
        this.favoriteConfig.filterCategory = category;
        this.favoriteConfig.filterValue = value;

        var currentId = this.getCurrentQuestion() ? this.getCurrentQuestion().id : null;
        this._buildQueue();

        if (currentId) {
            for (var i = 0; i < this.questionQueue.length; i++) {
                if (this.questionQueue[i].id === currentId) {
                    this.currentIndex = i;
                    break;
                }
            }
        }

        this.emit('filterChange', { category: category, value: value });
        return this.questionQueue.length;
    };

    /**
     * 导出收藏
     */
    FavoriteMode.prototype.exportFavorites = function () {
        var data = [];
        for (var i = 0; i < this.favorites.length; i++) {
            var f = this.favorites[i];
            var q = this.questionBank.getById(f.questionId);
            if (q) {
                data.push({
                    title: q.title,
                    options: q.options,
                    answer: q.answer,
                    explanation: q.explanation,
                    department: q.department,
                    type: q.type,
                    category: f.category,
                    note: f.note,
                    addedAt: f.addedAt
                });
            }
        }
        return data;
    };

    FavoriteMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.favoriteConfig) {
            this.favoriteConfig = { ...this.favoriteConfig, ...options.favoriteConfig };
        }
        this._loadFavorites();
        return this;
    };

    FavoriteMode.prototype.end = function () {
        this._saveFavorites();
        return QuizEngine.prototype.end.call(this);
    };

    FavoriteMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        return this;
    };

    // ============================================================
    //  模式 13: 每日一练模式 DailyMode
    // ============================================================

    /**
     * 每日一练模式
     * 每日推送固定题数，完成后打卡，连续打卡天数，每日学习报告
     */
    function DailyMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'daily';
        this.modeTitle = '每日一练';
        this.progressKey = 'sz_progress_daily';

        this.dailyConfig = {
            questionCount: 10,
            types: ['single', 'multiple', 'judge'],
            difficultyMix: true, // 混合难度
            autoGenerate: true, // 每天自动生成新题
            reminderEnabled: false
        };

        // 每日数据
        this.dailyData = {
            todayDate: null,
            questionIds: [],
            completed: false,
            checkedIn: false,
            score: 0,
            correctCount: 0,
            timeSpent: 0,
            startedAt: null,
            completedAt: null
        };

        // 打卡记录
        this.checkInData = {
            streakDays: 0,
            totalDays: 0,
            lastCheckInDate: null,
            history: {} // { 'YYYY-MM-DD': { score, correct, total, timeSpent } }
        };

        this.dailyStorageKey = 'sz_daily_data';
        this.checkInStorageKey = 'sz_checkin_data';

        if (options && options.dailyConfig) {
            this.dailyConfig = { ...this.dailyConfig, ...options.dailyConfig };
        }

        this._loadDailyData();
        this._loadCheckInData();
    }

    DailyMode.prototype = Object.create(QuizEngine.prototype);
    DailyMode.prototype.constructor = DailyMode;

    DailyMode.prototype._loadDailyData = function () {
        var data = Utils.storage.get(this.dailyStorageKey, null);
        var today = Utils.getToday();

        if (data && data.todayDate === today) {
            this.dailyData = data;
        } else {
            // 新的一天，重置
            this.dailyData = {
                todayDate: today,
                questionIds: [],
                completed: false,
                checkedIn: false,
                score: 0,
                correctCount: 0,
                timeSpent: 0,
                startedAt: null,
                completedAt: null
            };
        }
    };

    DailyMode.prototype._saveDailyData = function () {
        Utils.storage.set(this.dailyStorageKey, this.dailyData);
    };

    DailyMode.prototype._loadCheckInData = function () {
        this.checkInData = Utils.storage.get(this.checkInStorageKey, {
            streakDays: 0,
            totalDays: 0,
            lastCheckInDate: null,
            history: {}
        });
    };

    DailyMode.prototype._saveCheckInData = function () {
        Utils.storage.set(this.checkInStorageKey, this.checkInData);
    };

    DailyMode.prototype._buildQueue = function () {
        var today = Utils.getToday();

        // 如果今天已经生成了题目，使用已生成的
        if (this.dailyData.todayDate === today && this.dailyData.questionIds.length > 0) {
            var questions = [];
            for (var i = 0; i < this.dailyData.questionIds.length; i++) {
                var q = this.questionBank.getById(this.dailyData.questionIds[i]);
                if (q) questions.push(q);
            }
            this._initQueue(questions);
            this.currentIndex = 0;
            return;
        }

        // 生成今日题目
        var count = this.dailyConfig.questionCount;
        var filters = {
            sort: 'random',
            limit: count,
            type: this.dailyConfig.types
        };

        var result = this.questionBank.filter(filters);

        // 如果题目不够，补充所有题目
        if (result.questions.length < count) {
            var moreResult = this.questionBank.filter({
                sort: 'random',
                limit: count - result.questions.length
            });
            result.questions = result.questions.concat(moreResult.questions);
        }

        this._initQueue(result.questions.slice(0, count));
        this.currentIndex = 0;

        // 保存今日题目
        this.dailyData.todayDate = today;
        this.dailyData.questionIds = this.questionQueue.map(function (q) { return q.id; });
        this.dailyData.startedAt = Date.now();
        this._saveDailyData();
    };

    DailyMode.prototype.start = function () {
        if (!this.dailyData.startedAt) {
            this.dailyData.startedAt = Date.now();
            this._saveDailyData();
        }
        return QuizEngine.prototype.start.call(this);
    };

    /**
     * 提交答案
     */
    DailyMode.prototype.submitAnswer = function (answer) {
        var result = QuizEngine.prototype.submitAnswer.call(this, answer);
        if (!result.success) return result;

        // 更新每日数据
        this.dailyData.correctCount = this.stats.correct;
        this.dailyData.score = this.getProgress().accuracy;
        this._saveDailyData();

        // 检查是否完成
        if (this.stats.answered >= this.questionQueue.length) {
            this._completeDaily();
        }

        return result;
    };

    /**
     * 完成每日一练
     */
    DailyMode.prototype._completeDaily = function () {
        if (this.dailyData.completed) return;

        this.dailyData.completed = true;
        this.dailyData.completedAt = Date.now();
        this.dailyData.score = this.stats.answered > 0
            ? Math.round((this.stats.correct / this.questionQueue.length) * 100)
            : 0;
        this.dailyData.correctCount = this.stats.correct;
        this.dailyData.timeSpent = this.stats.totalTimeSpent;

        this._saveDailyData();

        // 自动打卡
        this.checkIn();

        this.emit('dailyComplete', {
            score: this.dailyData.score,
            correctCount: this.stats.correct,
            total: this.questionQueue.length,
            timeSpent: this.stats.totalTimeSpent,
            streakDays: this.checkInData.streakDays
        });
    };

    /**
     * 打卡
     */
    DailyMode.prototype.checkIn = function () {
        var today = Utils.getToday();

        if (this.dailyData.checkedIn && this.dailyData.todayDate === today) {
            return { success: false, alreadyCheckedIn: true };
        }

        // 计算连续打卡天数
        if (this.checkInData.lastCheckInDate) {
            var daysDiff = Utils.daysBetween(this.checkInData.lastCheckInDate, today);
            if (daysDiff === 1) {
                // 连续打卡
                this.checkInData.streakDays++;
            } else if (daysDiff > 1) {
                // 中断了，重置
                this.checkInData.streakDays = 1;
            }
            // daysDiff === 0 就是今天，不处理
        } else {
            this.checkInData.streakDays = 1;
        }

        if (!this.checkInData.lastCheckInDate ||
            Utils.daysBetween(this.checkInData.lastCheckInDate, today) >= 1) {
            this.checkInData.totalDays++;
        }

        this.checkInData.lastCheckInDate = today;

        // 记录今日详情
        this.checkInData.history[today] = {
            score: this.dailyData.score,
            correct: this.stats.correct,
            total: this.questionQueue.length,
            timeSpent: this.stats.totalTimeSpent,
            accuracy: this.stats.answered > 0
                ? Math.round((this.stats.correct / this.stats.answered) * 100)
                : 0
        };

        // 只保留最近90天的记录
        var allDates = Object.keys(this.checkInData.history).sort();
        if (allDates.length > 90) {
            var toRemove = allDates.slice(0, allDates.length - 90);
            for (var i = 0; i < toRemove.length; i++) {
                delete this.checkInData.history[toRemove[i]];
            }
        }

        this.dailyData.checkedIn = true;
        this._saveDailyData();
        this._saveCheckInData();

        this.emit('checkIn', {
            streakDays: this.checkInData.streakDays,
            totalDays: this.checkInData.totalDays,
            today: today
        });

        Utils.triggerEvent('daily:checkin', {
            streakDays: this.checkInData.streakDays,
            totalDays: this.checkInData.totalDays
        });

        return {
            success: true,
            streakDays: this.checkInData.streakDays,
            totalDays: this.checkInData.totalDays
        };
    };

    /**
     * 获取今日学习报告
     */
    DailyMode.prototype.getDailyReport = function () {
        var total = this.questionQueue.length;
        var answered = this.stats.answered;
        var correct = this.stats.correct;
        var accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

        return {
            date: this.dailyData.todayDate,
            totalQuestions: total,
            answered: answered,
            correct: correct,
            wrong: this.stats.wrong,
            accuracy: accuracy,
            score: accuracy,
            timeSpent: this.stats.totalTimeSpent,
            formattedTimeSpent: Utils.formatTime(Math.floor(this.stats.totalTimeSpent / 1000)),
            completed: this.dailyData.completed,
            checkedIn: this.dailyData.checkedIn,
            streakDays: this.checkInData.streakDays,
            totalDays: this.checkInData.totalDays,
            remaining: total - answered,
            progress: total > 0 ? Math.round((answered / total) * 100) : 0
        };
    };

    /**
     * 获取打卡日历数据
     */
    DailyMode.prototype.getCheckInCalendar = function (year, month) {
        year = year || new Date().getFullYear();
        month = month || new Date().getMonth() + 1;

        var calendar = [];
        var firstDay = new Date(year, month - 1, 1);
        var lastDay = new Date(year, month, 0);
        var startWeekday = firstDay.getDay(); // 0-6, 0是周日
        var daysInMonth = lastDay.getDate();

        // 填充前面的空白
        for (var i = 0; i < startWeekday; i++) {
            calendar.push({ date: null, checkedIn: false });
        }

        // 填充日期
        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = year + '-' + (month < 10 ? '0' : '') + month + '-' + (d < 10 ? '0' : '') + d;
            var isCheckedIn = !!this.checkInData.history[dateStr];
            calendar.push({
                date: dateStr,
                checkedIn: isCheckedIn,
                score: isCheckedIn ? this.checkInData.history[dateStr].score : null,
                isToday: dateStr === Utils.getToday()
            });
        }

        return {
            year: year,
            month: month,
            daysInMonth: daysInMonth,
            startWeekday: startWeekday,
            calendar: calendar,
            streakDays: this.checkInData.streakDays,
            totalDays: this.checkInData.totalDays
        };
    };

    /**
     * 获取最近N天的学习趋势
     */
    DailyMode.prototype.getTrendData = function (days) {
        days = days || 7;
        var trend = [];
        var today = new Date();

        for (var i = days - 1; i >= 0; i--) {
            var date = new Date(today);
            date.setDate(date.getDate() - i);
            var dateStr = Utils.formatDate(date, 'YYYY-MM-DD');
            var record = this.checkInData.history[dateStr];

            trend.push({
                date: dateStr,
                checkedIn: !!record,
                score: record ? record.score : 0,
                correct: record ? record.correct : 0,
                total: record ? record.total : 0,
                timeSpent: record ? record.timeSpent : 0
            });
        }

        return trend;
    };

    /**
     * 检查今日是否已完成
     */
    DailyMode.prototype.isTodayCompleted = function () {
        return this.dailyData.completed && this.dailyData.todayDate === Utils.getToday();
    };

    /**
     * 检查今日是否已打卡
     */
    DailyMode.prototype.isTodayCheckedIn = function () {
        return this.dailyData.checkedIn && this.dailyData.todayDate === Utils.getToday();
    };

    DailyMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.dailyConfig) {
            this.dailyConfig = { ...this.dailyConfig, ...options.dailyConfig };
        }
        this._loadDailyData();
        this._loadCheckInData();
        return this;
    };

    DailyMode.prototype.end = function () {
        this._saveDailyData();
        this._saveCheckInData();
        return QuizEngine.prototype.end.call(this);
    };

    DailyMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        return this;
    };

    // ============================================================
    //  模式 14: 游戏记忆模式 MemoryGameMode
    // ============================================================

    /**
     * 游戏记忆模式
     * 题目与答案配对游戏，翻牌匹配
     * 难度分级，计时和步数统计，星级评价
     */
    function MemoryGameMode(options) {
        QuizEngine.call(this, options);
        this.modeName = 'memory_game';
        this.modeTitle = '游戏记忆模式';
        this.progressKey = 'sz_progress_memory_game';

        this.gameConfig = {
            difficulty: 'medium', // easy | medium | hard
            pairCount: 6, // 配对数量
            department: null,
            type: null,
            showHint: true,
            hintCount: 3,
            timeBonus: true,
            stepPenalty: true
        };

        // 游戏状态
        this.gameState = {
            cards: [], // [{ id, questionId, type: 'question'|'answer', content, isFlipped, isMatched }]
            flippedCards: [], // 当前翻开的卡片
            matchedPairs: 0,
            steps: 0,
            startTime: null,
            endTime: null,
            hintsRemaining: 3,
            isPlaying: false,
            isPaused: false,
            combo: 0,
            maxCombo: 0
        };

        // 难度配置
        this.difficultyConfig = {
            easy: { pairCount: 4, timeBonus: 120, stepPenalty: 5, hintCount: 5 },
            medium: { pairCount: 6, timeBonus: 180, stepPenalty: 10, hintCount: 3 },
            hard: { pairCount: 10, timeBonus: 300, stepPenalty: 15, hintCount: 2 }
        };

        // 排行榜
        this.gameLeaderboardKey = 'sz_memory_game_leaderboard';

        if (options && options.gameConfig) {
            this.gameConfig = { ...this.gameConfig, ...options.gameConfig };
        }

        this._applyDifficulty();
    }

    MemoryGameMode.prototype = Object.create(QuizEngine.prototype);
    MemoryGameMode.prototype.constructor = MemoryGameMode;

    MemoryGameMode.prototype._applyDifficulty = function () {
        var config = this.difficultyConfig[this.gameConfig.difficulty] || this.difficultyConfig.medium;
        this.gameConfig.pairCount = config.pairCount;
        this.gameConfig.hintCount = config.hintCount;
        this.gameState.hintsRemaining = config.hintCount;
    };

    MemoryGameMode.prototype._buildQueue = function () {
        // 记忆游戏模式下，questionQueue存储的是用于生成配对的题目
        var filters = {
            sort: 'random',
            limit: this.gameConfig.pairCount
        };
        if (this.gameConfig.department) filters.department = this.gameConfig.department;
        if (this.gameConfig.type) filters.type = this.gameConfig.type;

        var result = this.questionBank.filter(filters);
        this._initQueue(result.questions);
        this.currentIndex = 0;

        // 生成卡片
        this._generateCards();
    };

    /**
     * 生成游戏卡片
     */
    MemoryGameMode.prototype._generateCards = function () {
        var cards = [];
        var questions = this.questionQueue.slice(0, this.gameConfig.pairCount);

        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var answerText = this._formatAnswer(q);

            // 题目卡
            cards.push({
                id: 'q_' + i + '_' + q.id,
                pairId: i,
                questionId: q.id,
                cardType: 'question',
                content: q.title,
                fullQuestion: q,
                isFlipped: false,
                isMatched: false,
                matchedAt: null
            });

            // 答案卡
            cards.push({
                id: 'a_' + i + '_' + q.id,
                pairId: i,
                questionId: q.id,
                cardType: 'answer',
                content: answerText,
                fullQuestion: q,
                isFlipped: false,
                isMatched: false,
                matchedAt: null
            });
        }

        // 打乱卡片顺序
        this.gameState.cards = Utils.shuffle(cards);
        this.gameState.flippedCards = [];
        this.gameState.matchedPairs = 0;
        this.gameState.steps = 0;
        this.gameState.combo = 0;
        this.gameState.maxCombo = 0;
    };

    /**
     * 格式化答案显示
     */
    MemoryGameMode.prototype._formatAnswer = function (question) {
        var answer = question.answer;
        var options = question.options;

        if (question.type === 'single' || question.type === 'radio') {
            if (typeof answer === 'number' && options && options[answer]) {
                return options[answer];
            }
            if (typeof answer === 'string' && options) {
                var idx = options.indexOf(answer);
                if (idx !== -1) {
                    return String.fromCharCode(65 + idx) + '. ' + answer;
                }
            }
            return String(answer);
        }

        if (question.type === 'multiple' || question.type === 'checkbox') {
            var answers = Array.isArray(answer) ? answer : [answer];
            var answerStr = answers.map(function (a) {
                if (typeof a === 'number' && options && options[a]) {
                    return String.fromCharCode(65 + a);
                }
                return String(a);
            }).join(', ');
            return answerStr;
        }

        if (question.type === 'judge' || question.type === 'boolean') {
            return answer === true || answer === 'true' || answer === '对' || answer === '正确' ? '正确' : '错误';
        }

        return String(answer);
    };

    /**
     * 开始游戏
     */
    MemoryGameMode.prototype.startGame = function () {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.startTime = Date.now();
        this.gameState.endTime = null;

        this.emit('gameStart', {
            totalPairs: this.gameConfig.pairCount,
            cardsCount: this.gameState.cards.length,
            difficulty: this.gameConfig.difficulty
        });

        return this.gameState.cards;
    };

    /**
     * 翻开一张卡片
     */
    MemoryGameMode.prototype.flipCard = function (cardId) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            return { success: false, reason: 'not_playing' };
        }

        // 找到卡片
        var card = null;
        var cardIndex = -1;
        for (var i = 0; i < this.gameState.cards.length; i++) {
            if (this.gameState.cards[i].id === cardId) {
                card = this.gameState.cards[i];
                cardIndex = i;
                break;
            }
        }

        if (!card) {
            return { success: false, reason: 'card_not_found' };
        }

        // 已经翻开或已匹配，不能再翻
        if (card.isFlipped || card.isMatched) {
            return { success: false, reason: 'already_flipped' };
        }

        // 已经翻开两张了，不允许翻第三张
        if (this.gameState.flippedCards.length >= 2) {
            return { success: false, reason: 'too_many_flipped' };
        }

        // 翻开卡片
        card.isFlipped = true;
        this.gameState.flippedCards.push(cardIndex);
        this.gameState.steps++;

        this.emit('cardFlip', {
            card: card,
            flippedCount: this.gameState.flippedCards.length
        });

        // 如果翻开了两张，检查是否匹配
        if (this.gameState.flippedCards.length === 2) {
            return this._checkMatch();
        }

        return {
            success: true,
            card: card,
            isMatchCheck: false,
            flippedCount: 1
        };
    };

    /**
     * 检查匹配
     */
    MemoryGameMode.prototype._checkMatch = function () {
        var idx1 = this.gameState.flippedCards[0];
        var idx2 = this.gameState.flippedCards[1];
        var card1 = this.gameState.cards[idx1];
        var card2 = this.gameState.cards[idx2];

        var isMatch = card1.pairId === card2.pairId && card1.cardType !== card2.cardType;

        if (isMatch) {
            // 匹配成功
            card1.isMatched = true;
            card2.isMatched = true;
            card1.matchedAt = Date.now();
            card2.matchedAt = Date.now();
            this.gameState.matchedPairs++;
            this.gameState.combo++;
            if (this.gameState.combo > this.gameState.maxCombo) {
                this.gameState.maxCombo = this.gameState.combo;
            }

            this.gameState.flippedCards = [];

            this.emit('match', {
                card1: card1,
                card2: card2,
                matchedPairs: this.gameState.matchedPairs,
                combo: this.gameState.combo
            });

            this._playSound('match');
            this._triggerParticleEffect('match');

            // 检查游戏是否结束
            if (this.gameState.matchedPairs >= this.gameConfig.pairCount) {
                this._finishGame();
            }

            return {
                success: true,
                isMatch: true,
                card1: card1,
                card2: card2,
                matchedPairs: this.gameState.matchedPairs,
                combo: this.gameState.combo,
                gameComplete: this.gameState.matchedPairs >= this.gameConfig.pairCount
            };
        } else {
            // 不匹配
            this.gameState.combo = 0;

            this.emit('mismatch', {
                card1: card1,
                card2: card2,
                steps: this.gameState.steps
            });

            this._playSound('mismatch');

            // 延迟翻回去
            var self = this;
            setTimeout(function () {
                if (card1 && !card1.isMatched) card1.isFlipped = false;
                if (card2 && !card2.isMatched) card2.isFlipped = false;
                self.gameState.flippedCards = [];
                self.emit('cardsReset', { count: 2 });
            }, 1000);

            return {
                success: true,
                isMatch: false,
                card1: card1,
                card2: card2,
                combo: 0,
                willReset: true
            };
        }
    };

    /**
     * 结束游戏
     */
    MemoryGameMode.prototype._finishGame = function () {
        this.gameState.isPlaying = false;
        this.gameState.endTime = Date.now();

        var result = this.getGameResult();

        // 更新排行榜
        this._updateLeaderboard(result);

        this.emit('gameComplete', result);
        Utils.triggerEvent('memory_game:complete', result);

        return result;
    };

    /**
     * 使用提示
     */
    MemoryGameMode.prototype.useHint = function () {
        if (this.gameState.hintsRemaining <= 0) {
            return { success: false, reason: 'no_hints' };
        }

        // 找一对未匹配的卡片，短暂显示
        var unmatched = [];
        for (var i = 0; i < this.gameState.cards.length; i++) {
            if (!this.gameState.cards[i].isMatched && !this.gameState.cards[i].isFlipped) {
                unmatched.push(this.gameState.cards[i]);
            }
        }

        if (unmatched.length < 2) {
            return { success: false, reason: 'no_cards' };
        }

        // 找一对相同的
        var pair = null;
        for (var j = 0; j < unmatched.length; j++) {
            for (var k = j + 1; k < unmatched.length; k++) {
                if (unmatched[j].pairId === unmatched[k].pairId) {
                    pair = [unmatched[j], unmatched[k]];
                    break;
                }
            }
            if (pair) break;
        }

        if (!pair) {
            return { success: false, reason: 'no_pair_found' };
        }

        this.gameState.hintsRemaining--;

        // 短暂显示
        pair[0].isFlipped = true;
        pair[1].isFlipped = true;

        var self = this;
        setTimeout(function () {
            pair[0].isFlipped = false;
            pair[1].isFlipped = false;
            self.emit('hintEnd', { hintsRemaining: self.gameState.hintsRemaining });
        }, 1500);

        this.emit('hintUsed', {
            pair: pair,
            hintsRemaining: this.gameState.hintsRemaining
        });

        return {
            success: true,
            pair: pair,
            hintsRemaining: this.gameState.hintsRemaining
        };
    };

    /**
     * 获取游戏结果
     */
    MemoryGameMode.prototype.getGameResult = function () {
        var timeSpent = this.gameState.endTime
            ? this.gameState.endTime - this.gameState.startTime
            : Date.now() - this.gameState.startTime;
        var timeSpentSeconds = Math.floor(timeSpent / 1000);

        // 计算得分
        var baseScore = this.gameConfig.pairCount * 100;
        var timeBonus = 0;
        var stepPenalty = 0;
        var comboBonus = this.gameState.maxCombo * 10;
        var hintPenalty = (this.gameConfig.hintCount - this.gameState.hintsRemaining) * 20;

        var diffConfig = this.difficultyConfig[this.gameConfig.difficulty];

        if (this.gameConfig.timeBonus && diffConfig) {
            var timeLimit = diffConfig.timeBonus;
            if (timeSpentSeconds < timeLimit) {
                timeBonus = (timeLimit - timeSpentSeconds) * 2;
            }
        }

        if (this.gameConfig.stepPenalty && diffConfig) {
            var minSteps = this.gameConfig.pairCount * 2;
            var extraSteps = Math.max(0, this.gameState.steps - minSteps);
            stepPenalty = extraSteps * diffConfig.stepPenalty;
        }

        var totalScore = Math.max(0, baseScore + timeBonus + comboBonus - stepPenalty - hintPenalty);

        // 星级评价
        var stars = this._calculateStars(totalScore, baseScore);

        return {
            mode: this.modeName,
            difficulty: this.gameConfig.difficulty,
            totalPairs: this.gameConfig.pairCount,
            matchedPairs: this.gameState.matchedPairs,
            steps: this.gameState.steps,
            timeSpent: timeSpent,
            formattedTime: Utils.formatTime(timeSpentSeconds),
            maxCombo: this.gameState.maxCombo,
            hintsUsed: this.gameConfig.hintCount - this.gameState.hintsRemaining,
            baseScore: baseScore,
            timeBonus: timeBonus,
            comboBonus: comboBonus,
            stepPenalty: stepPenalty,
            hintPenalty: hintPenalty,
            totalScore: Math.round(totalScore),
            stars: stars,
            rank: this._getGameRank(Math.round(totalScore))
        };
    };

    /**
     * 计算星级
     */
    MemoryGameMode.prototype._calculateStars = function (score, baseScore) {
        var ratio = score / baseScore;
        if (ratio >= 1.5) return 3;
        if (ratio >= 1.2) return 2;
        if (ratio >= 0.8) return 1;
        return 0;
    };

    /**
     * 更新排行榜
     */
    MemoryGameMode.prototype._updateLeaderboard = function (result) {
        var key = this.gameLeaderboardKey + '_' + this.gameConfig.difficulty;
        var leaderboard = Utils.storage.get(key, []);
        leaderboard.push({
            score: result.totalScore,
            stars: result.stars,
            steps: result.steps,
            timeSpent: result.timeSpent,
            date: Utils.getToday(),
            timestamp: Date.now()
        });

        leaderboard.sort(function (a, b) { return b.score - a.score; });
        leaderboard = leaderboard.slice(0, 100);
        Utils.storage.set(key, leaderboard);
    };

    MemoryGameMode.prototype._getGameRank = function (score) {
        var key = this.gameLeaderboardKey + '_' + this.gameConfig.difficulty;
        var leaderboard = Utils.storage.get(key, []);
        var rank = leaderboard.findIndex(function (item) { return item.score <= score; });
        return rank === -1 ? leaderboard.length + 1 : rank + 1;
    };

    /**
     * 获取游戏排行榜
     */
    MemoryGameMode.prototype.getLeaderboard = function (difficulty, limit) {
        difficulty = difficulty || this.gameConfig.difficulty;
        limit = limit || 10;
        var key = this.gameLeaderboardKey + '_' + difficulty;
        var leaderboard = Utils.storage.get(key, []);
        return leaderboard.slice(0, limit);
    };

    /**
     * 获取游戏状态
     */
    MemoryGameMode.prototype.getGameState = function () {
        return {
            isPlaying: this.gameState.isPlaying,
            isPaused: this.gameState.isPaused,
            matchedPairs: this.gameState.matchedPairs,
            totalPairs: this.gameConfig.pairCount,
            steps: this.gameState.steps,
            combo: this.gameState.combo,
            maxCombo: this.gameState.maxCombo,
            hintsRemaining: this.gameState.hintsRemaining,
            cards: this.gameState.cards.map(function (c) {
                return {
                    id: c.id,
                    isFlipped: c.isFlipped,
                    isMatched: c.isMatched,
                    cardType: c.cardType,
                    content: c.isFlipped || c.isMatched ? c.content : null
                };
            }),
            elapsedTime: this.gameState.startTime ? Date.now() - this.gameState.startTime : 0
        };
    };

    /**
     * 暂停游戏
     */
    MemoryGameMode.prototype.pauseGame = function () {
        if (!this.gameState.isPlaying) return false;
        this.gameState.isPaused = true;
        this.emit('gamePause');
        return true;
    };

    /**
     * 继续游戏
     */
    MemoryGameMode.prototype.resumeGame = function () {
        if (!this.gameState.isPaused) return false;
        this.gameState.isPaused = false;
        this.emit('gameResume');
        return true;
    };

    /**
     * 重新开始
     */
    MemoryGameMode.prototype.restartGame = function () {
        this._generateCards();
        this.gameState.isPlaying = false;
        this.gameState.isPaused = false;
        this.gameState.startTime = null;
        this.gameState.endTime = null;
        this.gameState.hintsRemaining = this.gameConfig.hintCount;
        this.emit('gameRestart');
        return this.startGame();
    };

    /**
     * 设置难度
     */
    MemoryGameMode.prototype.setDifficulty = function (difficulty) {
        if (this.difficultyConfig[difficulty]) {
            this.gameConfig.difficulty = difficulty;
            this._applyDifficulty();
            this._buildQueue();
            this.emit('difficultyChange', { difficulty: difficulty });
            return true;
        }
        return false;
    };

    MemoryGameMode.prototype.init = function (options) {
        QuizEngine.prototype.init.call(this, options);
        if (options.gameConfig) {
            this.gameConfig = { ...this.gameConfig, ...options.gameConfig };
        }
        this._applyDifficulty();
        return this;
    };

    MemoryGameMode.prototype.end = function () {
        this.gameState.isPlaying = false;
        return QuizEngine.prototype.end.call(this);
    };

    MemoryGameMode.prototype.reset = function () {
        QuizEngine.prototype.reset.call(this);
        this.gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            steps: 0,
            startTime: null,
            endTime: null,
            hintsRemaining: this.gameConfig.hintCount,
            isPlaying: false,
            isPaused: false,
            combo: 0,
            maxCombo: 0
        };
        return this;
    };

    // ============================================================
    //  模式工厂与注册中心
    // ============================================================

    /**
     * 模式注册表
     */
    var ModeRegistry = {
        modes: {},

        /**
         * 注册模式
         */
        register: function (modeName, ModeClass, meta) {
            this.modes[modeName] = {
                name: modeName,
                cls: ModeClass,
                meta: meta || {}
            };
        },

        /**
         * 创建模式实例
         */
        create: function (modeName, options) {
            var mode = this.modes[modeName];
            if (!mode) {
                throw new Error('Mode not found: ' + modeName);
            }
            return new mode.cls(options);
        },

        /**
         * 获取所有模式列表
         */
        list: function () {
            var list = [];
            for (var name in this.modes) {
                if (this.modes.hasOwnProperty(name)) {
                    list.push({
                        name: name,
                        title: this.modes[name].meta.title || name,
                        description: this.modes[name].meta.description || '',
                        icon: this.modes[name].meta.icon || '',
                        category: this.modes[name].meta.category || 'basic'
                    });
                }
            }
            return list;
        },

        /**
         * 检查模式是否存在
         */
        has: function (modeName) {
            return !!this.modes[modeName];
        },

        /**
         * 获取模式元信息
         */
        getMeta: function (modeName) {
            return this.modes[modeName] ? this.modes[modeName].meta : null;
        }
    };

    // 注册所有模式
    ModeRegistry.register('sequential', SequentialMode, {
        title: '顺序模式',
        description: '按题号顺序刷题，支持从上次位置继续',
        icon: 'list-ordered',
        category: 'basic'
    });

    ModeRegistry.register('shuffle', ShuffleMode, {
        title: '乱序模式',
        description: '题目随机打乱顺序，可重新洗牌',
        icon: 'shuffle',
        category: 'basic'
    });

    ModeRegistry.register('exam', ExamMode, {
        title: '组卷模式',
        description: '模拟考试，计时交卷，按比例抽题',
        icon: 'exam',
        category: 'exam'
    });

    ModeRegistry.register('department', DepartmentMode, {
        title: '按部门刷题',
        description: '选择部门后刷题，显示部门掌握度',
        icon: 'building',
        category: 'basic'
    });

    ModeRegistry.register('forgetting_curve', ForgettingCurveMode, {
        title: '遗忘曲线模式',
        description: '基于艾宾浩斯遗忘曲线，科学安排复习',
        icon: 'brain',
        category: 'science'
    });

    ModeRegistry.register('loop', LoopMode, {
        title: '循环刷题模式',
        description: '选择题号范围循环刷题，错题反复出现',
        icon: 'loop',
        category: 'practice'
    });

    ModeRegistry.register('study', StudyMode, {
        title: '背题模式',
        description: '先显示题目和答案，确认已记住后下一题',
        icon: 'book',
        category: 'memory'
    });

    ModeRegistry.register('flashcard', FlashcardMode, {
        title: '闪卡模式',
        description: '卡片式记忆，基于间隔重复算法',
        icon: 'card',
        category: 'memory'
    });

    ModeRegistry.register('speed', SpeedMode, {
        title: '快答模式',
        description: '限时答题，连击系统，排行榜',
        icon: 'flash',
        category: 'challenge'
    });

    ModeRegistry.register('answer_card', AnswerCardMode, {
        title: '选题模式',
        description: '答题卡视图，点击题号跳转，批量标记',
        icon: 'grid',
        category: 'tool'
    });

    ModeRegistry.register('wrong_book', WrongBookMode, {
        title: '错题本模式',
        description: '错题收集重做，按时间部门题型筛选',
        icon: 'wrong',
        category: 'review'
    });

    ModeRegistry.register('favorite', FavoriteMode, {
        title: '收藏模式',
        description: '收藏题目，按分类筛选复习',
        icon: 'star',
        category: 'review'
    });

    ModeRegistry.register('daily', DailyMode, {
        title: '每日一练',
        description: '每日推送固定题数，打卡连续学习',
        icon: 'calendar',
        category: 'daily'
    });

    ModeRegistry.register('memory_game', MemoryGameMode, {
        title: '游戏记忆模式',
        description: '题目与答案配对翻牌游戏，星级评价',
        icon: 'game',
        category: 'game'
    });

    // ============================================================
    //  导出到命名空间
    // ============================================================

    SZ.modes = {
        // 核心类
        QuestionBank: QuestionBank,
        QuizEngine: QuizEngine,
        EventEmitter: EventEmitter,
        Utils: Utils,

        // 模式类
        SequentialMode: SequentialMode,
        ShuffleMode: ShuffleMode,
        ExamMode: ExamMode,
        DepartmentMode: DepartmentMode,
        ForgettingCurveMode: ForgettingCurveMode,
        LoopMode: LoopMode,
        StudyMode: StudyMode,
        FlashcardMode: FlashcardMode,
        SpeedMode: SpeedMode,
        AnswerCardMode: AnswerCardMode,
        WrongBookMode: WrongBookMode,
        FavoriteMode: FavoriteMode,
        DailyMode: DailyMode,
        MemoryGameMode: MemoryGameMode,

        // 模式注册与工厂
        Registry: ModeRegistry,
        createMode: function (modeName, options) {
            return ModeRegistry.create(modeName, options);
        },
        getModeList: function () {
            return ModeRegistry.list();
        },
        hasMode: function (modeName) {
            return ModeRegistry.has(modeName);
        },
        getModeMeta: function (modeName) {
            return ModeRegistry.getMeta(modeName);
        },

        // 版本信息
        version: '2.0.0',

        // 模式总数
        modeCount: 14
    };

    // 兼容全局变量
    window.SZQuizModes = SZ.modes;

})(window);