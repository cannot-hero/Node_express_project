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
exports.getTour = catchAsync(async (req, res, next) => {
    // 1 get the data, for the requested tour (including the reviews and guide)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    // 2 Build template

    // 3 using data from 1 to render tamplate
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour',
        tour
    })
})
