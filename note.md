不用node构建app的场景

需要很大量的服务端处理(super heavey server process)， 图像处理，视频转换，文件压缩类似的东西

Ruby PHP  python

# Node farm

## 15 parsing variable from URLs

```js
const { query, pathname } = url.parse(req.url, true)
```

## 16 using modules

nodejs每一个文件都被视为 a module

## 18 types of packages and installs

packages: regular dependencies & development dependencies

```js
// development dependencies
npm i nodemon --save-dev
```

```js
npm i nodemon --global
```

```js
npm run xxx
//实际上是npm执行scripts  然后从devDependencies中找可以运行相应脚本的包
```

## 19 3rd party modules
使用第三方库时多看看文档呗
