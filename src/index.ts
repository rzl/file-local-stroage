var fs = require("fs");
var path = require("path");
/**
 * 一个使用目录与文件作为存储结构的存储类，它提供与浏览器localstorage相似的方法函数对是数据进行操作，
 * 存储API的存储接口提供对本地存储的访问。例如，它允许添加、修改或删除存储的数据项。
 * @interface [Opt]
 * @constructor
 */
export class FileLocalStroage {
  /**
   * @private
   * @readonly
   * {@link Opt.stroageDir}
   * 存储目录
   */
  private stroageDir = "file-local-stroage-cache";

  /**
   * @private
   * @readonly
   * @ignore
   * 当前存储的名称
   */
  private namespace = "default";

  /**
   * 当前存储目录，由存储目录与当前存储名称组成
   */
  get stroagePath() {
    return path.join(this.stroageDir, this.namespace);
  }
  /**
   * @private
   * @readonly
   * @ignore
   * 是否自动转换JSON，默认为true，对数据进行JSON.stringify操作
   */
  private autoJson = true;
  /**
   * @ignore
   * @param value
   */
  private setAutoJson(value) {
    this.autoJson = value;
    if (value === false) {
      this.getItem = this.getItemCache;
      this.setItem = this.setItemRaw;
    }
  }
  /**
   * @private
   * @readonly
   * json.stringify使用的空格, 当autoJson参数为true才会生效
   */
  private jsonSpace = 4;

  /**
   * @private
   * @readonly
   * 文件后缀，存储
   */
  private suffix = ".json";
  /**
   * 键值对会同步存在这里
   */
  private map = {};

  /**
   * 当autoJson为true时，键值对会同步存在这里， 值以JSON对象存储，一般用于内容搜索
   */
  private mapJson = {};

  /**
   * 获取数组形式的mapJson数据
   */
  get listJson() {
    return Object.keys(this.mapJson).map(_ => this.mapJson[_])
  }
  /**
   * 是否从map中读取数据，默认每次都读取文件
   * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
   */
  useMapCache = false;
  /**
   * 对象会创建一个proxy对象
   * 用于实现类似功能 localStorage.aa = {a: 1}
   */
  private proxy: any;

  constructor(opt: Opt) {
    if (!opt) return this;
    Object.assign(this, opt);
    if (!fs.existsSync(this.stroageDir)) {
      try {
        fs.mkdirSync(this.stroageDir);
      } catch (e) {
        throw e;
      }
    }
    if (!fs.existsSync(this.stroagePath)) {
      fs.mkdirSync(this.stroagePath);
    }
    this.setAutoJson(opt.autoJson);
    this.proxy = new Proxy(this.map, {
      get: (target, key) => {
        if (!this.autoJson) {
          return this.getItem(<string>key);
        } else {
          var v = this.getItem(<string>key);
          var handle = {
            get: (subTarget, name) => {
              var res = Reflect.get(subTarget, name);
              if (typeof res === "object") {
                return new Proxy(res, handle);
              } else {
                return res;
              }
            },
            set: (subTarget, name, value, receiver) => {
              var success = Reflect.set(subTarget, name, value, receiver);
              if (success) {
                this.setItem(key, v);
              }
              return success;
            },
            deleteProperty: (subTarget, name): boolean => {
              var res = Reflect.deleteProperty(subTarget, name);
              this.setItem(key, v);
              return res;
            },
          };
          return new Proxy(v, handle);
        }
      },
      set: (target, key, value): boolean => {
        this.setItem(key, value);
        return true;
      },
      deleteProperty: (target, key): boolean => {
        this.removeItem(key);
        return true;
      },
      getPrototypeOf: (target) => {
        return target;
      },
    });
    if (this.useMapCache) {
      this.loadStroage();
    }
    return this;
  }

  create(
    opt = <Opt> {
      stroageDir: this.stroageDir,
      namespace: this.namespace,
      autoJson: this.autoJson,
      useMapCache: this.useMapCache,
      jsonSpace: this.jsonSpace,
      suffix: this.suffix,
    },
  ) {
    if (opt.autoJson === false) {
      if (opt.suffix === undefined) {
        opt.suffix = ''
      }
    } else {
      opt.autoJson = true;
    }
    let fls = new FileLocalStroage(opt);
    return fls;
  }

