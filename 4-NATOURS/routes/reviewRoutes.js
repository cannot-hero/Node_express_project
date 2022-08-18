const express = require('express')
const reviewController = require('../controllers/reviewController')
// 要求只有user可以发表评论，所以需要身份验证
const authController = require('../controllers/authController')

const router = express.Router()
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    )

module.exports = router
