const mongoose = require('mongoose')
//server文件处理 database configurations, error handling staff or environment varables
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({ path: `./${process.env.NODE_ENV}.env` })

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
// testTour是Tour Model 的一个实例
const testTour = new Tour({
    name: 'The Park Hiker',
    price: 99
})
// save方法 保存到tours collection in the database
testTour
    .save()
    .then(doc => {
        console.log(doc)
    })
    .catch(err => {
        console.log('Error!😟', err)
    })
// console.log(process.env.NODE_ENV)
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})
