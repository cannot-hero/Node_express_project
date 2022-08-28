const express = require('express')
const viewController = require('./../controllers/viewsController')

const router = express.Router()

// 3. ROUTE
// 连接模板 router.get('/') '/' root of website
router.get('/', viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)

module.exports = router
