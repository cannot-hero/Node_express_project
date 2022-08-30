const express = require('express')
const viewController = require('./../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router()

// router.use(authController.isLoggedIn)
// 3. ROUTE
// 连接模板 router.get('/') '/' root of website
router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/me', authController.protect, viewController.getAccount)

module.exports = router
