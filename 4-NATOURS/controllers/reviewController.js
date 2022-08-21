const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')
// const catchAsync = require('../utils/catchAsync')

exports.setTourUserIds = (req, res, next) => {
    // 需要知道哪个用户给哪个tour添加了评论, allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId
    // protect middleware 会记录req.user
    if (!req.body.user) req.body.user = req.user.id
    next()
}
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
