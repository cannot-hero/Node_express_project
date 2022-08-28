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



## 63 param middleware

```js
const router = express.Router()

router.param('id', (req, res, next, val) => {
	console.log(`Tour id is ${id}`)
	next()
})
```

每一个路由都是一个mini  sub-application one for each resource

```js
// 检查ID是否超限
exports.checkID = (req, res, next, val) => {
	console.log(`Tour id is ${val}`)
	if (req.params.id * 1 > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		})
	}
	next()
}
```

express的思想， 应该尽量用中间件，所以这里用了

```router.param('id', callback(req,res,next,val))```

## 64 chaining multiple middleware functions



## 65 静态文件托管

静态文件：目前无法用所有路径访问的文件  from folder not from route

如果想用浏览器访问文件，就得用express中间件

```js
// 静态文件托管  托管public下的文件
app.use(express.static(`${__dirname}/public`))
```

## 69 MONGODB



> DATABASE  ----  COLLECTIONS (TABLE)  -----DOCUMENTS(ROWS)
>
> ​                             blog / users / reviews             post user review

一个数据库可以包含一个或多个集合

每个集合可以包含一个或多个文档

in a relationship database, a document would be a row in a table

each document contains the data about one single entity（包含一个单一实体，一篇博文，一个用户或一个评论）



mongodb将数据存在文档中 而不是像传统数据库中一行 （NoSQL）

用数据填充之前，不需要定义文档数据模式(schema)



```sql
use natours-test       //切换到某一数据库
db.tours.insertMany([{name:"sea explorer",rating:4.2,price:4.7},{name:"Snow advancer", price:999, rating:4.6}])  // 插入多条
db.tours.find()
show dbs
show collections  // 展示集合 
// find
db.tour.find({name:"snow"})
db.tour.find({price:{$lte:500}}) // lte  less than or equal
db.tour.find({price:{$lte:500}, rating:{$gt:3}})
db.tour.find({$or:[{price:{$lte:500}}, {rating:{$gt:3}}]})
// update  先找到要更新的document  然后修改对应属性
db.tour.updateOne({name:"snow"},{$set:{price:999}}) // 只会更新第一个匹配到的
db.tour.updateMany({price:{$gt:500}},{rating:{$gt:4.5}},{$set:{premium: true}})
db.tour.deleteMany({rating: {$lt:4.0}})
db.tour.deleteMany({}) // 全删咯
```

## 82 Mongoose

mongoose schema是数据进行建模的地方，描述数据结构，默认值和验证

mongoose model  允许对数据库创建删除更新 crud



mongoose is all about models, 模型就像蓝图 用于创建文档

```js
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name!'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
})
const Tour = mongoose.model('Tour', tourSchema)
```

## 85 MVC架构 architecture

> model business logic (concern about everything about applicaition data) 数据库， 模型
>
> view  presentation logic (handle applications request, interact with models, and send back responses to the client)
>
> controller  application logic （视图层基本上由用于生成视图的模板）

FAT models THIN controller



模型定义好之后用在controller中

## 87 create document

method 1

```js
const tour = new Tour({})
tour.save()
```

method 2

```js
Tour.create({}).then()
```

aync await 配合 try catch

try  先根据req在数据库中创建相应的document，然后将创建后的东西返回给res

catch 进行错误捕获

```js
exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save()
        // 写入数据库
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
```

## 88 reading documents

sorting paginations

```js
exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        // Tour.findOne({_id:req.params.id})
        res.status(200).json({
            status: 'success',
            // results: tours.length,
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}
```

## 89 updating documents

```js
exports.updateTour = async (req, res) => {
    try {
        // 先找到对应document，然后在做修改              id          对应的修改
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // 返回更新后的值
            // 重新验证
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
```

## 90 delete

```js
exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
```

## 96 sorting

find返回的其实是一个query

```js
        let query = Tour.find(JSON.parse(queryStr))
        // {difficulty : 'easy', duration:{$gte : 5}}
        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
            // second criteria  query.sort('price ratingsAverage')
        } else {
            // 默认排序
            query = query.sort('-createAt')
        }
        // EXCUTE QUERY
        const tours = await query
```

## 97 字段限制 limiting fields

可以在schema中进行限制

```js
const tourSchema = new mongoose.Schema({
        createAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
})
```

在tourController中进行限制

```js
// 3) Field limit
if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ')
    query = query.select(fields)
} else {
    query = query.select('-__v')
}
// EXCUTE QUERY
const tours = await query
```

## 97 pagination 

```js
// 4) pagination
const page = req.query.page * 1 || 1
const limit = req.query.limit * 1 || 100
const skip = (page - 1) * limit
// page=2&limit=10  1-10 page 1 11-20 page 2
query = query.skip(skip).limit(limit)
// 判断是否请求超出
if (req.query.page) {
    const numTours = await Tour.countDocuments()
    if (skip >= numTours) throw new Error('This page does not exist')
}
// query.sort().select().skip().limit()
```

## 98 aliasing

利用中间件，实现功能的复用

```js
// tourController.js
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}
//server.js                       中间件的链式调用
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
```

## 99 refactoring

class

