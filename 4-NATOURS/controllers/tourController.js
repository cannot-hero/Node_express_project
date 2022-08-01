const Tour = require('./../models/toursModel')

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

exports.getAllTours = async (req, res) => {
    try {
        console.log(req.query)
        // BUIKD QUERY
        // 1A) Filtering
        const queryObj = { ...req.query }
        const excludeFields = ['page', 'limit', 'sort', 'fields']
        excludeFields.forEach(el => delete queryObj[el])
        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        ) // 正则表达式
        // console.log(JSON.parse(queryStr))
        let query = Tour.find(JSON.parse(queryStr))
        // {difficulty : 'easy', duration:{$gte : 5}}
        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
            // second criteria  query.sort('price ratingsAverage')
        } else {
            // 默认排序
            query = query.sort('-createAt')
        }
        // 3) Field limit
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }
        // EXCUTE QUERY
        const tours = await query
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
