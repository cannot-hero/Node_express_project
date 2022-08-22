const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        // 不会自动出现在output中
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el) {
                // only gonna work on CREATE or SAVE(.create  .save), whenever we want to update a user, we always have to
                // use save, not find one and update
                return el === this.password
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})
// userSchema.pre('save', async function(next) {
//     // when the password is changed or created
//     if (!this.isModified('password')) return next()
//     // hash the password with cost of 12, hash is a async version
//     this.password = await bcrypt.hash(this.password, 12)
//     // 加密之后删除确认密码字段, passwordConfirm只是一个需要输入的字段，但不需要持久化保存在数据库中
//     this.passwordConfirm = undefined
//     next()
// })

userSchema.pre('save', function(next) {
    // 如果没有修改或密码或者是新创建用户
    if (!this.isModified('password') || this.isNew) return next()
    // 有时保存到数据库会比发送JWT慢一些，使修改密码的时间戳比JWT创建的时间戳晚
    // 减一秒确保修改密码的时间戳在发送JWT之前
    this.passwordChangedAt = Date.now() - 1000
    next()
})
// query middleware 只查找活跃用户  以find开头的
userSchema.pre(/^find/, function(next) {
    // this point to current query
    this.find({ active: { $ne: false } })
    next()
})
// instance methods 可以在所有dicument中使用
userSchema.methods.correctPassword = async function(candidatePwd, userPwd) {
    // this指向当前document,由于password select为false 所以this无法获取password
    return await bcrypt.compare(candidatePwd, userPwd)
}

// 检验密码是否被修改过
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        // 将日期格式转换为时间戳
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )
        return JWTTimestamp < changedTimeStamp // 100 < 200  要保证发token在改密码之后
    }
    // false means not changed, defalut return
    return false
}
// 创建用于重置密码的随机token
userSchema.methods.createPasswordResetToken = function() {
    // 随机token不用很复杂，所以用node内置的crypto模块   'hex'表示16进制
    const resetToken = crypto.randomBytes(32).toString('hex')
    // 不能直接将resetToken放在数据库，敏感数据只存加密形式的，然后将其与加密的版本进行比较
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    console.log({ resetToken }, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    // 返回重置密码的token
    return resetToken
}
const User = mongoose.model('User', userSchema)

module.exports = User