```js
class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const queryObj = { ...this.queryString }
        const excludeFields = ['page', 'limit', 'sort', 'fields']
        excludeFields.forEach(el => delete queryObj[el])
        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        ) // 正则表达式
        // console.log(JSON.parse(queryStr))
        this.query.find(JSON.parse(queryStr))
        // let query = Tour.find(JSON.parse(queryStr))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
            // second criteria  query.sort('price ratingsAverage')
        } else {
            // 默认排序
            this.query = this.query.sort('-createAt')
        }
        return this
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit
        // page=2&limit=10  1-10 page 1 11-20 page 2
        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}

module.exports = APIFeatures

```

## 100 mongoDB aggregation pipeline

数据聚合

先match 再分组 再发送

```js
exports.getTourStats = async (req, res) => {
    try {
        // aggregate输入一个pipeline的[]
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' }, // 声明根据什么字段进行分组
                    numTours: { $sum: 1 }, //相当于计数器，每经过这个管道就 + 1
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}
```





aggregate operator 

> Operator expressions are similar to functions that take arguments. In general, these expressions take an array of arguments and have the following form:

```sql
{ <operator>: [ <argument1>, <argument2> ... ] }
```

> If operator accepts a single argument, you can omit the outer array designating the argument list:

```sql
{ <operator>: <argument> }
```

## 102  Virtual properties

虚拟属性，可以定义在schema中，但是不会被保存在数据库中

不会持久在数据库中，只有获得数据后它才会出现

对于可以相互派生的字段（英里 -> 公里），



虚拟属性不能用在query中，因为虚拟属性不是数据库的一部分



业务逻辑和程序逻辑要尽可能分开

Fat models thin controllers

模型中有尽量多的业务逻辑

控制器中业务逻辑尽量少

```js
// Schema 不仅可以传入相关定义， 也可以传schema的配置对象
const tourSchema = new mongoose.Schema({
    
},{
    // schema的配置对象 toJSON是指数据以JSON传出时 使用virtuals
    // 使用Object输出时，适用virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// get 相当于定义了一个getter  getter不能用箭头函数(arrow function)，因为要用到this regular function
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})
```



## 103 Mongoose中间件

四种类型 ducument, query, aggregate and model middleware

### document middleware

act on the current processed document

可以定义函数在某个事件前后

```js
// document middleware: runs before .save() and .create
tourSchema.pre('save', function(next) {
    // this 指向当前处理的文件
    this.slug = slugify(this.name, { lower: true })
    next()
})

tourSchema.pre('save', function(next) {
    console.log('Will save documents ...')
    next()
})
// 可以访问到刚刚保存到数据库的document
tourSchema.post('save', function(doc, next) {
    //post middleware functions are excuted after the pre middleware functions are completed
    console.log(doc)
    next()
})
```

### query middleware

```js
// QUERY MIDDLEWARE
// this middleware 适用于find 不适用于findOne
// tourSchema.pre('find', function(next) {
// 用正则表达式来匹配find开头的
tourSchema.pre(/^find/, function(next) {
    // this will point to current query, not current document
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    // 让通过查询的都是普通查询
    next()
})

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Quert took ${Date.now() - this.start} milliseconds`)
    console.log(docs)
    next()
})
```

### aggregate middleware

```js
// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    // 过滤掉secret tour  只需再添加一个match stage pipeline()返回一个数组
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    // this point to the current aggregation object
    console.log(this.pipeline())
    next()
})
```

## 106 validation

### built in validators

1. 字段格式是否正确
2. 避免恶意代码

参考

> https://mongoosejs.com/docs/validation.html

### custom validators

function return true or false



## 109 错误处理

ndb

## 110 unhandled route

```js
app.use('/api/v1/tours', tourRouter) // 在‘/api/v1/tours’route上使用tourRouter
app.use('/api/v1/users', userRouter) // 在‘/api/v1/tours’route上使用tourRouter
// 上面两个路由都没匹配到的话 就到下面这个路由
// .all could run all the verbs in HTTP methods
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server !`
    })
})
```

## 111 error handling with express

error types

operational errors:problems that we can predict will happen at some point

依赖用户操作，系统，网络

programming errors

开发错误



谈论express可以处理的错误主要是指operational errors，因而用错误处理中间件

the goal is all these errors end up in one central error handling middleware.

global error handling middleware allows a nice seperarion of concerns.

## 112 implement a global error handling middleware

全局错误捕获在app.js中完成

```js
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server !`
    // })
    const err = new Error(`Can't find ${req.originalUrl} on this server !`)
    err.status = 'fail'
    err.statusCode = 404
    // 传递东西给next 他会假设是一个错误，会跳过中间件所有的其他中间件堆栈
    // 并发送我们传入的错误到全局错误处理中间件
    next(err)
})
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
})
```

## 114 catch error in async functions

try catch一直在重复

将try catch放在更高级的层次上（另外一个函数中），使用了闭包

```js
// 闭包
module.exports = fn => {
    return (req, res, next) => {
        // 因为async函数返回一个Promise可以用catch
        fn(req, res, next).catch(next)
    }
}
```

## 115 添加404错误

```js
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    // 通过发了一个假id 发现await 返回值为null
    if (!tour) {
        return next(new AppError('No tour could find with this ID', 404))
    }
    // Tour.findOne({_id:req.params.id})
    res.status(200).json({
        status: 'success',
        // results: tours.length,
        data: {
            tour
        }
    })
})
```

## 116 error controller errs during production vs errs during development



## 118 处理用户操作失误

cast error

```js
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`
    return new AppError(message, 400)
}
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    // 根据开发环境和生产环境产生不同报错
    if (process.env.NODE_ENV === 'development') {
        // console.log(err)
        sendErrDevelopment(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        // a hard copy
        // let error = { ...err }
        let error = JSON.parse(JSON.stringify(err))
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error)
        }
        sendErrProduction(error, res)
    }
}
```

