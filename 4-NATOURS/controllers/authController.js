const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    // 避免用户的手动注入，所以要吧req.body的对应内容提取出来
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    // payload(object)是想要存储在toekn里的数据,secret用HSA-256加密。secret至少32charcator
    const token = signToken(newUser._id)
    // 注册时不用验证密码和邮箱
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    // 1) email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    // 2) user exist and the password is correct
    // password 设置select为false
    const user = await User.findOne({ email: email }).select('+password')
    // 如果没有user 则下面这一行没办法跑 因为 null.password
    // const correct = await user.correctPassword(password,user.password)
    if (!user || !(await user.correctPassword(password, user.password))) {
        // 401 未授权
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) if everything is ok, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})
