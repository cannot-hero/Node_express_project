const AppError = require('../utils/appError')
const Tour = require('./../models/toursModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     // EXCUTE QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate()
//     const tours = await features.query
//     // const query = Tour.find()
//     //     .where('duration')
//     //     .equals(5)
//     //     .where('difficulty')
//     //     .equals('easy')
//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     })
// })

exports.getTour = factory.getOne(Tour, { path: 'reviews' })
// exports.getTour = catchAsync(async (req, res, next) => {
//     // const tour = await Tour.findById(req.params.id).populate('guides')
//     const tour = await Tour.findById(req.params.id).populate('reviews')
//     // 通过发了一个假id 发现await 返回值为null
//     if (!tour) {
//         return next(new AppError('No tour could find with this ID', 404))
//     }
//     // Tour.findOne({_id:req.params.id})
//     res.status(200).json({
//         status: 'success',
//         // results: tours.length,
//         data: {
//             tour
//         }
//     })
// })

exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     if (!tour) {
//         return next(new AppError('No tour could find with this ID', 404))
//     }
//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// })

exports.getTourStats = catchAsync(async (req, res, next) => {
    // aggregate输入一个pipeline的[]
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' }, // 声明根据什么字段进行分组
                numTours: { $sum: 1 }, //相当于计数器，每经过这个管道就 + 1
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            // unwind 解构信息文档的数组字段，然后为数组每一个元素输出一个document
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                // 0 表示不会显示， 1 表示会显示
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})

// geospatial
//'/tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/233/30.523867,104.042892/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    // mi = mile
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        )
    }
    const tours = await Tour.find({
        // geoWithin 范围内  centerSphere表示以某一为中心的球体，接收一个数组，center radius
        // startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})
