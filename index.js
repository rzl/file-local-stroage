var fs = require('fs');
var path = require('path');
class FileLocalStroage {
    /**
     * 存储目录
     */
    stroageDir = 'file-local-stroage-cache';
    /**
     * 当前存储的名称
     */
    namespace = 'default';
    /**
     * 当前存储目录，由存储目录与当前存储名称组成
    */
    _stroagePath = ''
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
     * 键值对会同步存在这里
     */
    _map = {}
    get map() {
        return this._map
    }
    /**
     * 是否从map中读取数据，默认每次都读取文件
     * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
     */
    useMapCache = false
    /**
     * 对象会创建一个proxy对象
     * 用于实现类似功能 localStorage.aa = {a: 1}
     */
    _proxy
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
                return this.getItem(key)
            },
            set: (target, key, value) => {
                return this.setItem(key, value)
            },
            deleteProperty: (target, key) => {
                return this.removeItem(key)
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
        jsonSpace: this.jsonSpace
    }) {
        let fls = new FileLocalStroage(opt)
        this.__All_FILE_LOCAL_STROAGE.push(fls)
        return fls
    }

    resolveItemPath(item) {
        return path.join(this.stroagePath, item)
    }

    _setItem(item, value) {
        this._map[item] = value
        fs.writeFileSync(this.resolveItemPath(item), value.toString())
        return this
    }
    __getItem(item) {
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
    _getItem(item) {
        if (this.useMapCache && this.map[item]) {
            return this.map[item]
        }
        return this.__getItem(item)
    }

    _setItemJson(item, value) {
        return this._setItem(item, JSON.stringify(value, null, this.jsonSpace))
    }

    _getItemJson(item) {
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
        return fs.readdirSync(this.stroagePath)
    }

    loadStroage() {
        this.keys.forEach((item) => {
            this.__getItem(item)
        })
    }

    clear() {
        this.keys.forEach((item) => {
            fs.unlinkSync(this.resolveItemPath(item))
        })
    }
}

FileLocalStroage.prototype.__All_FILE_LOCAL_STROAGE = []

module.exports = new FileLocalStroage()