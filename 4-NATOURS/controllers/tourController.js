const fs = require('fs')

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

exports.getAllTours = (req, res) => {
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

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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
exports.updateTour = (req, res) => {
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
exports.deleteTour = (req, res) => {
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