对象的扩展运算符，只会返回参数对象自身的、可枚举的属性，这一点要特别小心，尤其是用于类的实例对象时。”继承的message在原型上，所有并不能由解构赋值



## 处理duplicate错误

```js
const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name
    console.log(value)
    const message = `Duplicate field value: ${value}, please use another one!`
    return new AppError(message, 400)
}


        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        sendErrProduction(error, res)
```

## validation error

```js
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    console.log(errors)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error)
        }
        sendErrProduction(error, res)
```

## express 之外的报错

handle unhandled rejections!

事件处理

```js
// last safety net for asynchronous code
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION 🥵, shutting down...')
    // 1 stands for uncaught exception 0 stands for success
    // process.exit()会立即中断所有请求 running or pending
    server.close(() => {
        process.exit(1)
    })
})
```



```js
// 同步代码的错误捕获
process.on('uncaughtException', err => {
    console.log('UNHANDLED EXCEPTION 🥵, shutting down...')
    console.log(err.name, err.message)
    // 1 stands for uncaught exception 0 stands for success
    // process.exit()会立即中断所有请求 running or pending
    process.exit(1)
})
```



# 登录和安全 身份验证，授权，安全

Authentication authorization and security

JSON Web token

## 123 modeling users

user sign up, logging in and access pages or routes



## 125 密码管理

数据库中进行密码管理，password = confirmPassword

encrypt the password in the database

在模型中直接加密（fat models, thin controllers）

```js
userSchema.pre('save', async function(next) {
    // when the password is changed or created
    if (!this.isModified('password')) return next()
    // hash the password with cost of 12, hash is a async version
    this.password = await bcrypt.hash(this.password, 12)
    // 加密之后删除确认密码字段, passwordConfirm只是一个需要输入的字段，但不需要持久化保存在数据库中
    this.passwordConfirm = undefined
    next()
})
```

## ⭐126 json web token JWT 

Json web token is a stateless solution for authentication.

there is no need to store any session state on the server.



s1 用户首先发送一个post请求(post /login {email,password})，

s2 Server应用程序检查用户是否存在，以及密码是否正确，创建一个JWT(if user&&password create unique token)，然后存储在server上

s3 server将JWT返回给客户端，

s4 客户端将JWT存储在cookie或本地存储中。 这样用户通过了身份验证，并且没有在服务器上留下任何状态，服务端并不知道哪些用户实际登录了(stateless)，但是用户自己知道。

s5 之后用户想要访问某些路径时（GET /someProtectedRoute），将其jwt连同请求一起发送（类似于出示护照才能进入）

s6 if valid JWT, allow access.

s7 客户端返回相应权限的data



JWT要配合https使用



> JWT three parts
>
> 1 headers  metadata about the token itself
>
> 2 payload the data that we can encode into the token(前两部分只能被编码，但不能被加密，we cant store sensitive data in here)
>
> 3 signature (use headers, payloads and secret to create the unique signature),然后headers payload和signature共同构成JWT， 发送给客户端



服务器在接收到JWT时，要检查JWT有没有被篡改（header payload），检查方法为通过payload和header，secret再生成一个test signature，与JWT自带的signature对比，相同则说明未被篡改



## 127 signing up users

> jwt.io  可以做jwt debugger

```js
exports.signup = catchAsync(async (req, res, next) => {
    // 避免用户的手动注入，所以要吧req.body的对应内容提取出来
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    // payload(object)是想要存储在toekn里的数据,secret用HSA-256加密。secret至少32charcator
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
    // 注册时不用验证密码和邮箱
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})
```

## 128 logging in 

```js
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    // 1) email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    // 2) user exist and the password is correct
    // password 设置select为false
    const user = await User.findOne({ email: email }).select('+password')
    // 如果没有user 则下面这一行没办法跑 因为 null.password
    // const correct = await user.correctPassword(password,user.password)
    if (!user || !(await user.correctPassword(password, user.password))) {
        // 401 未授权
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) if everything is ok, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})
```

## 129 protecting tour routes

login --> access

使用jwt就是为了让用户访问受保护的路由（路由权限）

getAllTours route只允许用户进行访问，就是在调用该路由前要检查用户是否登录





利用middleware

