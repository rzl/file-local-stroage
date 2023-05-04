"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.FileLocalStroage = void 0;
var fs = require("fs");
var path = require("path");
/**
 * 一个使用目录与文件作为存储结构的存储类，它提供与浏览器localstorage相似的方法函数对是数据进行操作，
 * 存储API的存储接口提供对本地存储的访问。例如，它允许添加、修改或删除存储的数据项。
 * @interface [Opt]
 * @constructor
 */
var FileLocalStroage = /** @class */ (function () {
    function FileLocalStroage(opt) {
        var _this = this;
        /**
         * @private
         * @readonly
         * {@link Opt.stroageDir}
         * 存储目录
         */
        this.stroageDir = "file-local-stroage-cache";
        /**
         * @private
         * @readonly
         * @ignore
         * 当前存储的名称
         */
        this.namespace = "default";
        /**
         * @private
         * @readonly
         * @ignore
         * 是否自动转换JSON，默认为true，对数据进行JSON.stringify操作
         */
        this.autoJson = true;
        /**
         * @private
         * @readonly
         * json.stringify使用的空格, 当autoJson参数为true才会生效
         */
        this.jsonSpace = 4;
        /**
         * @private
         * @readonly
         * 文件后缀，存储
         */
        this.suffix = ".json";
        /**
         * 键值对会同步存在这里
         */
        this.map = {};
        /**
         * 当autoJson为true时，键值对会同步存在这里， 值以JSON对象存储，一般用于内容搜索
         */
        this.mapJson = {};
        /**
         * 是否从map中读取数据，默认每次都读取文件
         * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
         */
        this.useMapCache = false;
        if (!opt)
            return this;
        Object.assign(this, opt);
        if (!fs.existsSync(this.stroageDir)) {
            try {
                fs.mkdirSync(this.stroageDir);
            }
            catch (e) {
                throw e;
            }
        }
        if (!fs.existsSync(this.stroagePath)) {
            fs.mkdirSync(this.stroagePath);
        }
        this.setAutoJson(opt.autoJson);
        this.proxy = new Proxy(this.map, {
            get: function (target, key) {
                if (!_this.autoJson) {
                    return _this.getItem(key);
                }
                else {
                    var v = _this.getItem(key);
                    var handle = {
                        get: function (subTarget, name) {
                            var res = Reflect.get(subTarget, name);
                            if (typeof res === "object") {
                                return new Proxy(res, handle);
                            }
                            else {
                                return res;
                            }
                        },
                        set: function (subTarget, name, value, receiver) {
                            var success = Reflect.set(subTarget, name, value, receiver);
                            if (success) {
                                _this.setItem(key, v);
                            }
                            return success;
                        },
                        deleteProperty: function (subTarget, name) {
                            var res = Reflect.deleteProperty(subTarget, name);
                            _this.setItem(key, v);
                            return res;
                        },
                    };
                    return new Proxy(v, handle);
                }
            },
            set: function (target, key, value) {
                _this.setItem(key, value);
                return true;
            },
            deleteProperty: function (target, key) {
                _this.removeItem(key);
                return true;
            },
            getPrototypeOf: function (target) {
                return target;
            },
        });
        if (this.useMapCache) {
            this.loadStroage();
        }
        return this;
    }
    Object.defineProperty(FileLocalStroage.prototype, "stroagePath", {
        /**
         * 当前存储目录，由存储目录与当前存储名称组成
         */
        get: function () {
            return path.join(this.stroageDir, this.namespace);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @ignore
     * @param value
     */
    FileLocalStroage.prototype.setAutoJson = function (value) {
        this.autoJson = value;
        if (value === false) {
            this.getItem = this.getItemCache;
            this.setItem = this.setItemRaw;
        }
    };
    FileLocalStroage.prototype.create = function (opt) {
        if (opt === void 0) { opt = {
            stroageDir: this.stroageDir,
            namespace: this.namespace,
            autoJson: this.autoJson,
            useMapCache: this.useMapCache,
            jsonSpace: this.jsonSpace,
            suffix: this.suffix,
        }; }
        if (opt.autoJson === false) {
            opt.suffix = "";
        }
        else {
            opt.autoJson = true;
        }
        var fls = new FileLocalStroage(opt);
        return fls;
    };
    FileLocalStroage.prototype.resolveItemPath = function (item) {
        return path.join(this.stroagePath, encodeURIComponent(item) + this.suffix);
    };
    /**
     * 设置键名对应的键值，如果存在键名，则覆盖原有的键名键值，会同步设置当前存储对象的map属性
     *
     * 当autoJson为true时 改方法会被改写为 setItemJson
     *
     * 设置后产生存储文件,文件路径由当前存储对象属性 ./stroageDir/namespace/item.suffix 组成
     * item会通过encodeURIComponent进行编码
     *
     * @param {string} item - 需要存储的键名
     * @param {string | object} value - 需要存储的键值 autoJson 为true时
     */
    FileLocalStroage.prototype.setItem = function (item, value) {
        return this.setItemJson(item, value);
    };
    /**
     * 设置键名对应的键值
     * @param {string} item - 需要存储的键名
     * @param {string} value - 需要存储的键值
     * @returns
     */
    FileLocalStroage.prototype.setItemRaw = function (item, value) {
        this.map[item] = value;
        fs.writeFileSync(this.resolveItemPath(item), value.toString());
        return this;
    };
    /**
     * 设置键名对应的键值， 值会进行JSON.stringify处理
     * @param {string} item - 需要存储的键名
     * @param {object} value - 需要存储的键值
     * @returns
     */
    FileLocalStroage.prototype.setItemJson = function (item, value) {
        var str = JSON.stringify(value, null, this.jsonSpace);
        this.mapJson[item] = JSON.parse(str);
        return this.setItemRaw(item, str);
    };
    /**
     * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
     * @param item - 需要获取键值的键名
     * @returns
     */
    FileLocalStroage.prototype.getItem = function (item) {
        return this.getItemJson(item);
    };
    /**
   * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
   * @param item - 需要获取键值的键名
   * @returns
   */
    FileLocalStroage.prototype.getItemCache = function (item) {
        if (this.useMapCache && this.map[item]) {
            return this.getMapItem(item);
        }
        return this.getItemRaw(item);
    };
    /**
     * 根据键名，从当前存储对象中获取键值，从文件中获取键值，并同步到当前的map属性中
     * @param item - 需要获取键值的键名
     * @returns
     */
    FileLocalStroage.prototype.getItemRaw = function (item) {
        var p = this.resolveItemPath(item);
        if (fs.existsSync(p)) {
            var str = fs.readFileSync(p);
            this.map[item] = str;
            if (this.autoJson) {
                this.mapJson[item] = JSON.parse(str);
            }
            return str;
        }
        else {
            delete this.map[item];
            delete this.mapJson[item];
        }
    };
    /**
     * 根据键名，从当前存储对象中获取键值，并进行JSON.parse解释
     * @param item - 需要获取键值的键名
     * @returns
     */
    FileLocalStroage.prototype.getItemJson = function (item) {
        var str;
        if (this.useMapCache && this.map[item]) {
            str = this.getMapItem(item);
        }
        else {
            str = this.getItemRaw(item);
        }
        if (str) {
            return JSON.parse(str);
        }
    };
    /**
     * 根据键名，从当前存储对象中map属性获取键值
     * @param item - 需要获取键值的键名
     * @returns
     */
    FileLocalStroage.prototype.getMapItem = function (item) {
        if (this.map[item]) {
            if (this.autoJson) {
                return JSON.parse(this.map[item]);
            }
        }
        else {
            return this.getItemRaw(item);
        }
    };
    /**
     * 根据键名，从当前对象中删除存储的键值，删除map中的属性，及对应的存储文件
     * @param item - 需要删除的键名
     * @returns
     */
    FileLocalStroage.prototype.removeItem = function (item) {
        delete this.map[item];
        delete this.mapJson[item];
        var p = this.resolveItemPath(item);
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
        return this;
    };
    Object.defineProperty(FileLocalStroage.prototype, "keys", {
        /**
         * 获取当前存储对象的所有键名
         * @returns {string[]}
         */
        get: function () {
            var _this = this;
            return fs.readdirSync(this.stroagePath).map(function (_) {
                return decodeURIComponent(path.basename(_, _this.suffix));
            });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 加载当前存储所有的键名，然后同步一次到当前对象的map属性
     * @returns
     */
    FileLocalStroage.prototype.loadStroage = function () {
        var _this = this;
        this.keys.forEach(function (item) {
            _this.getItemRaw(item);
        });
        return this;
    };
    /**
     * 清除当前存储所有键名，键值，map属性以及存储文件
     * @returns
     */
    FileLocalStroage.prototype.clear = function () {
        var _this = this;
        this.keys.forEach(function (item) {
            _this.removeItem(item);
        });
        return this;
    };
    return FileLocalStroage;
}());
exports.FileLocalStroage = FileLocalStroage;
var _default = new FileLocalStroage(null);
exports.default = _default;
var create = function (opt) {
    return _default.create.apply(_default, [opt]);
};
exports.create = create;
