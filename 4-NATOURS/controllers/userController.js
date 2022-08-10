const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')

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
