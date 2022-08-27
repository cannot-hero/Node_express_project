const Tour = require('../models/toursModel')
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1. get data from collection
    const tours = await Tour.find()
    // 2. build template

    // 3. rendering the template from step 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})
exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    })
}
