const Tour = require('./../models/toursModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXCUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const tours = await features.query
    // const query = Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy')
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({_id:req.params.id})
    res.status(200).json({
        status: 'success',
        // results: tours.length,
        data: {
            tour
        }
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})
exports.updateTour = catchAsync(async (req, res, next) => {
    // 先找到对应document，然后在做修改         id            对应的修改
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // 返回更新后的值
        // 重新验证
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})
exports.deleteTour = catchAsync(async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status: 'success',
        data: null
    })
})

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
