var fs = require('fs');
var path = require('path');
/**
 * 一个模拟浏览器localstorage的存储类
 * @interface [Opt]
 * @constructor 
 */
export class FileLocalStroage {
    /**
     * 存储目录
     */
    stroageDir = 'file-local-stroage-cache';
    /**
     * 当前存储的名称
     */
    namespace = 'default';
    /**
     * @ignore
     */
    _stroagePath = ''
    /**
     * 当前存储目录，由存储目录与当前存储名称组成
    */
    get stroagePath() {
        return path.join(this.stroageDir, this.namespace)
    }
    /**
     * 是否自动转换JSON
     */
    autoJson = true
    setAutoJson(value) {
        if (value === false) {
            this.autoJson = false
            this.getItem = this._getItem
            this.setItem = this._setItem
        } else {
            this.autoJson = true
            this.getItem = this._getItemJson
            this.setItem = this._setItemJson
        }
    }
    /**
     * json.stringify使用的空格
     */
    jsonSpace = 4

    /**
     * 文件后缀
     */
    suffix = '.json'
    /**
     * 键值对会同步存在这里
     */
    private _map = {}
    get map() {
        return this._map
    }
    /**
     * 是否从map中读取数据，默认每次都读取文件
     * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
     */
    useMapCache = false
    /**
     * @ignore
     */
    private _proxy
    /**
     * 对象会创建一个proxy对象
     * 用于实现类似功能 localStorage.aa = {a: 1}
     */
    get proxy() {
        return this._proxy
    }
    constructor(opt) {
        if (!opt) return this
        Object.assign(this, opt)
        if (!fs.existsSync(this.stroageDir)) {
            try {
                fs.mkdirSync(this.stroageDir)
            } catch (e) {
                throw e
            }
        }
        if (!fs.existsSync(this.stroagePath)) {
            fs.mkdirSync(this.stroagePath)
        }
        this.setAutoJson(opt.autoJson)
        this._proxy = new Proxy(this._map, {
            get: (target, key) => {
                if (!this.autoJson) {
                    return this.getItem(key)
                } else {
                    var v =this.getItem(key)
                    var handle = {
                        get: (subTarget, name) => {
                            var res = Reflect.get(subTarget, name)
                            if (typeof res === 'object') {
                                return new Proxy(res, handle)
                            } else {
                                return res
                            }
                        },
                        set:(subTarget, name, value,receiver) => {
                            var success = Reflect.set(subTarget, name, value, receiver);
                            if (success) {
                                this.setItem(key, v)
                            }
                            return success
                        },
                        deleteProperty: (subTarget, name): boolean => {
                            var res = Reflect.deleteProperty(subTarget, name);
                            this.setItem(key, v)
                            return res

                        },
                    }
                    return new Proxy(v, handle)
                }
            },
            set: (target, key, value): boolean => {
                this.setItem(key, value)
                return true
            },
            deleteProperty: (target, key):boolean => {
                this.removeItem(key)
                return true
            },
            getPrototypeOf: (target) => {
                return target
            }
        })
        if (this.useMapCache) {
            this.loadStroage()
        }
        return this
    }

    create(opt = {
        stroageDir: this.stroageDir,
        namespace: this.namespace,
        autoJson: this.autoJson,
        useMapCache: this.useMapCache,
        jsonSpace: this.jsonSpace,
        suffix: this.suffix
    }) {
        if (opt.autoJson === false) {
            this.suffix = ''
        }
        let fls = new FileLocalStroage(opt)
        return fls
    }

    resolveItemPath(item) {
        return path.join(this.stroagePath, encodeURIComponent(item) + this.suffix)
    }
    /** 
     * 设置项目
     *      一个和浏览器上用法一致的函数
     *      
     * @param item A string containing the name of the key you want to create/update.
     * @param value A string containing the value you want to give the key you are creating/updating.
     */
    setItem(item, value) {}
    _setItem(item, value) {
        this._map[item] = value
        fs.writeFileSync(this.resolveItemPath(item), value.toString())
        return this
    }
    __getItem(item):any {
        let p = this.resolveItemPath(item)
        if (fs.existsSync(p)) {
            var str = fs.readFileSync(p)
            if (!this.map[item]) {
                this.map[item] = str
            }
            return str
        } else {
            delete this.map[item]
        }
    }
    getItem(item):any {}
    _getItem(item):any {
        if (this.useMapCache && this.map[item]) {
            return this.map[item]
        }
        return this.__getItem(item)
    }

    _setItemJson(item, value) {
        return this._setItem(item, JSON.stringify(value, null, this.jsonSpace))
    }

    _getItemJson(item):any {
        let str = this._getItem(item)
        if (str) {
            return JSON.parse(str)
        }
    }

    removeItem(item) {
        delete this._map[item]
        let p = this.resolveItemPath(item)
        if (fs.existsSync(p)) {
            fs.unlinkSync(p)
        }
        return this
    }

    get keys() {
        return fs.readdirSync(this.stroagePath).map(_ => decodeURIComponent(path.basename(_, this.suffix)))
    }

    loadStroage() {
        this.keys.forEach((item) => {
            this.__getItem(item)
        })
        return this
    }

    clearAll() {
        this.keys.forEach((item) => {
            fs.unlinkSync(this.resolveItemPath(item))
        })
    }

    clear(item) {
        fs.unlinkSync(this.resolveItemPath(item))
    }
}

export class FileLocalStroageJson extends FileLocalStroage {

}

var _default = new FileLocalStroageJson(null)
export default _default

/**
 * @interface Opt
 */
export interface Opt {
      /**
     * 存储目录 默认file-local-stroage-cache
     */
      stroageDir: string;
      /**
       * 当前存储的名称 默认default
       */
      namespace: string;
      /**
       * 是否自动转换JSON 默认true
       */
      autoJson: boolean;
      /**
       * json.stringify使用的空格 默认缩进4
       */
      jsonSpace: number;
      /**
       * 文件后缀 默认.json
       */
      suffix: string;
}

export const create = (opt: Opt):FileLocalStroage => { 
    return _default.create.apply(_default, [opt])
}



