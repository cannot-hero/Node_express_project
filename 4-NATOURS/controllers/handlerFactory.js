// 工厂函数返回controllers
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

// 用于删除的工厂函数
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id)
        if (!doc) {
            return next(
                new AppError('No document could find with this ID', 404)
            )
        }
        res.status(204).json({
            status: 'success',
            data: null
        })
    })

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        // 先找到对应document，然后在做修改         id            对应的修改
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // 返回更新后的值
            // 重新验证
            runValidators: true
        })
        if (!doc) {
            return next(
                new AppError('No document could find with this ID', 404)
            )
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    })
exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    })

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id)
        if (popOptions) query = query.populate(popOptions)
        // const doc = await Model.findById(req.params.id).populate(popOption)
        const doc = await query
        // 通过发了一个假id 发现await 返回值为null
        if (!doc) {
            return next(
                new AppError('No document could find with this ID', 404)
            )
        }
        // doc.findOne({_id:req.params.id})
        res.status(200).json({
            status: 'success',
            // results: docs.length,
            data: {
                data: doc
            }
        })
    })

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        // to allow for nested GET reviews on tour
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }
        // EXCUTE QUERY
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
        // const doc = await features.query.explain()
        const doc = await features.query
        // const query = Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy')
        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        })
    })
