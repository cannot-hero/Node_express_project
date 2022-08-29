const AppError = require('../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name
    // console.log(value)
    const message = `Duplicate field value: ${value}, please use another one!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    console.log(errors)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () =>
    new AppError('Invalid token, please log in again!', 401)

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please login again!', 401)
const sendErrDevelopment = (err, req, res) => {
    //A) api
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    //B) render website
    console.error('ERROR 😨', err)
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}

const sendErrProduction = (err, req, res) => {
    // console.log(err)
    // operational, trusted error, send it to client
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // 可信任的错误，发送到客户端
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
            // programming or other unknown error: dont leak the error details
        }
        // 1) log error
        console.error('ERROR 😨', err)
        return res.status(500).json({
            status: 'error',
            message: 'Something went bad badly'
        })
    }
    // B) render website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
        // programming or other unknown error: dont leak the error details
    }
    // 1) log error
    console.error('ERROR 😨', err)
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    // 根据开发环境和生产环境产生不同报错
    if (process.env.NODE_ENV === 'development') {
        // console.log(err)
        sendErrDevelopment(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        // a hard copy
        // let error = { ...err } // 这里浅拷贝不行，信息不全
        let error = JSON.parse(JSON.stringify(err))
        error.message = err.message
        // console.log(error)
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error)
        }
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        // 这里注意error.name 是ValidationError
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error)
        }
        // token 错误
        if (error.name === 'JsonWebTokenError') error = handleJWTError()
        // token过期
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
        sendErrProduction(error, req, res)
    }
}
