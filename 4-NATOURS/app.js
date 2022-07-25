const fs = require('fs')
const express = require('express')
const app = express()

// middleware  中间件可以修改传入的请求数据 request data
// in the middle of request and response
app.use(express.json()) // 可以获取请求体

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

// v1 指定api版本
app.get('/api/v1/tours', (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours,
		},
	})
})

app.post('/api/v1/tours', (req, res) => {
	// console.log(req.body)
	// 为新的tours标记id，合并到请求体中，将这个请求的内容放入tours中
	const newId = tours[tours.length - 1].id + 1
	const newTour = Object.assign({ id: newId }, req.body)
	tours.push(newTour)
	// 写入文件中
	fs.writeFile(
		`${__dirname}/dev-data/data/tours-simple.json`,
		JSON.stringify(tours),
		(err) => {
			// 201 means created
			res.status(201).json({
				status: 'success',
				data: {
					tour: newTour,
				},
			})
		}
	)
})
const port = 3000
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
