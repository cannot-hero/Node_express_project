const fs = require('fs')
const express = require('express')
const morgan = require('morgan')
const app = express()

// middleware  中间件可以修改传入的请求数据 request data
// in the middle of request and response
// 1. MIDDLEWARE
app.use(morgan('dev'))

app.use(express.json()) // 可以获取请求体

app.use((req, res, next) => {
	console.log('Welcome to middleware 😉')
	next()
})
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

// 2. ROUTE handlers
const getAllTours = (req, res) => {
	console.log(req.requestTime)
	res.status(200).json({
		status: 'success',
		requestAt: req.requestTime,
		results: tours.length,
		data: {
			tours,
		},
	})
}

const getTour = (req, res) => {
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
}

const createTour = (req, res) => {
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
}
const updateTour = (req, res) => {
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
}
const deleteTour = (req, res) => {
	if (req.params.id * 1 > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		})
	}
	res.status(204).json({
		status: 'success',
		data: null,
	})
}
// v1 指定api版本
// app.get('/api/v1/tours', getAllTours)
// '/api/v1/tours/:id' url中对应内容赋值给:id
// 路徑中一定要有對應參數，不然會報錯
// '/api/v1/tours/:id/:y?' 加一個問號，讓參數變爲可選參數
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// patch
// app.patch('/api/v1/tours/:id', updateTour)
//delete
// app.delete('/api/v1/tours/:id', deleteTour)

// 3. ROUTE
app.route('/api/v1/tours').get(getAllTours).post(createTour)
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)

// 4. START SERVER
const port = 3000
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
