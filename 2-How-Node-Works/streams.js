const fs = require('fs')
const { emitWarning } = require('process')
const { pipeline } = require('stream')
const server = require('http').createServer()

server.on('request', (req, res) => {
	// solution 1
	// fs.readFile('./test-file.txt', (err, data) => {
	// 	if (err) console.log(err)
	// 	res.end(data)
	// })
	/*
	// solution 2: streams
	const readable = fs.createReadStream('test-file.txt')
	// once a readable stream that we can comsume, a readable stream emits
	// the data event
	readable.on('data', (chunk) => {
		// write the chunk to a writable stream
		res.write(chunk)
	})
	readable.on('end', () => {
		// end方法表示没有数据再写入于此可写流
		res.end()
	})
	readable.on('error', (err) => {
		console.log(err)
		res.statusCode = 500
		res.end('File not found!')
	})
    */
	//solution 3
	// pipe符可以用于所有可读流，允许我们通过管道输出可读流
	//直接进入可写流的输入
	const readable = fs.createReadStream('test-file.txt')
	// readableSource.pipe(writableDestination)
	readable.pipe(res)
})

server.listen(8000, () => {
	console.log('Listening...')
})
