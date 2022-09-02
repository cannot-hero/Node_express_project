const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
// const User = require('./userModel')

// Schema 不仅可以传入相关定义， 也可以传schema的配置对象
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name!'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal then 40 characters'
            ],
            minlength: [
                10,
                'A tour name must have more or equal then 10 characters'
            ]
            // validate: [validator.isAlpha, 'Tour name must only have charactors']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            // enum仅适用于字符串
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            // min max 不仅适用于数字，也适用于日期Date
            min: [1, 'Rating must be above than 1.0'],
            max: [5, 'Rating must be below than 5.0'],
            // 字段数据被更新时会执行 each time a new value is set for this field
            set: val => Math.round(val * 10) / 10 // Math.round会四舍五入
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                message:
                    'Discount price ({VALUE}) should be below than regular price',
                validator: function(val) {
                    // this 只会在创建一个新的document时有用，在更新时没有用
                    return val < this.price
                }
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        // 描述启程的点
        startLocation: {
            //GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        // 通过对象数组，会创建全新的documents inside the parent document
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        // embed 直接将guides存在一个数组中
        // guides: Array
        // 这里只存guides的id，当访问tour时，自动去访问guide (ref) child ref
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
        // child ref 让tour获得评论
        // reviews:[
        //     {
        //         type:mongoose.Schema.ObjectId,
        //         ref:'Review'
        //     }
        // ]
    },
    {
        // schema的配置对象 toJSON是指数据以JSON传出时 使用virtuals
        // 使用Object输出时，适用virtuals
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

//对经常搜索的字段添加index  1 代表升序 -1 代表降序
// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
// 2dsphere 二维球体
tourSchema.index({ startLocation: '2dsphere' })
// get 相当于定义了一个getter  getter不能用箭头函数(arrow function)，因为要用到this regular function
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})

// 虚拟填充  .virtual('filed name')  这样可以保留对子文档的引用，但是没有持久化在数据库中
tourSchema.virtual('reviews', {
    // model want to refernce
    ref: 'Review',
    // 指定要连接的两个数据库的字段 Reivew 下的tour字段
    foreignField: 'tour',
    // 指定当前 id的存储位置
    localField: '_id'
})
// document middleware: runs before .save() and .create
tourSchema.pre('save', function(next) {
    // this 指向当前处理的文件
    this.slug = slugify(this.name, { lower: true })
    next()
})

// 创建带guides的tours,只适用于创建  embed
// tourSchema.pre('save', async function(next) {
//     // async函数返回一个promise，所以guidesPromise是一个Promise数组
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })
// tourSchema.pre('save', function(next) {
//     console.log('Will save documents ...')
//     next()
// })
// // 可以访问到刚刚保存到数据库的document
// tourSchema.post('save', function(doc, next) {
//     //post middleware functions are excuted after the pre middleware functions are completed
//     console.log(doc)
//     next()
// })

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
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    next()
})

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//     // 过滤掉secret tour  只需再添加一个match stage pipeline()返回一个数组
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     // this point to the current aggregation object
//     console.log(this.pipeline())
//     next()
// })
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
