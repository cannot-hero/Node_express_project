不用node构建app的场景

需要很大量的服务端处理(super heavey server process)， 图像处理，视频转换，文件压缩类似的东西

Ruby PHP  python

# Node farm

## 15 parsing variable from URLs

```js
const { query, pathname } = url.parse(req.url, true)
```

## 16 using modules

nodejs每一个文件都被视为 a module

## 18 types of packages and installs

packages: regular dependencies & development dependencies

```js
// development dependencies
npm i nodemon --save-dev
```

```js
npm i nodemon --global
```

```js
npm run xxx
//实际上是npm执行scripts  然后从devDependencies中找可以运行相应脚本的包
```

## 19 3rd party modules
使用第三方库时多看看文档呗

## 20 package version

```js
  "dependencies": {
    "slugify": "^1.3.4"
  }
// 1 major version   huge new release, code may no longer work with previous version
// 3 minor version   new features, not including breaking changes, always be backward-compatible
// 4 patch version   fix bug
```



```js
// 查有没有需要更新的包
npm outdated
// 更新某一个包
npm update xxx
```

## 22 recap

```js
//readfiles
//writefiles
//require core modules
//require third party modules
```

# Introduction to backend web development

## Overview

```txt
https://www.google.com/maps
protocol    domain name  resource
    👇 DNS
https://216.58.211.206:443
protocol  IP address    Port number
	👇 TCP/IP socket connection between browser and server
	👇
	HTTP REQUEST
including: start line  method + request target + HTTP version
			HTTP request headers
			request body(only when sending data to server)
	👇
	HTTP RESPONSE
including: start line HTTP version + status code + status message 
			HTTP response headers
			request body
	👇
	index.html is the first to be loaded
	scanned for assets: JS CSS images(process is repeated for each file)
```

### TCP/IP

TCP用于分解请求(break out requests of small chunks called packets)为包

IP用于发包(send and route all of these packedts through internet)

## 27 dynamic websites

数据库连同一个预定的模板，基于数据库的数据来构建用户动态请求的每一个页面

然后将该页面构建成HTML、CSS和JS文件，再发送回浏览器

上述过程又被称为服务端渲染(server-side rendering, SSR)



API Powerd web 称为客户端渲染(client-side rendering) 

for back-end developers, it's far easier to just build an API， let front-end people to build a site.

## 29 How Node works

**V8** 将代码变成计算机可以运行的语言

**libuv** 实现事件循环，线程池(thread pool)

事件循环用于处理简单的任务，例如执行回调和网络IO

线程池用于更繁重的工作  文件访问或压缩

**http-parser**

**c-ares **  DNS

**OpenSSL** 保存记录

**zlib**  用于压缩

## 30 process threads, threads pool

进程 线程 线程池

node单线程

初始化程序--->执行顶层代码---->require modules---->注册事件回调---->开始事件循环



有些任务太复杂(heavy and expensive)无法在事件循环中进行，会阻塞整个单线程，因而需要线程池(libuv提供)



将复杂任务offload到线程池(处理文件的操作dealing with files)

file system api, cryptography(例如缓存密码), compression. DNS lookups

## 31 事件循环

事件循环接收事件，每次有重要的事情发生就会调用必要的回调

> 事件循环进行编排(orchestration)，接收事件，调用其回调函数，并将更昂贵的任务卸载到线程池

事件循环顺序

phase1　过期计时器的回调  expired timer callbacks

phase2    I/O 轮询和I/O回调执行  I/P polling and execution of I/O callbacks (Node中I/O主要指网络和文件访问)

phase 3   setImmediate回调(特殊计时器)，如果想立即处理回调（after I/O轮询和执行阶段），可以用这个

phase 4  close callbacks （web 服务器或websocket关闭时）



nextTIck() queue and other microtask queue 会在每一个phase中间自动执行



如何退出？

Node会检查是否有计时器或仍在后台运行的I/O任务(any pending timer or I/O task)，如果没有，则会退出(exit program)，如果有则会进入下一个tick



