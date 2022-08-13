const mongoose = require('mongoose')
//server文件处理 database configurations, error handling staff or environment varables
const dotenv = require('dotenv')

// 同步代码的错误捕获
process.on('uncaughtException', err => {
    console.log('UNHANDLED EXCEPTION 🥵, shutting down...')
    console.log(err.name, err.message)
    // 1 stands for uncaught exception 0 stands for success
    // process.exit()会立即中断所有请求 running or pending
    process.exit(1)
})

process.env.NODE_ENV = 'development'
// process.env.NODE_ENV = 'production'
dotenv.config({ path: `./${process.env.NODE_ENV}.env` })
const app = require('./app')

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABSE_PASSWORD
)
mongoose
    //连接本地数据库
    // .connect(process.env.DATABASE_LOCAL, {
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        // console.log(con.connections)
        console.log('DB connection successful!')
    })

// console.log(process.env.NODE_ENV)
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})

// last safety net for asynchronous code
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION 🥵, shutting down...')
    console.log(err.name, err.message)
    // 1 stands for uncaught exception 0 stands for success
    // process.exit()会立即中断所有请求 running or pending
    server.close(() => {
        process.exit(1)
    })
})
