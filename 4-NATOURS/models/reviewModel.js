const mongoose = require('mongoose')
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
    console.log(stats)
    // 更新Tour中相应字段
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    })
}

// 在中间件中使用静态方法， 每次有创建评论被创建时  这里不能用pre，pre时当前document还没有被创建
// reviewSchema.pre('save', function(next) {
reviewSchema.post('save', function() {
    // post 无法访问到next
    // this points to current review
    // Review.calAverageRatings(this.tour)
    this.constructor.calAverageRatings(this.tour)
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