**dont block the event loop**

> 1 dont use sync versions of function in fs, crypto and zlib modules in callback functions
>
> 2 dont perform complex calculations (e.g. loops inside loops)
>
> 3 Be careful with JSON in large objects (maybe need long time to sringify JSON)
>
> 4 dont use too complex regular expressions(e.g. nested queantifiers)



nextTick发生在下一个循环阶段之前(next loop phase)，而不是整个tick之后

setImmediate在每个tick执行一次，并非立即执行，nextTick会立即执行

## 33 事件和事件驱动架构

观察者模式 

更加解耦(more de-coupled)

对于同一事件更直接的做出多次反应(react multiple times)，设置多个监听器即可



## 35 introduction to streams

with streams we can process meaning read and write data piece by piece without completing the whole read or write operation.

therefore we dont have to keep all the data in memory.

e.g. 

读取文件时，先读取部分数据，然后做一些事，然后释放内存，重复，直到整个文件读取完毕

👉 perfect for handling large volumes of data, for example videos.

👉 内存方面更高效

Nodejs中

streams是EventEmitter的实例，以为这所有的流都可以emit和listen



> ​				description						example			important events			important function
>
> 可读流	read(comsume) data		http request		data								pipe()
>
> ​															 fs read				  end								 read()
>
> 可写流	可写入								http response        drain								write
>
> ​															fs write streams	finish								end
>
> 双工流   可读且可写						net web socket
>
> 转换流   可读且可写						zlib

背压backpressure 磁盘数据读取速度大于对这些传入数据的处理速度



这里是响应无法像接收数据一样快的发送数据

## 37 modules

```js
// 导出单变量的东西用module.exports  class or one function
module.exports = Calculator
// use exports to export multiple named variables
exports.add = (a, b) => a + b
```

## 50 API and RESTFUL API

restful api

> 1 seperate API into logical resource
>
> 2 these resources should be exposed 结构化  expose structured resource-based URLs
>
> 3 use HTTP method
>
>  only resources (nouns) and use HTTP methods for actions 
>
> 4 send data as JSON
>
> 5 stateless all state is handled on the client, not on the server



## 52 handling post request

restful api中，不指定id，数据库会配相应的id

## 53 responding to URL Parameters

定义一个可以接收变量的路由

```js
app.use(express.json()) // 可以获取请求体
...
// '/api/v1/tours/:id' url中对应内容赋值给:id
// 路徑中一定要有對應參數，不然會報錯
// '/api/v1/tours/:id/:y?' 加一個問號，讓參數變爲可選參數
app.get('/api/v1/tours/:id', (req, res) => {
	console.log(req.params)
	const id = req.params.id * 1
	const tour = tours.find((el) => el.id === id)
	// if (id > tours.length) {
	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		})
	}

	res.status(200).json({
		status: 'success',
		// results: tours.length,
		data: {
			tour,
		},
	})
})
```

201 創建成功

204 沒有内容



## 57 中間件 request-response cycle

middleware could manipulate the request or the response object, usually is mostly about the request.



request response cycle: request --> middleware stack --> sending response



中間件在代碼中的位置很重要

通常定義全局中間件在所有的路由處理程序之前



## 62 create and mount mutiply routers

```js
const tourRouter = express.Router()
const userRouter = express.Router()

tourRouter.route('/').get(getAllTours).post(createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

userRouter.route('/').get(getAllusers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

// mounting the router
// tourRoute only runs on '/api/v1/tours'
app.use('/api/v1/tours', tourRouter) // 在‘/api/v1/tours’route上使用tourRouter
app.use('/api/v1/users', userRouter) // 在‘/api/v1/tours’route上使用tourRouters
```



## 62 better file structure

create不同的路由器 让每一个资源和关注点分离



app.js 入口文件通常用于中间件的声明



model view controller

MVC 处理函数称为controller

把express相关的放在一个文件，server相关的放在一个文件
