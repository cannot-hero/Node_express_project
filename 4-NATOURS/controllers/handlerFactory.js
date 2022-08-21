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
