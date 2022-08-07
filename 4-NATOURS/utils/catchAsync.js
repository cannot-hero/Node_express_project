// 闭包
module.exports = fn => {
    return (req, res, next) => {
        // 因为async函数返回一个Promise可以用catch
        fn(req, res, next).catch(next)
    }
}
