const Tour = require('./../models/toursModel')

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

exports.getAllTours = (req, res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status: 'success',
        requestAt: req.requestTime
        // results: tours.length,
        // data: {
        //     tours
        // }
    })
}

exports.getTour = (req, res) => {
    // console.log(req.params)
    const id = req.params.id * 1
    // const tour = tours.find(el => el.id === id)
    // if (id > tours.length) {
    // if (!tour) {
    // 	return res.status(404).json({
    // 		status: 'fail',
    // 		message: 'Invalid ID',
    // 	})
    // }
    // res.status(200).json({
    //     status: 'success',
    //     // results: tours.length,
    //     data: {
    //         tour
    //     }
    // })
}

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save()
        // 写入数据库
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!😟'
        })
    }
}
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Update tour here...>'
        }
    })
}
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}