```js
// 路由权限
exports.protect = catchAsync(async (req, res, next) => {
    // 1 getting token and check of it's there
    // 一般是把token放在http请求头
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
    }
    // console.log(token)
    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        )
    }
    // 2 verification the token is expire
    // 因为想在验证完之后执行回调，所以是异步的   解析出token上的payload
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decode)
    // 3 check if user still exist
    const currentUser = await User.findById(decode.id)
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token does not exist', 401)
        )
    }
    // 4 check the user changed password after the jwt issued
    if (currentUser.changePasswordAfter(decode.iat)) {
        return next(
            new AppError('User password has changed! Please login again!', 401)
        )
    }
    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = currentUser
    next()
})

```

## 130 postman 高级用法

```js
// postman test里有参考语句
pm.environment.set("jwt", pm.response.json().token);
```

## 131 authorization permission and roles

permission to delete

```js
// 权限和角色管理
// ...roles 会创建一个数组
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin','lead-guide']  role = 'user' user不在roles数组中，则无此权限
        if (!roles.includes(req.user.role)) {
            // 403 forbidden
            return next(
                new AppError(
                    'You dont have the permission to perform this action!',
                    403
                )
            )
        }
        next()
    }
}
```

## 132 忘记密码 重置密码 思路

用户发送请求到忘记密码route，会创建一个（随机）reset token，将其发送到email地址



emial发送该token和新密码 用于更新密码

```js
// 忘记密码和重置密码
exports.forgetPassword = catchAsync(async (req, res, next) => {
    // 1 get user based on posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('This email does not have a user!', 404))
    }
    // 2 generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    // 3 send it to user's email
    // 发送原始的token，而不是加密后的
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forget your password? Submit a patch request with your new password and passwordconfirm to : ${resetURL} \n if you dont forget your password, please ignore this email`
    try {
        await sendEmail({
            email: req.body.email,
            subject: 'Your reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token send to email!'
        })
    } catch (err) {
        // 如果出错就重置token和expires属性
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        // this only modifies the data, doesnt really save it
        await user.save({ validateBeforeSave: false })
        return next(
            new AppError('There was an error sending email, try it later!'),
            500
        )
    }
})
```



## 134 发送邮件

nodemailer

```js
const nodemailer = require('nodemailer')

const sendMail = async options => {
    // 1 create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // 2 define the email options
    const mailOptions = {
        from: 'Ma shu <hello@foxmail.com>',
        // options.email 说明传入的参数是一个对象
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    }
    // 3 actually send the email
    // 👇 async function
    await transporter.sendMail(mailOptions)
}

module.exports = sendMail
```

## 135 忘记密码 重置密码 函数

```js
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1 Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')
    // 找到user同时检查token是否过期
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    // 2 If token is not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 404))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    // 此处不关闭验证， 因为真的想验证
    await user.save()
    // 3  update changePasswordAt property for the user

    // 4 Log the user in, send the JWT to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})
