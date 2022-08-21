const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const reviews = await Review.find(filter)
    // send message
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})

exports.setTourUserIds = (req, res, next) => {
    // 需要知道哪个用户给哪个tour添加了评论, allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId
    // protect middleware 会记录req.user
    if (!req.body.user) req.body.user = req.user.id
    next()
}
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
