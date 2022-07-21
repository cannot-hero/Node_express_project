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
const server = http.createServer((req, res) => {
    // send a simple response
    // console.log(req.url)
    const pathName = req.url
    if (pathName === '/') {
        res.end('Hello from the server created by shushu')
    } else if (pathName === '/product') {
        res.end('this is PRODUCT')
    } else {
        //      status👇  header 👇
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        })
        res.end('<h1>Page NOT FOUND</h1>')
    }
})

server.listen(8000, () => {
    console.log('listening to requests on port 8000')
})