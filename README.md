# 一个类似浏览器local Storage功能的模块
## 只支持键值对保存, 常用方法
### 根据key获取值   fls.getItem('item')
### 存储一个键值对   fls.setItem('item1', {item : 'aaa'})
### 删除一个键的数据 fls.removeItem('item')

#

### 下面是存储的示例代码
```js
var fls= require('file-local-stroage').create({
    // 存储的目录
    stroageDir: 'file-local-stroage-cache',
    // 存储的目录下的空间
    namespace: 'default',
    // 是否自动转换json数据，开启会自动对值进行JSON.stringify处理
    autoJson: true,
    // 是否使用缓存 如果使用缓存 默认不使用缓存 每次读取文件数据
    useMapCache: false,
    // 转换JSON数据是 缩进空格数量
    jsonSpace: 4
})

// 存储一个键值对
fls.setItem('item1', {item : 'aaa'})

// 根据key获取值
var item1 = fls.getItem('item1')
console.log(item1)

// 删除一个键的数据
//fls.removeItem('item1')

// 使用proxy模式
p = fls.proxy

// 设置一个键值对
p.a = { a: 'aa'}
// 根据key获取值
console.log(p.a)

p.b = { b: 'bb'}
console.log(p.b)

//  删除一个键值对
//  delete p.b

//  清楚当前存储空间所以数据
//  fls.clear()


```

## 测试读书存储

```js
var fls= require('file-local-stroage').create({
    // 存储的目录
    stroageDir: 'file-local-stroage-cache',
    // 存储的目录下的空间
    namespace: 'default',
    // 是否自动转换json数据，开启会自动对值进行JSON.stringify处理
    autoJson: true,
    // 是否使用缓存 如果使用缓存 默认不使用缓存 每次读取文件数据
    useMapCache: false,
    // 转换JSON数据是 缩进空格数量
    jsonSpace: 4
})

// 存储一个键值对
//fls.setItem('item1', {item : 'aaa'})

// 根据key获取值
var item1 = fls.getItem('item1')
console.log(item1)

// 删除一个键的数据
//fls.removeItem('item1')

// 使用proxy模式
p = fls.proxy

// 设置一个键值对
//p.a = { a: 'aa'}
// 根据key获取值
console.log(p.a)

//p.b = { b: 'bb'}
console.log(p.b)

// 删除一个键值对
//delete p.b

// 清楚当前存储空间所以数据
//  fls.clear()


```