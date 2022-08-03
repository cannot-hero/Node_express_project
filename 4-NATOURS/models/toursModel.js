const mongoose = require('mongoose')
const slugify = require('slugify')

// Schema 不仅可以传入相关定义， 也可以传schema的配置对象
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name!'],
            unique: true,
            trim: true
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
            required: [true, 'A tour must have a difficulty']
        },
        ratingsAverage: {
            type: Number,
            default: 4.5
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: Number,
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
        startDates: [Date]
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
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
