const multer = require('multer')
const sharp = require('sharp')
const AppError = require('../utils/appError')
const Tour = require('./../models/toursModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// 使文件可以存在buffer中
const multerStorage = multer.memoryStorage()
// multer filter
const multerFilter = (req, file, cb) => {
    // 判断上传的是否是图像，是则通过
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image. Please upload only images!', 400), false)
    }
}
// 不是直接上传到数据库中，首先上传到file system中，然后将图片的link上传到数据库
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

// upload.single('image') req.file
// upload.array('image',3)  req.files 混合用fields
exports.uploadTourImages = upload.fields([
    // 数据库中相关字段
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    // 多个文件时 是req.files
    if (!req.files.imageCover || !req.files.images) {
        return next()
    }
    // 1) Cover image
    // 挂载到req.body上对数据库字段进行更新
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333) // 3/2 ratio
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2) Images
    req.body.images = []
    // 因为回调中的异步函数只会在回调函数中阻塞，不会阻塞next
    // req.files.images.forEach(async (file, i) => {
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
            await sharp(file.buffer)
                .resize(2000, 1333) // 3/2 ratio
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`)
            // 将文件名存起来
            req.body.images.push(filename)
        })
    )
    next()
})
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

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const multiplier = unit === 'mi' ? 0.000621371192 : 0.001
    // mi = mile
    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        )
    }
    // aggregate在model上调用  agrregate用数组啊 聚合管道的所有阶段
    const distances = await Tour.aggregate([
        {
            //$geoNear always needs to be the first stage,同时要求至少一个字段有geoindex
            // 如果有多个字段有geoindex，则需要用key来声明需要用于计算的字段
            $geoNear: {
                // near 用于定义是哪个点附近
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // 记录计算出来的距离
                distanceField: 'distance',
                // 将距离转化为公里
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                // 声明要保留的字段
                distance: 1,
                name: 1
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})
