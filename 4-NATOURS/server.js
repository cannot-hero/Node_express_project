//server文件处理 database configurations, error handling staff or environment varables

const app = require('./app')

const port = 3000
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
