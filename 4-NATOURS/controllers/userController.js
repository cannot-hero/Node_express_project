const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')

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
exports.getAllusers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    // send message
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})
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

exports.getUser = (req, res) => {
    res.status(500).json({
        statues: 'error',
        message: 'This route is not yet defined!'
    })
}
exports.createUser = (req, res) => {
    res.status(500).json({
        statues: 'error',
        message: 'This route is not yet defined!'
    })
}
exports.updateUser = (req, res) => {
    res.status(500).json({
        statues: 'error',
        message: 'This route is not yet defined!'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        statues: 'error',
        message: 'This route is not yet defined!'
    })
}
