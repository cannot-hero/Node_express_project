const fs = require('fs')
const crypto = require('crypto')

const start = Date.now()
process.env.UV_THREADPOOL_SIZE = 1
setTimeout(() => console.log('timer 1 finished'), 0)
setImmediate(() => console.log('Immediate 1 finshed'))

fs.readFile('./test-file.txt', () => {
	console.log('I/O finished')
	console.log('-------------------------')
	setTimeout(() => console.log('timer 2 finished'), 0)
	setTimeout(() => console.log('timer 3 finished'), 3000)
	setImmediate(() => console.log('Immediate 2 finshed'))

	process.nextTick(() => console.log('Process.nextTick'))
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password ensrypted')
	})
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password ensrypted')
	})
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password ensrypted')
	})
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password ensrypted')
	})
})

console.log('Hello from top-level code')
