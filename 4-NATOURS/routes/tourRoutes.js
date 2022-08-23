/* eslint-disable prettier/prettier */
const express = require('express')
const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin
} = require('../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')

// POST /tour/:tourid/reviews
// GET  /tour/:tourid/reviews   获得该tour下的评论
// GET  /tour/:tourid/reviews/:reviewsId   获得该tour下的特定评论
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     )
const router = express.Router()
// mounting a router 使得tour router 和 review router 很好的分开
router.use('/:tourId/reviews', reviewRouter) //router 本身是一个中间件，声明在某一路径上使用哪个router
// val 是id的值
// router.param('id', checkID)
// create a new middleware
// check if body contains the name and price property
// if not send back 400
// add it to the post handle stack
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router
    .route('/')
    .get(getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        createTour
    )
// geospatial
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)
// /tours-distance?distance=233&center=-40,45&unit=mi
// /tours-distance/233/-40,45/unit=mi
router.route('/tour-stats').get(getTourStats)
router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan
    )
router
    .route('/:id')
    .get(getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        deleteTour
    )

module.exports = router
