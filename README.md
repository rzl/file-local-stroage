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
    // 存储的目录下的空间，因为可以有多个空间，可以理解为二级目录
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
# 会产生下面目录结构的文件
![img](data:image/png;base64,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)

## 测试读取存储

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