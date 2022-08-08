const AppError = require('../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name
    console.log(value)
    const message = `Duplicate field value: ${value}, please use another one!`
    return new AppError(message, 400)
}
const sendErrDevelopment = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrProduction = (err, res) => {
    // console.log(err)
    // operational, trusted error, send it to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
        // programming or other unknown error: dont leak the error details
    } else {
        // 1) log error
        console.error('ERROR 😨', err)
        res.status(500).json({
            status: 'error',
            message: 'Something went bad badly'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    // 根据开发环境和生产环境产生不同报错
    if (process.env.NODE_ENV === 'development') {
        // console.log(err)
        sendErrDevelopment(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        // a hard copy
        // let error = { ...err } // 这里浅拷贝不行，信息不全
        let error = JSON.parse(JSON.stringify(err))
        // console.log(error)
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error)
        }
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        sendErrProduction(error, res)
    }
}
