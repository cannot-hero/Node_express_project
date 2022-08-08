const mongoose = require('mongoose')
//server文件处理 database configurations, error handling staff or environment varables
const dotenv = require('dotenv')

// process.env.NODE_ENV = 'development'
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
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})
