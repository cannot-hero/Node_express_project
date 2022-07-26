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
// '/api/v1/tours/:id' url中对应内容赋值给:id
// 路徑中一定要有對應參數，不然會報錯
// '/api/v1/tours/:id/:y?' 加一個問號，讓參數變爲可選參數
app.get('/api/v1/tours/:id', (req, res) => {
	console.log(req.params)
	const id = req.params.id * 1
	const tour = tours.find((el) => el.id === id)
	// if (id > tours.length) {
	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		})
	}

	res.status(200).json({
		status: 'success',
		// results: tours.length,
		data: {
			tour,
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

// patch
app.patch('/api/v1/tours/:id', (req, res) => {
	if (req.params.id * 1 > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		})
	}
	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Update tour here...>',
		},
	})
})
const port = 3000
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
