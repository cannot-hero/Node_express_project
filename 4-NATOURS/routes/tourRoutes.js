const express = require('express')
const {
	getAllTours,
	getTour,
	createTour,
	updateTour,
	deleteTour,
	checkID,
} = require('../controllers/tourController')

const router = express.Router()
// val 是id的值
router.param('id', checkID)

router.route('/').get(getAllTours).post(createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
