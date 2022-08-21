const express = require('express')
const reviewController = require('../controllers/reviewController')
// 要求只有user可以发表评论，所以需要身份验证
const authController = require('../controllers/authController')

// {mergeParams:true} 可以访问从其他路由器上传来的params
const router = express.Router({ mergeParams: true })

// 只有登录了才能发表评论
router.use(authController.protect)

// POST /tour/:tourid/reviews
// GET /tour/:tourid/reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    )
// delete
router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    )
module.exports = router