```

第三部分在model中完成

```js
userSchema.pre('save', function(next) {
    // 如果没有修改或密码或者是新创建用户
    if (!this.isModified('password') || this.isNew) return next()
    // 有时保存到数据库会比发送JWT慢一些，使修改密码的时间戳比JWT创建的时间戳晚
    // 减一秒确保修改密码的时间戳在发送JWT之前
    this.passwordChangedAt = Date.now() - 1000
    next()
})
```

## 136 修改密码

```js
exports.updatePassword = catchAsync(async (req, res, next) => {
    // only for logged users
    // 1 Get user from collection
    // 因为是登录的情况下才能修改密码。所以是有经过protect中间件的
    const user = await User.findById(req.user.id).select('+password')
    // 2 Check if POSTed current password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Your current password is wrong!', 401))
    }
    // 3 If so, update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    // 不使用findByIdAndUpdate() 关于密码不要使用有关update的api
    // 4 Log user in, send JWT
    createSendToken(user, 200, res)
})
```

```js
// 只有登录后才能修改密码
router.patch(
    '/updateMyPassword',
    authController.protect,
    authController.updatePassword
)
```

## 137 修改个人信息

```js
// 更新用户个人信息
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1 throw an error if user POSTs password
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password update. Please use updateMyPassword.',
                400 // bad request
            )
        )
    }
    // 2 Filter the unwanted flieds in req.body
    const filterBody = filterObj(req.body, 'name', 'email')
    // 3 Update user document
    // 因为是和密码无关的，所以可以用 findByIdAndUpdate {new:true}表示返回更新后的对象
    // x 是将req.body中属性做了filter之后的
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        user: updateUser
    })
})
```

```js
// 剩余字段会成一个数组
const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    // 遍历对象
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}
```

```js
router.patch('/updateMe', authController.protect, userController.updateMe)
```

## 138 用户注销

实际没有从数据库中删除该用户，而是将账号设置为非活动状态

```js
// query middleware 只查找活跃用户  以find开头的
userSchema.pre(/^find/, function(next) {
    // this point to current query
    this.find({ active: { $ne: false } })
    next()
})
```

```js
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})
```

```js
router.delete('/deleteMe', authController.protect, userController.deleteMe)
```

## 139 ⭐security

> 1 数据库受损：他人获得数据库权限

必须始终加密密码和重置token

> 2 蛮力攻击：尝试猜密码

让登录请求变慢  bcrypt包就是这样做的

实施速率限制，限制来自一个ip的请求数量

限制每个用户尝试登录的次数

> 3 跨站脚本攻击 XSS cross-site scripting attack

注入恶意代码， 它允许攻击者读取本地存储，所以不要吧JWT放在local storage，应该放在cookie中

这使得浏览器可以只接收和发送cookie，不能以任何方式访问和修改它

方法：对用户的输入做处理并设置一些特殊的HTTP请求头

> 4 拒绝服务攻击 denial-of-service DOS attack

对用户的输入做处理

> 其他建议

1 使用https发请求

2 始终创建随机token，而不是根据日期什么的来生成

3 修改密码后 token不在有效

4 env文件不要用git托管

5 不要把整个错误发送客户端

6 csurf包 应对跨站点请求伪造 cross-site request forgery

7 在执行高价值操作之前进行身份验证

8 token 黑名单

9 refresh token

10 two factor authentication 两因素身份验证 （验证码，或手机短信）

防止参数污染

## 140 sending token via cookie

浏览器会自动存储其接收到的cookie 并且在将来对服务器的请求中发送该cookie

js中指定日期时，要用new Date()

在最终发响应的时候加

```js
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    // 配置cookie
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // cookie只会被发送在加密连接上
        // secure:true,
        // 浏览器不能以任何方式访问和修改，防止跨站脚本攻击
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions)

    // remove password from output
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}
```

## 141 rating limit （rate limiter） 

防止同一个ip向api发送太多请求

防止brute attack

rate limiter ----count the request number of the requests coming from one IP

借助express-rate-limit



```js
const limiter = rateLimit({
    // 一小时内只能访问100次
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests in this IP, please try in an hour!'
})
// 全局限制
app.use('/api', limiter)
```

响应头会多出两个属性，程序重新运行后这些都会再次刷新

```
X-RateLimit-Limit
X-RateLimit-Remaining
```

报错时 429  Too many request

## 142 setting security http headers

helmet

```js
// 1. Global MIDDLEWARE
// Set security HTTP headers helmet会直接返回一个函数
app.use(helmet())
```

res.body  新增

X-DNS-Prefetch-Control

Strict-Transport-Security

X-Download-Options

X-XSS-Protection



## 143 用户输入处理

nosql injection

```sql
{"$gt":""}
可以让只知道密码也可以登录
```

```
express-mongo-sanitize
xss
```



## 144 http parameter pollution

hpp package

白名单

```js
//prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
)
```

# modeling data and advanced monggose

## 146  ⭐ DATA MODELING

将非结构化数据转化为的结构化数据的过程

Our goal with data modeling is to structure the unstruct data into a logical way. To reflecting the real-world relationships that exists between some data sets

> STEP
>
> STEP1  Different types of relationships between data
>
> STEP2 引用/规范化(referencing or normalization) vs 嵌入或非规范化(embedding or denormalization)
>
> STEP3 Embedding or reference to other documents based on a coupled of different factors
>
> STEP4 type of referencing



> different types of relationships
>
> 一对一 ：一个字段只有一个值  电影只有一个电影名
>
> 一对多 ： ont to few, one to many, one to a ton or to a million（关系型数据库不会做这些区分）
>
> ​				一个电影只能拿数个奖项（one document relates to many other documents）
>
> ​				一个电影可能有数千个评论和打分
>
> ​				日志功能
>
> 多对多   一个电影有多个演员，每个演员又出演多个电影（two directions）

在引用形式中，会有其他相关数据集和document分开，数据被很好的分离，这就是归一化的意思

> 电影app  一个movie document 一个actor document  使用演员ID创建引用，将电影和演员联系起来

![image-20220816205923937](C:\Users\Mabiao\AppData\Roaming\Typora\typora-user-images\image-20220816205923937.png)

![image-20220816210017491](C:\Users\Mabiao\AppData\Roaming\Typora\typora-user-images\image-20220816210017491.png)

embedding可以提高performance，因为query更少，一次性获得的数据更多

但是不能单独查嵌入的数据



### 判断要做嵌入式还是引用式

1 关系类型（两个数据是如何关联起来的）  一对一用嵌入式  多对多用引用 一对大量也用引用  一对多要取舍

2 数据获取模式（数据读写频率如何，主要是读还是写）  读取很多建议嵌入式（这样每次只用访问一个数据库），电影截图适合嵌入式（因为读取更多），电影评论适合引用式，因为电影评论写入更多	 

3 data closeness （两个数据的相关性如何，想怎么查找数据）  相互隶属（user email）嵌入式，如果经常单独查找，用引用式 

### 引用类型

> 永远不应允许数组无限增长

child referncing   在父文档中保留refernce，通常为数组  （one to few,子文档不会增长很多）

parent referencing  （one to many and one to ton）child knows its parents, parents know nothing about the children, 不知道是谁，也不知道有多少

two-way referencing





一般都倾向于嵌入，除非有很好的不嵌入的理由（one to ton, many to many用引用）

经常要单独访问的，用referncing

读取很多，写入很少，用嵌入

![image-20220816224158242](C:\Users\Mabiao\AppData\Roaming\Typora\typora-user-images\image-20220816224158242.png)

## 149 embed user document to tour document

创建新tour时，只用添加一组guides id，然后就可以获取对应的guides用户document

```js
// 创建带guides的tours,只适用于创建
tourSchema.pre('save', async function(next) {
    // async函数返回一个promise，所以guidesPromise是一个Promise数组
    const guidesPromises = this.guides.map(async id => await User.findById(id))
    this.guides = await Promise.all(guidesPromises)
    next()
})
```

这种嵌入式会导致将来修改角色信息时要对每一个tour做检查，牵一发而动全身

## 150 model tour guides (child ref)

```js
const Tour = mongoose.Schema{
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}        

