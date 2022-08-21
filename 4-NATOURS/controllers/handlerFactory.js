// 工厂函数返回controllers
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
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
