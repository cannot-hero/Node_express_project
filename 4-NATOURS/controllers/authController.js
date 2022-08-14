const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')

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
        // passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
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
    // 将当前user挂载在req上，供后续中间件处理
    req.user = currentUser
    next()
})

// 权限和角色管理
// ...roles 会创建一个数组
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin','lead-guide']  role = 'user' user不在roles数组中，则无此权限
        if (!roles.includes(req.user.role)) {
            // 403 forbidden
            return next(
                new AppError(
                    'You dont have the permission to perform this action!',
                    403
                )
            )
        }
        next()
    }
}

// 忘记密码和重置密码
exports.forgetPassword = catchAsync(async (req, res, next) => {
    // 1 get user based on posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('This email does not have a user!', 404))
    }
    // 2 generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    // 3 send it to user's email
    // 发送原始的token，而不是加密后的
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forget your password? Submit a patch request with your new password and passwordconfirm to : ${resetURL} \n if you dont forget your password, please ignore this email`
    try {
        await sendEmail({
            email: req.body.email,
            subject: 'Your reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token send to email!'
        })
    } catch (err) {
        // 如果出错就重置token和expires属性
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        // this only modifies the data, doesnt really save it
        await user.save({ validateBeforeSave: false })
        return next(
            new AppError('There was an error sending email, try it later!'),
            500
        )
    }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1 Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')
    // 找到user同时检查token是否过期
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    // 2 If token is not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 404))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    // 此处不关闭验证， 因为真的想验证
    await user.save()
    // 3  update changePasswordAt property for the user

    // 4 Log the user in, send the JWT to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})
