export declare class FileLocalStroage {
    /**
     * 存储目录
     */
    stroageDir: string;
    /**
     * 当前存储的名称
     */
    namespace: string;
    /**
     * 当前存储目录，由存储目录与当前存储名称组成
    */
    _stroagePath: string;
    __All_FILE_LOCAL_STROAGE: any;
    get stroagePath(): any;
    /**
     * 是否自动转换JSON
     */
    autoJson: boolean;
    setAutoJson(value: any): void;
    /**
     * json.stringify使用的空格
     */
    jsonSpace: number;
    /**
     * 文件后缀
     */
    suffix: string;
    /**
     * 键值对会同步存在这里
     */
    _map: {};
    get map(): {};
    /**
     * 是否从map中读取数据，默认每次都读取文件
     * 如果设置为true则判断map中是否存在信息，如果存在就不读取文件了
     */
    useMapCache: boolean;
    /**
     * 对象会创建一个proxy对象
     * 用于实现类似功能 localStorage.aa = {a: 1}
     */
    _proxy: any;
    get proxy(): any;
    constructor(opt: any);
    create(opt?: {
        stroageDir: string;
        namespace: string;
        autoJson: boolean;
        useMapCache: boolean;
        jsonSpace: number;
        suffix: string;
    }): FileLocalStroage;
    resolveItemPath(item: any): any;
    setItem(item: any, value: any): void;
    _setItem(item: any, value: any): this;
    __getItem(item: any): any;
    getItem(item: any): void;
    _getItem(item: any): any;
    _setItemJson(item: any, value: any): this;
    _getItemJson(item: any): any;
    removeItem(item: any): this;
    get keys(): any;
    loadStroage(): void;
    clear(): void;
}
declare var _default: FileLocalStroage;
export default _default;
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
