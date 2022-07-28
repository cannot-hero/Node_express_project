//server文件处理 database configurations, error handling staff or environment varables
const dotenv = require('dotenv')

dotenv.config({ path: `./${process.env.NODE_ENV}.env` })

const app = require('./app')

// console.log(process.env.NODE_ENV)
const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
