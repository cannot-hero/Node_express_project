const fs = require('fs')
const mongoose = require('mongoose')
//server文件处理 database configurations, error handling staff or environment varables
const dotenv = require('dotenv')
const Tour = require('../../models/toursModel')

dotenv.config({ path: './development.env' })

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
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))

// import data into database
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data sucessfully loaded!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}
// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data sucessfully deleted!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}
// Arguments running this node process
// console.log(process.argv)
