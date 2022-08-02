const Tour = require('./../models/toursModel')
const APIFeatures = require('./../utils/apiFeatures')
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        // Tour.findOne({_id:req.params.id})
        res.status(200).json({
            status: 'success',
            // results: tours.length,
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save()
        // 写入数据库
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}
exports.updateTour = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
