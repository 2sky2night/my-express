import Express from "../express";
import path from "path";
import fs from 'fs'
import Router from "../express/router";

const router01 = new Router('/api/v1')
router01.addRoutes([
  {
    path: '/get',
    controller(req, res) {
      res.end('hello~~')
    },
    method: 'GET'
  }
])
const router02 = new Router({
  rootPath: '/student',
  routes: [
    {
      middlewares: [
        (req, res, next) => {
          if (Date.now() % 2) {
            next(true)
          } else {
            res.setHeader('content-type', 'text')
            res.end('本次中间件取消执行后续中间件')
            next(false)
          }
        }
      ],
      path: '/list',
      controller(_, res) {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(
          [
            {
              name: 'Mark',
              age: 18
            },
            {
              name: 'Jack',
              age: 19
            }
          ]
        ))
      },
      method: 'GET'
    }
  ]
})

router01.addRouter(router02)
console.log(router01);

const server = new Express()
const port = 3030

// 启动监听http请求
server.start()

// 注册全局中间件
server.use(async (req, _res, next) => {
  // await new Promise<void>(r=>setTimeout(()=>{r()},3000))
  const filePath = path.resolve('./src/test/log/log.txt')
  const flag = fs.existsSync(filePath)
  const ws = fs.createWriteStream(filePath, { encoding: 'utf-8', flags: 'a' })
  if (flag) {
    ws.write(`\rTIMESTAMP:${Date.now()}---PATH:${req.path}---METHOD:${req.method}---URL:${req.url}`)
  } else {
    ws.write(`TIMESTAMP:${Date.now()}---PATH:${req.path}---METHOD:${req.method}---URL:${req.url}`)
  }
  ws.close()
  next()
})
server.use((req, res, next) => {
  if (req.path === '/index.html' || req.path === '/') {
    res.setHeader('content-type', 'text/html')
    res.end(`
        <h1>
          你好~~~我是my-express
        </h1>
      `)
  } else {
    next()
  }
})
// 注册路由,将路由注册为全局中间件
server.use(router01.handleRequest())
// 启动服务器
server.listen(port, () => {
  console.log(`http服务已经开启在:http://localhost:${port}`)
})

