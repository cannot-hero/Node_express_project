const express = require('express')
const bookingController = require('../controllers/bookingController')
// 要求只有user可以发表评论，所以需要身份验证
const authController = require('../controllers/authController')

// {mergeParams:true} 可以访问从其他路由器上传来的params
const router = express.Router()

router.use(authController.protect)

router.get('/checkout-session/:tourId', bookingController.getCheoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'))
router
    .route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking)
router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)
module.exports = router