```

## 151 populating tour guides

> 1 先创建引用
>
> 2 populate the fields

用populate来替换引用字段，使请求到的字段像是embed的

populate happen in query

Only in query, not in database



populate 是用于mongoose数据处理的最基础的tool，populate会在后台创建一个query，所以会影响性能

```js
exports.getTour = catchAsync(async (req, res, next) => {
    // const tour = await Tour.findById(req.params.id).populate('guides')
    const tour = await Tour.findById(req.params.id).populate({
        path: 'guides',
        // 只输出感兴趣的内容
        select: '-__v -passwordChangedAt'
    })
    // 通过发了一个假id 发现await 返回值为null
    if (!tour) {
        return next(new AppError('No tour could find with this ID', 404))
    }
    // Tour.findOne({_id:req.params.id})
    res.status(200).json({
        status: 'success',
        // results: tours.length,
        data: {
            tour
        }
    })
})
```

使用query middleware来避免重复

```js
// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
    // this points to current query
    this.populate({
        path: 'guides',
        // 只输出感兴趣的内容
        select: '-__v -passwordChangedAt'
    })
    next()
})
```

## 153 create and get reviews

> 1 make a model to create a new documents
>
> 2 define controller functions to get and create reviews
>
> 3 use controller function to create some routes
>
> 4 给app配置路由器

## 154 populating reviews

要填充两个字段时，需要调用两次populate

```js
// populate reviews 填充两个字段，需要调用两次populate
reviewSchema.pre(/^find/, function(next) {
    // this points to current query
    this.populate({
        // path是指Schema中会被填充的字段
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})
```

## 155 virtual populate

how to access the reviews on the tours?

目前是父引用，所以是有评论指向tours，而不是tours指向评论

vittual populate来填充reviews

在tour中保留评论id的数组，但是没有持久化在数据库中，解决child引用的问题(会随着评论增加而使得父数据库量也增加，让数组无线增长)，类似于虚拟字段，但是有populate

```js
// 虚拟填充  .virtual('filed name')  这样可以保留对子文档的引用，但是没有持久化在数据库中
tourSchema.virtual('reviews', {
    // model want to refernce
    ref: 'Review',
    // 指定要连接的两个数据库的字段 Reivew 下的tour字段
    foreignField: 'tour',
    // 指定当前 id的存储位置
    localField: '_id'
})
```

使用时与populate一致

```js
exports.getTour = catchAsync(async (req, res, next) => {
    // const tour = await Tour.findById(req.params.id).populate('guides')
    const tour = await Tour.findById(req.params.id).populate('reviews')
    // 通过发了一个假id 发现await 返回值为null
}
```

## 156 嵌套路由

当资源有父子关系时需要使用嵌套路由

nested routes

发表评论

> *//* POST /tour/:tourid/reviews
>
> *//* GET  /tour/:tourid/reviews  获得该tour下的评论
>
> *//* GET  /tour/:tourid/reviews/:reviewsId  获得该tour下的特定评论

首先需要重新定位到tour路由中

```js
// POST /tour/:tourid/reviews
// GET  /tour/:tourid/reviews   获得该tour下的评论
// GET  /tour/:tourid/reviews/:reviewsId   获得该tour下的特定评论
router
    .route('/:tourId/reviews')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    )
```

## 157 nested toures with express

上一个路由放在了tourroutes中，但是实现的是添加评论

```js
exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const reviews = await Review.find(filter)
}
```

## 159 building handler factory function

工厂函数，返回一个函数的函数

## 163 add a _me endpoint

controller

```js
// 获取个人信息
exports.getMe = (req, res, next) => {
    // 因为想用factory function，所以把相应的变量替换掉
    req.params.id = req.user.id
    next()
}
```

route

```js
router.get(
    '/me',
    authController.protect,
    userController.getMe,
    userController.getUser
)
```

## 164 miss authentication and authorization in resourece

authentication 證明鑒定

authorization 授權

要捋清楚哪些身份的人可以访问哪些api

## 165 reading performance in mongodb

indexes are so important

```js
const doc = await features.query.explain()
```

返回的结果中多了一个`executionStats`字段

可以发现扫描了九个doc，获取了3个doc，如果数据库中数据量很大，这会导致性能下降，在集合中特定字段上创建索引可以解决这一问题，mongo自动创建索引在id字段

ID index是一个有序表，没有index，mongo就得一个一个的查找

>  **可以在需要经常查找的字段上添加index**

```js
//对经常搜索的字段添加index  1 代表升序 -1 代表降序
tourSchema.index({ price: 1 })
```

每一个unique字段mongoose都会为其创建唯一的索引

> **可以用复合索引来搜索，提高效率  compound index**

```js
tourSchema.index({ price: 1, ratingsAverage: -1 })
```



如何选择需要索引的字段？为什么不在所有字段上设置索引？

研究访问模式，要搞清楚哪些字段被访问的最多，然后为这些字段设置索引

因为每个索引都会占用资源

## 166 calculating average rating on tour

storage a summary of related data set on the main data set



query middleware, we only can access to the query.

```js
// 静态方法  因为要用到model
reviewSchema.statics.calAverageRatings = async function(tourId) {
    // this指向当前model
    const stats = await this.aggregate([
        {
            //select a tour we want to update
            $match: { tour: tourId }
        },
        {
            // 找出id对应这个tour的评论
            $group: {
                _id: '$tour', // 声明根据什么字段进行分组
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    console.log(stats)
    if (stats.length > 0) {
        // 更新Tour中相应字段
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}
```

## 167 创建和删除时计算平均值

```js
// 在中间件中使用静态方法， 每次有创建评论被创建时  这里不能用pre，pre时当前document还没有被创建
// reviewSchema.pre('save', function(next) {
reviewSchema.post('save', function() {
    // post 无法访问到next
    // this points to current review
    // Review.calAverageRatings(this.tour)
    this.constructor.calAverageRatings(this.tour)
})

// findByIdAndUpdate
// findByIdAndDelete  这两个只有query middleware 没有document middleware
// 所以用findOneAnd  pre时query还未执行，所以可以访问到query，post时query已经执行，所以访问不到query
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // the goal is to access the current document
    // access to this document
    // const r = await this.findOne() 将r挂载在this上
    this.r = await this.findOne()
    console.log(this.r)
    next()
})
// pass a data from pre-middleware to the post middleware
reviewSchema.post(/^findOneAnd/, async function() {
    // this.r = await this.findOne()  //query已执行，所以这一行无法执行
    await this.r.constructor.calAverageRatings(this.r.tour)
})
```

## 168 preventing duplicate reviews

use unique index 将用户和评论两个字段设置为unique，但是会导致每一个用户只能发一个评论

unique  要保证用户和旅游的结合总是unique的  the combination of user and tour

利用复合索引 compound index

```js
// index, each combination of tour and user will be unique
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
```

让评分四舍五入

```js
const tourSchema = new mongoose.Schema(
    {
		ratingsAverage: {
            type: Number,
            default: 4.5,
            // min max 不仅适用于数字，也适用于日期Date
            min: [1, 'Rating must be above than 1.0'],
            max: [5, 'Rating must be below than 5.0'],
            // 字段数据被更新时会执行 each time a new value is set for this field
            set: val => Math.round(val * 10) / 10 // Math.round会四舍五入
        },
    }
)
```

## 169 geospatial queries

```js
// geospatial
//'/tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/233/30.523867,104.042892/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    // mi = mile
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        )
    }
    const tours = await Tour.find({
        // geoWithin 范围内  centerSphere表示以某一为中心的球体，接收一个数组，center radius
        // startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})
```

```js
// 2dsphere 二维球体   加快寻找速度？
tourSchema.index({ startLocation: '2dsphere' })
```

## 170 使用geospatial aggregation来计算距离

先写route，了解需要什么参数

```js
// 计算某一旅游到其他旅游的距离
router.route('/distances/:latlng/unit/:unit').get(getDistances)
```



```js
exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const multiplier = unit === 'mi' ? 0.000621371192 : 0.001
    // mi = mile
    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        )
    }
    // aggregate在model上调用  agrregate用数组啊 聚合管道的所有阶段
    const distances = await Tour.aggregate([
        {
            //$geoNear always needs to be the first stage,同时要求至少一个字段有geoindex
            // 如果有多个字段有geoindex，则需要用key来声明需要用于计算的字段
            $geoNear: {
                // near 用于定义是哪个点附近
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // 记录计算出来的距离
                distanceField: 'distance',
                // 将距离转化为公里
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                // 声明要保留的字段
                distance: 1,
                name: 1
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})

```

# SSR with PUG tamplates

![image-20220824210209742](C:\Users\Mabiao\AppData\Roaming\Typora\typora-user-images\image-20220824210209742.png)

![image-20220824210345927](C:\Users\Mabiao\AppData\Roaming\Typora\typora-user-images\image-20220824210345927.png)

## 174 pug

template engine 使用模板引擎，然后可以轻松填充模板

模板引擎：pug,handlebars,EGS

```js
// define view engine
app.set('view engine', 'pug')
// 定义视图所在位置，路径选择相对于启动node app的地方，即项目根目录
app.set('views', path.join(__dirname, 'views'))

// 连接模板 app.get('/') '/' root of website
app.get('/',(req,res)=>{
    // render会渲染相应的模板
    res.status(200).render('base')
})
```

## 175 first steps with pug

pug是空格敏感的

pass data to template

```js
app.get('/', (req, res) => {
    // render会渲染相应的模板
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Shu Bio'
    })
})
```

```js
doctype html
html 
    head
        // 插值
        title Natours | #{tour}
        //- <link rel='stylesheet' href='css/style.css'/>
        //- use attributes
        link(rel='stylesheet', href='css/style.css')
        link(rel='shortcut icon' type='image/png' href='img/favicon.png')
    body
        //- pass data to template
        // Buffer code
        h1= tour
        h2= user.toUpperCase()
        // h1 The Park Camper(html文件中可见的注释方式)
        //- unbuffered code就是不会给输出添加任何内容
        - const x= 9
        h2= 2*x
        p This is some texts
```

## 176 create base template

CSS 架构 BEM架构  block element modifier

翻译这个框架太痛苦了

```python
doctype html
html 
    head
        meta(charset='UTF-8')
        meta(name='iewport' content='width=device-width, initial-scale=1.0')
        // 插值
        //- <link rel='stylesheet' href='css/style.css'/>
        //- use attributes
        link(rel='stylesheet', href='css/style.css')
        link(rel='shortcut icon' type='image/png' href='img/favicon.png')
        link(rel='stylesheet',href='https://fonts.googleapis.com/css?family=Lato:300,300i,700')
        title Natours | Exciting tours for adventurous people

    body
        // HEADER
        header.header
            nav.nav.nav--tours
                a.nav__el(href='#') All Tours
            .header__logo
                img(src='img/logo-white.png' alt='Natours logo')
            nav.nav.nav__user
                //- a.nav__el(href='#') My bookings
                //- a.nav__el(href='#')
                //-     img.nav__user-img(src='img/user.jpg' alt='User photo')
                //-     span Jonas
                button.nav__el Log in
                button.nav__el.nav__el--cta Sign up
        // CONTENT
        main.main
            h1= tour
        // FOOTER
        footer.footer
            .footer__logo
                img(src='img/logo-green.png' alt='Natours logo')
            ul.footer__nav
                li: a(href='#') About us
                li: a(href='#') Download apps
                li: a(href='#') Become a guide
                li: a(href='#') Careers
                li: a(href='#') Contact
            p.footer__copyright &copy; by Mou Bio. All rights reserved.
```

## 177 include one file to pug template

```pug
    body
        // HEADER
        include _header
        // CONTENT
        main.main
            h1= tour
        // FOOTER
        include _footer
```

## 178 extend

通过继承(扩展,extend)，可以使每个页面的布局都基本相同（感觉类似于vue组件化）

one overview page

one detail page

> s1 create route

include 父模板包含子模版

extends 子模版包含父模板

## 179 refactoring

对前端同样要建立MVC架构

router,controller fore views

写路由，挂载router

```js
const express = require('express')
const viewController = require('./../controllers/viewsController')

const router = express.Router()

// 3. ROUTE
// 连接模板 router.get('/') '/' root of website
router.get('/', viewController.getOverview)
router.get('/tour', viewController.getTour)

module.exports = router
```

```js
// viewController.js
exports.getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All Tours'
    })
}
exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    })
}
```

```js
// app.js
app.use('/', viewRouter) // 在‘/’route上使用viewRouter
```



MVC前端不用写接口？只用从数据库找数据？前端鉴权怎么写？

## 183 Building tour page

conditionals and mixins



mixin是可以重复使用的代码片段，可以传入参数，like function

```pug
mixin overviewBox(label,text,icon)
    .overview-box__detail
        svg.overview-box__icon
            use(xlink:href=`/img/icons.svg#icon-${icon}`)
        span.overview-box__label= label
        span.overview-box__text= text
