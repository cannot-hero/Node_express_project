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
    getMonthlyPlan
} = require('../controllers/tourController')
const authController = require('./../controllers/authController')

const router = express.Router()
// val 是id的值
// router.param('id', checkID)
// create a new middleware
// check if body contains the name and price property
// if not send back 400
// add it to the post handle stack
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router
    .route('/')
    .get(authController.protect, getAllTours)
    .post(createTour)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

module.exports = router
