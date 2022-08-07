class AppError extends Error {
    constructor(message, statusCode) {
        // 扩展父类 super in order to call parent constructor
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        // 用于区分系统报错
        this.isOperational = true
        // 让其不出现在Error.stack中
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError
