const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgetPassword', authController.forgetPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
// 注册，登录，忘记密码，重置密码都不需要登录，除此之外都需要登录操作
// router 相当于一个mini app，本身也可以使用中间件，且中间件按顺序执行，这里执行一次protect，相当于后面都执行了protect
router.use(authController.protect)
router.patch('/updateMyPassword', authController.updatePassword)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// 将如下的api都限制为admin角色可用
router.use(authController.restrictTo('admin'))
router
    .route('/')
    .get(userController.getAllusers)
    .post(userController.createUser)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router
