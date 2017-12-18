N-Thrift
---
English document is being prepared

## 简介
`n-thrift` 是 Apache Thrift 的一个 nodejs 的实现，包含了 thrift compiler 和运行类库，相较于官方维护的 `thrift`, `n-thrift` 具有以下特点：

1. 支持出参和入参自动实例化
2. 支持es2016+，支持map、set等数据结构，支持服务端客户端都使用Promise
3. 支持namespace，生成文件添加index.js文件，可以极为方便的发布到私有库
4. 灵活配置，支持i64默认转换为string
5. 支持esm，支持生成.mjs文件
6. 支持struct field编码风格，如thrift定义风格为snakeCase，可以选择编译为camelCase，node端返回的都是camelCase的数据


## 安装

```bash
npm i n-thrift -S
```
全局安装
```bash
npm i n-thrift -g
```

## 使用

### 定义thrift文件 tutorial.thrift

```thrift
namespace js test

struct Result {
  1:string name;
}

struct Request {
  1:string some;
}

service MyService {
  Result hello(1:Request request)
}

```

### 编译

```bash
n-thrift <thriftFileDir> [options]
//项目内安装用npx
npx n-thrift <thriftFileDir> [options]
```
如
```bash
node-thrift ./thrift -o lib -e mjs -m esm
```
options

| 配置项      | 简写 | 默认      | 描述                                        |
| ----------- | ---- | --------- | ------------------------------------------- |
| --out       | -o   | '.'       | 输出文件路径                               |
| --module    | -m   | 'cjs'     | js模块方式，支持`cjs`和`esm`               |
| --extname   | -e   | 'js'      | 生成文件后缀                                |
| --fieldcase | -fc  | 'default' | field代码风格，支持`camelCase`和`snakeCase` |

### 服务端

```js
const nThrift = require('n-thrift');
const thriftType = require('./lib');

const { MyServiceServer } = thriftType.test.tutorial

class MyService extends MyServiceServer {
  async hello(request){
    //do something
    return { name: request.some };
  }
}

const server = nThrift.createServer(MyService);
server.listen(9090);
```

### 客户端
```js
const nThrift = require('n-thrift');
const thriftType = require('./lib');

const { MyServiceClient } = thriftType.test.tutorial
const connection = nThrift.createConnection('localhost', 9090)
const myService = nThrift.createClient(MyServiceClient, connection);

myService.hello({some:'hello'}).then(result => {
  console.log(result.name) // 'hello'
})

//可以在异步方法中使用
async function someFunc(){
  const result = await myService.hello({some:'world'});
  console.log(result.name) // 'world'
}
```