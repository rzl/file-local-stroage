/**
 * 一个使用目录与文件作为存储结构的存储类，它提供与浏览器localstorage相似的方法函数对是数据进行操作，
 * 存储API的存储接口提供对本地存储的访问。例如，它允许添加、修改或删除存储的数据项。
 * @interface [Opt]
 * @constructor
 */
export declare class FileLocalStroage {
    /**
     * @private
     * @readonly
     * {@link Opt.stroageDir}
     * 存储目录
     */
    private stroageDir;
    /**
     * @private
     * @readonly
     * @ignore
     * 当前存储的名称
     */
    private namespace;
    /**
     * 当前存储目录，由存储目录与当前存储名称组成
     */
    get stroagePath(): any;
    /**
     * @private
     * @readonly
     * @ignore
     * 是否自动转换JSON，默认为true，对数据进行JSON.stringify操作
     */
    private autoJson;
    /**
     * @ignore
     * @param value
     */
    private setAutoJson;
    /**
     * @private
     * @readonly
     * json.stringify使用的空格, 当autoJson参数为true才会生效
     */
    private jsonSpace;
    /**
     * @private
     * @readonly
     * 文件后缀，存储
     */
    private suffix;
    /**
     * 键值对会同步存在这里
     */
    private map;
    /**
     * 当autoJson为true时，键值对会同步存在这里， 值以JSON对象存储，一般用于内容搜索
     */
    private mapJson;
    /**
     * 获取数组形式的mapJson数据
     */
    get listJson(): any[];
    /**
     * 是否从map中读取数据，默认每次都读取文件
     * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
     */
    useMapCache: boolean;
    /**
     * 对象会创建一个proxy对象
     * 用于实现类似功能 localStorage.aa = {a: 1}
     */
    private proxy;
    constructor(opt: Opt);
    create(opt?: Opt): FileLocalStroage;
    resolveItemPath(item: any): any;
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
    setItem(item: any, value: any): this;
    /**
     * 设置键名对应的键值
     * @param {string} item - 需要存储的键名
     * @param {string} value - 需要存储的键值
     * @returns
     */
    setItemRaw(item: any, value: any): this;
    /**
     * 设置键名对应的键值， 值会进行JSON.stringify处理
     * @param {string} item - 需要存储的键名
     * @param {object} value - 需要存储的键值
     * @returns
     */
    setItemJson(item: any, value: any): this;
    /**
     * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
     * @param item - 需要获取键值的键名
     * @returns
     */
    getItem(item: any): any;
    /**
   * 根据键名，从当前存储对象中获取键值， 如果useMapCache为true从属性map中读取键值，否则从存储文件中读取值
   * @param item - 需要获取键值的键名
   * @returns
   */
    getItemCache(item: any): any;
    /**
     * 根据键名，从当前存储对象中获取键值，从文件中获取键值，并同步到当前的map属性中
     * @param item - 需要获取键值的键名
     * @returns
     */
    getItemRaw(item: any): any;
    /**
     * 根据键名，从当前存储对象中获取键值，并进行JSON.parse解释
     * @param item - 需要获取键值的键名
     * @returns
     */
    getItemJson(item: any): any;
    /**
     * 根据键名，从当前存储对象中map属性获取键值
     * @param item - 需要获取键值的键名
     * @returns
     */
    getMapItem(item: any): any;
    /**
     * 根据键名，从当前对象中删除存储的键值，删除map中的属性，及对应的存储文件
     * @param item - 需要删除的键名
     * @returns
     */
    removeItem(item: any): this;
    /**
     * 获取当前存储对象的所有键名
     * @returns {string[]}
     */
    get keys(): string[];
    /**
     * 加载当前存储所有的键名，然后同步一次到当前对象的map属性
     * @returns
     */
    loadStroage(): this;
    /**
     * 清除当前存储所有键名，键值，map属性以及存储文件
     * @returns
     */
    clear(): this;
}
declare var _default: FileLocalStroage;
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
export declare const create: (opt: Opt) => FileLocalStroage;
