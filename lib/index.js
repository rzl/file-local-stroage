"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.FileLocalStroage = void 0;
var fs = require('fs');
var path = require('path');
var FileLocalStroage = /** @class */ (function () {
    function FileLocalStroage(opt) {
        var _this = this;
        /**
         * 存储目录
         */
        this.stroageDir = 'file-local-stroage-cache';
        /**
         * 当前存储的名称
         */
        this.namespace = 'default';
        /**
         * 当前存储目录，由存储目录与当前存储名称组成
        */
        this._stroagePath = '';
        /**
         * 是否自动转换JSON
         */
        this.autoJson = true;
        /**
         * json.stringify使用的空格
         */
        this.jsonSpace = 4;
        /**
         * 文件后缀
         */
        this.suffix = '.json';
        /**
         * 键值对会同步存在这里
         */
        this._map = {};
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
        this._proxy = new Proxy(this._map, {
            get: function (target, key) {
                if (!_this.autoJson) {
                    return _this.getItem(key);
                }
                else {
                    var v = _this.getItem(key);
                    var handle = {
                        get: function (subTarget, name) {
                            var res = Reflect.get(subTarget, name);
                            if (typeof res === 'object') {
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
            }
        });
        if (this.useMapCache) {
            this.loadStroage();
        }
        return this;
    }
    Object.defineProperty(FileLocalStroage.prototype, "stroagePath", {
        get: function () {
            return path.join(this.stroageDir, this.namespace);
        },
        enumerable: false,
        configurable: true
    });
    FileLocalStroage.prototype.setAutoJson = function (value) {
        if (value === false) {
            this.autoJson = false;
            this.getItem = this._getItem;
            this.setItem = this._setItem;
        }
        else {
            this.autoJson = true;
            this.getItem = this._getItemJson;
            this.setItem = this._setItemJson;
        }
    };
    Object.defineProperty(FileLocalStroage.prototype, "map", {
        get: function () {
            return this._map;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileLocalStroage.prototype, "proxy", {
        get: function () {
            return this._proxy;
        },
        enumerable: false,
        configurable: true
    });
    FileLocalStroage.prototype.create = function (opt) {
        if (opt === void 0) { opt = {
            stroageDir: this.stroageDir,
            namespace: this.namespace,
            autoJson: this.autoJson,
            useMapCache: this.useMapCache,
            jsonSpace: this.jsonSpace,
            suffix: this.suffix
        }; }
        if (opt.autoJson === false) {
            this.suffix = '';
        }
        var fls = new FileLocalStroage(opt);
        this.__All_FILE_LOCAL_STROAGE.push(fls);
        return fls;
    };
    FileLocalStroage.prototype.resolveItemPath = function (item) {
        return path.join(this.stroagePath, encodeURIComponent(item) + this.suffix);
    };
    FileLocalStroage.prototype.setItem = function (item, value) { };
    FileLocalStroage.prototype._setItem = function (item, value) {
        this._map[item] = value;
        fs.writeFileSync(this.resolveItemPath(item), value.toString());
        return this;
    };
    FileLocalStroage.prototype.__getItem = function (item) {
        var p = this.resolveItemPath(item);
        if (fs.existsSync(p)) {
            var str = fs.readFileSync(p);
            if (!this.map[item]) {
                this.map[item] = str;
            }
            return str;
        }
        else {
            delete this.map[item];
        }
    };
    FileLocalStroage.prototype.getItem = function (item) { };
    FileLocalStroage.prototype._getItem = function (item) {
        if (this.useMapCache && this.map[item]) {
            return this.map[item];
        }
        return this.__getItem(item);
    };
    FileLocalStroage.prototype._setItemJson = function (item, value) {
        return this._setItem(item, JSON.stringify(value, null, this.jsonSpace));
    };
    FileLocalStroage.prototype._getItemJson = function (item) {
        var str = this._getItem(item);
        if (str) {
            return JSON.parse(str);
        }
    };
    FileLocalStroage.prototype.removeItem = function (item) {
        delete this._map[item];
        var p = this.resolveItemPath(item);
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
        return this;
    };
    Object.defineProperty(FileLocalStroage.prototype, "keys", {
        get: function () {
            var _this = this;
            return fs.readdirSync(this.stroagePath).map(function (_) { return decodeURIComponent(path.basename(_, _this.suffix)); });
        },
        enumerable: false,
        configurable: true
    });
    FileLocalStroage.prototype.loadStroage = function () {
        var _this = this;
        this.keys.forEach(function (item) {
            _this.__getItem(item);
        });
        return this;
    };
    FileLocalStroage.prototype.clearAll = function () {
        var _this = this;
        this.keys.forEach(function (item) {
            fs.unlinkSync(_this.resolveItemPath(item));
        });
    };
    FileLocalStroage.prototype.clear = function (item) {
        fs.unlinkSync(this.resolveItemPath(item));
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
FileLocalStroage.prototype.__All_FILE_LOCAL_STROAGE = new Array();
