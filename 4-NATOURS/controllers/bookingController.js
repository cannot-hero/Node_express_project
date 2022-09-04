const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const AppError = require('../utils/appError')
const Tour = require('./../models/toursModel')
const Booking = require('./../models/bookingModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getCheoutSession = catchAsync(async (req, res, next) => {
    // 1 Get the currently booking tour
    const tour = await Tour.findById(req.params.tourId)
    // 2 Create the checkout session
    // 调用了stripe的api，所以是异步的
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // 注意，下面这种写法不安全
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        // detail about the product
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`
                        ]
                    }
                },
                quantity: 1
            }
        ],
        mode: 'payment'
    })
    // 3 Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query
    if (!user && !tour && !price) return next()
    await Booking.create({ user, tour, price })
    // 不显示query参数，让路径更安全一些，不透露重要信息
    // `${req.protocol}://${req.get('host')}/  重新请求后会因为上一个if判断而直接到主页
    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
