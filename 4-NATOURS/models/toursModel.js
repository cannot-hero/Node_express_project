const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

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
            max: [5, 'Rating must be below than 5.0']
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
        }
    },
    {
        // schema的配置对象 toJSON是指数据以JSON传出时 使用virtuals
        // 使用Object输出时，适用virtuals
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)
// get 相当于定义了一个getter  getter不能用箭头函数(arrow function)，因为要用到this regular function
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})
// document middleware: runs before .save() and .create
tourSchema.pre('save', function(next) {
    // this 指向当前处理的文件
    this.slug = slugify(this.name, { lower: true })
    next()
})

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
    next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    // 过滤掉secret tour  只需再添加一个match stage pipeline()返回一个数组
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    // this point to the current aggregation object
    console.log(this.pipeline())
    next()
})
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
