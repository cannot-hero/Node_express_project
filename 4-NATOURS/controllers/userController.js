const multer = require('multer')
const sharp = require('sharp')
const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// 创建一个multer storage 一个multer filter，然后通过upload上传
// const multerStorage = multer.diskStorage({
//     // cb类似于express中的next
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         // filename user-id-时间戳.jpeg
//         const ext = file.mimetype.split('/')[1]
//         // null 代表no error 第二个参数是文件名
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })
// 使文件可以存在buffer中
const multerStorage = multer.memoryStorage()
// multer filter
const multerFilter = (req, file, cb) => {
    // 判断上传的是否是图像，是则通过
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image. Please upload only images!', 400), false)
    }
}
// 不是直接上传到数据库中，首先上传到file system中，然后将图片的link上传到数据库
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

// 'photo' 表示上传的字段
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    // 如果没有更新 则什么都不做
    if (!req.file) return next()
    // 图片要保存在内存中，而不是disk中
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)
    next()
})

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
    // 只存phot的名称，将photo字段存起来， 这样命名是将其挂载在req上
    // 下一个中间件可以继续使用
    if (req.file) filterBody.photo = req.file.filename
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
