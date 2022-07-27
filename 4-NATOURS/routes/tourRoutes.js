const express = require('express')
const {
	getAllTours,
	getTour,
	createTour,
	updateTour,
	deleteTour,
	checkID,
	checkBody,
} = require('../controllers/tourController')

const router = express.Router()
// val 是id的值
router.param('id', checkID)
// create a new middleware
// check if body contains the name and price property
// if not send back 400
// add it to the post handle stack
router.route('/').get(getAllTours).post(checkBody, createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
