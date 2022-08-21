const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// 剩余字段会成一个数组
const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    // 遍历对象
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}

// 更新用户个人信息
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1 throw an error if user POSTs password
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password update. Please use updateMyPassword.',
                400 // bad request
            )
        )
    }
    // 2 Filter the unwanted flieds in req.body
    const filterBody = filterObj(req.body, 'name', 'email')
    // 3 Update user document
    // 因为是和密码无关的，所以可以用 findByIdAndUpdate {new:true}表示返回更新后的对象
    // x 是将req.body中属性做了filter之后的
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        user: updateUser
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})
// 获取个人信息
exports.getMe = (req, res, next) => {
    // 因为想用factory function，所以把相应的变量替换掉
    req.params.id = req.user.id
    next()
}
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead'
    })
}

exports.getUser = factory.getOne(User)
exports.getAllusers = factory.getAll(User)
// do not update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
