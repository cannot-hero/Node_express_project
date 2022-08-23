const mongoose = require('mongoose')
const { findByIdAndUpdate, findByIdAndDelete } = require('./toursModel')
const Tour = require('./toursModel')
// review / rating/ createdAt / ref to the tour / ref to user
// 父引用， 这样tour不知道有多少review
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        }
    },
    {
        // schema的配置对象 toJSON是指数据以JSON传出时 使用virtuals
        // 使用Object输出时，适用virtuals
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)
// index, each combination of tour and user will be unique
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
// populate reviews 填充两个字段，需要调用两次populate
reviewSchema.pre(/^find/, function(next) {
    // this points to current query
    // this.populate({
    //     // path是指Schema中会被填充的字段
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

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
    // console.log(stats)
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
    // console.log(this.r)
    next()
})
// pass a data from pre-middleware to the post middleware
reviewSchema.post(/^findOneAnd/, async function() {
    // this.r = await this.findOne()  //query已执行，所以这一行无法执行
    await this.r.constructor.calAverageRatings(this.r.tour)
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