  resolveItemPath(item) {
    return path.join(this.stroagePath, encodeURIComponent(item) + this.suffix);
  }
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
  setItem(item, value) {
    return this.setItemJson(item, value)
  }
  /**
   * 设置键名对应的键值
   * @param {string} item - 需要存储的键名
   * @param {string} value - 需要存储的键值
   * @returns 
   */
  setItemRaw(item, value) {
    this.map[item] = value;
    fs.writeFileSync(this.resolveItemPath(item), value.toString());
    return this;
  }
  /**
   * 设置键名对应的键值， 值会进行JSON.stringify处理
   * @param {string} item - 需要存储的键名
   * @param {object} value - 需要存储的键值
   * @returns 
   */
  setItemJson(item, value) {
    let str = JSON.stringify(value, null, this.jsonSpace)
    this.mapJson[item] = JSON.parse(str)
    return this.setItemRaw(item, str);
  }
  /**
   * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
   * @param item - 需要获取键值的键名
   * @returns 
   */
  getItem(item): any {
    return this.getItemJson(item)
  }
    /**
   * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
   * @param item - 需要获取键值的键名
   * @returns 
   */
  getItemCache(item) {
    if (this.useMapCache && this.map[item]) {
      return this.getMapItem(item)
    }
    return this.getItemRaw(item);  
  }
  /**
   * 根据键名，从当前存储对象中获取键值，从文件中获取键值，并同步到当前的map属性中
   * @param item - 需要获取键值的键名
   * @returns 
   */
  getItemRaw(item): any {
    let p = this.resolveItemPath(item);
    if (fs.existsSync(p)) {
      var str = fs.readFileSync(p, 'utf-8');
      this.map[item] = str;
      if (this.autoJson) {
        this.mapJson[item] = JSON.parse(str)
      }
      return str;
    } else {
      delete this.map[item];
      delete this.mapJson[item];
    }
  }

  /**
   * 根据键名，从当前存储对象中获取键值，并进行JSON.parse解释
   * @param item - 需要获取键值的键名
   * @returns 
   */
  getItemJson(item): any {
    var str
    if (this.useMapCache && this.map[item]) {
      str = this.getMapItem(item)
    } else {
      str = this.getItemRaw(item);
    }
    if (str) {
      return JSON.parse(str);
    }
  }
  /**
   * 根据键名，从当前存储对象中map属性获取键值
   * @param item - 需要获取键值的键名
   * @returns 
   */
  getMapItem(item) {
    if (this.map[item]) {
      if (this.autoJson) {
        return JSON.parse(this.map[item])
      }
    } else {
      return this.getItemRaw(item)
    }
  }
  /**
   * 根据键名，从当前对象中删除存储的键值，删除map中的属性，及对应的存储文件
   * @param item - 需要删除的键名
   * @returns
   */
  removeItem(item) {
    delete this.map[item];
    delete this.mapJson[item];
    let p = this.resolveItemPath(item);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
    return this;
  }
  /**
   * 获取当前存储对象的所有键名
   * @returns {string[]}
   */
  get keys(): string[] {
    return fs.readdirSync(this.stroagePath, {
      withFileTypes : true
    }).filter(_ => _.isFile()).map((_) =>{
     return decodeURIComponent(path.basename(_.name, this.suffix))
    }
    );
  }

  /**
   * 加载当前存储所有的键名，然后同步一次到当前对象的map属性
   * @returns 
   */
  loadStroage() {
    this.keys.forEach((item) => {
      this.getItemRaw(item);
    });
    return this;
  }
  /**
   * 清除当前存储所有键名，键值，map属性以及存储文件
   * @returns 
   */
  clear() {
    this.keys.forEach((item) => {
      this.removeItem(item);
    });
    return this;
  }
}

var _default = new FileLocalStroage(null);
export default _default;

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

export const create = (opt: Opt): FileLocalStroage => {
  return _default.create.apply(_default, [opt]);
};