```

```js
// 声明js
- const date = tour.startDates[0].toLocaleString('en-us',{month:'long', year:'numeric'})
// 调用mixin
+overviewBox('Next date', date, 'calendar')
+overviewBox('Difficulty', tour.difficulty, 'trending-up')
+overviewBox('Participants', `${tour.maxGroupSize} people`, 'user')
+overviewBox('Rating', `${tour.ratingsAverage} / 5`, 'star')
```

conditional

```js
.overview-box__detail
    img.overview-box__img(src=`/img/users/${guide.photo}`, alt=`${guide.name}`)
    - if(guide.role==='lead-guide')
        span.overview-box__label Lead Guide
    - if(guide.role==='guide')
        span.overview-box__label Tour Guide
    span.overview-box__text= guide.name
```

## 184 mapbox

use content delivery network

*//* 为了避免发ajax请求，可以将数据放在html中，让js进行操作

```js
section.section-map
    #map(data-locations=`${JSON.stringify(tour.locations)}`)
```

mapbox.js

```js
const locations = JSON.parse(document.getElementById('map').dataset.locations)
// console.log(locations)
mapboxgl.accessToken =    'pk.eyJ1Ijoic2h1c2h1YmlvIiwiYSI6ImNsN2QxZGdxdjE2aWYzd21pazFteGY3OGMifQ.fb3z0dSPrKhHjKu50zO-sg'
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/shushubio/cl7d1k2js003v14rpw4xxgiej',
    scrollZoom: false
    // center: [-118.113, 34.111],
    // zoom: 10
})

const bounds = new mapboxgl.LngLatBounds()

locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div')
    el.className = 'marker'
    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map)
    // Add popup
    new mapboxgl.Popup({
        offset: 30
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}}</p>`)
        .addTo(map)
    // extend map bounds to include the current location
    bounds.extend(loc.coordinates)
})

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
})
```



css也能做验证？好强
