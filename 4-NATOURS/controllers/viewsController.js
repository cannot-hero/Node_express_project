const Tour = require('../models/toursModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
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
    if (!tour) {
        return next(new AppError('There is no Tour in that name!', 404))
    }
    // 2 Build template

    // 3 using data from 1 to render tamplate
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
}
// 找到所有预定了的Tour
exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1 Find all bookings
    const bookings = await Booking.find({ user: req.user.id }) // 这里只找到了tourid
    // 2 Find tours with the id
    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: { $in: tourIds } })

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
    // 永远不要用findByIdAndUpdate来更新密码
    const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runvalidators: true
        }
    )
    // 修改完成后再次渲染页面
    res.status(200).render('account', {
        title: 'Your account',
        // 要渲染更新后的数据
        user: updateUser
    })
})
