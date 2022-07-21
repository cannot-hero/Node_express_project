// fs 读取数据和写入数据的函数
const fs = require("fs");
const http = require('http')
/*****************files****************/
/*
// 同步 阻塞
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);
const textOut = `what is shushu doing ? \n${textIn} \nCreate on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("file written");
// no blocking async
fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
    fs.readFile(`./txt/${data}.txt`, "utf-8", (err, data2) => {
        console.log(data2);
    });
});

fs.writeFile()

console.log("will read file");
*/
/******************server**********************/
/**
 * first create a server 
 * second start a server
 */
const url = require('url')
// 顶级代码，只执行一次  所以同步的代码执行  不用担心阻塞
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)

const server = http.createServer((req, res) => {
    // send a simple response
    // console.log(req.url)
    const pathName = req.url
    if (pathName === '/') {
        res.end('Hello from the server created by shushu')
    } else if (pathName === '/product') {
        res.end('this is PRODUCT')
    } else if (pathName === '/api') {
        res.writeHead(200, {
            'Content-type': 'application/json'
        })
        // 注意这里是data  而不是productData
        res.end(data)
    } else {
        //      status👇  header 👇
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        })
        res.end('<h1>Page NOT FOUND</h1>')
    }
})

server.listen(4000, () => {
    console.log('listening to requests on port 4000')
})