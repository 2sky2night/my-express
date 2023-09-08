import Express from "../express";
import path from "path";
import fs from 'fs'

const server = new Express()
const port = 3030

// 创建路由
server.createRouter()
// 注册路由表
server.addRoutes(
  [
    {
      path: '/index.html',
      controller(req, res) {
        res.setHeader('content-type', 'text/html')
        res.end(
          `
        <h1>
          你好世界!
        </h1>
        `
        )
      },
      method: 'GET'
    },
    {
      path: '/',
      controller(req, res) {
        res.setHeader('content-type', 'text/html')
        res.end(
          `
        <h1>
          你好世界!
        </h1>
        `
        )
      },
      method: 'GET'
    },
    {
      path: '/student',
      controller(req, res) {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify([
          {
            name: 'Mark',
            age: 18
          },
          {
            name: 'Jack',
            age: 20
          }
        ]))
      },
      method: "GET"
    },
    {
      path: '/log.txt',
      controller(_req, res) {
        const filePath = path.resolve('./src/test/log/log.txt')
        const flag = fs.existsSync(filePath)
        if (flag) {
          const fileString = fs.readFileSync(filePath, 'utf-8')
          res.setHeader('content-type', 'text')
          res.end(fileString)
        } else {
          res.setHeader('content-type', 'text')
          res.end('log.txt is not exists!')
        }
      },
      method: 'GET'
    }
  ]
)
// 注册全局中间件
server.use((req, _res, next) => {
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
// 启动服务器
server.listen(port, () => {
  console.log(`http服务已经开启在:http://localhost:${port}`)
})

