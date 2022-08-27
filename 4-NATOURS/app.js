const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()
// define view engine
app.set('view engine', 'pug')
// 定义视图所在位置，路径选择相对于启动node app的地方，即项目根目录
app.set('views', path.join(__dirname, 'views'))

// 静态文件托管  托管public下的文件
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))
// console.log(process.env.NODE_ENV)
// middleware  中间件可以修改传入的请求数据 request data
// in the middle of request and response
// 1. Global MIDDLEWARE
// Set security HTTP headers helmet会直接返回一个函数
app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
// limit requests from same IP
const limiter = rateLimit({
    // 一小时内只能访问100次
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests in this IP, please try in an hour!'
})
// 全局限制
app.use('/api', limiter)
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })) // 可以获取请求体

// data sanitization against NoSQL query injection
// 查看req.body, req.query,req.params 过滤掉所有$和.
app.use(mongoSanitize())
// data sanitization against XSS
// 将html脚本转换
app.use(xss())
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

// test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.headers)
    next()
})

// 2. ROUTE handlers

// v1 指定api版本
// app.get('/api/v1/tours', getAllTours)
// '/api/v1/tours/:id' url中对应内容赋值给:id
// 路徑中一定要有對應參數，不然會報錯
// '/api/v1/tours/:id/:y?' 加一個問號，讓參數變爲可選參數
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// patch
// app.patch('/api/v1/tours/:id', updateTour)
//delete
// app.delete('/api/v1/tours/:id', deleteTour)

// mounting the router
// tourRoute only runs on '/api/v1/tours'
app.use('/', viewRouter) // 在‘/’route上使用viewRouter
app.use('/api/v1/tours', tourRouter) // 在‘/api/v1/tours’route上使用tourRouter
app.use('/api/v1/users', userRouter) // 在‘/api/v1/tours’route上使用tourRouter
app.use('/api/v1/reviews', reviewRouter) // 在‘/api/v1/tours’route上使用tourRouter
// 上面两个路由都没匹配到的话 就到下面这个路由
// .all could run all the verbs in HTTP methods
app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server !`)
    // err.status = 'fail'
    // err.statusCode = 404
    // 传递东西给next 他会假设是一个错误，会跳过中间件所有的其他中间件堆栈
    // 并发送我们传入的错误到全局错误处理中间件
    next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404))
})

app.use(globalErrorHandler)
// 4. START SERVER
module.exports = app
