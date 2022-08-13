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
    passwordChangedAt: Date
})
userSchema.pre('save', async function(next) {
    // when the password is changed or created
    if (!this.isModified('password')) return next()
    // hash the password with cost of 12, hash is a async version
    this.password = await bcrypt.hash(this.password, 12)
    // 加密之后删除确认密码字段, passwordConfirm只是一个需要输入的字段，但不需要持久化保存在数据库中
    this.passwordConfirm = undefined
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
const User = mongoose.model('User', userSchema)

module.exports = User
