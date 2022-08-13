const { promisify } = require('util')
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
        passwordConfirm: req.body.passwordConfirm,
        // 视频里没加这个字段 👇
        passwordChangedAt: req.body.passwordChangedAt
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

// 路由权限
exports.protect = catchAsync(async (req, res, next) => {
    // 1 getting token and check of it's there
    // 一般是把token放在http请求头
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
    }
    // console.log(token)
    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        )
    }
    // 2 verification the token is expire
    // 因为想在验证完之后执行回调，所以是异步的   解析出token上的payload
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decode)
    // 3 check if user still exist
    const currentUser = await User.findById(decode.id)
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token does not exist', 401)
        )
    }
    // 4 check the user changed password after the jwt issued
    if (currentUser.changePasswordAfter(decode.iat)) {
        return next(
            new AppError('User password has changed! Please login again!', 401)
        )
    }
    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = currentUser
    next()
})
