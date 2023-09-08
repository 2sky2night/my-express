const Express = require("../express/index");

const server = new Express();

/**
 * @type {import('../express').Routes}
 */
const routes = [
  {
    path: "/hello",
    controller: (req, res) => {
      console.log(req.m1);
      res.end("ok");
    },
    method: "GET",
  },
];

// 注册中间件
server.use((req, res, next) => {
  console.log("中间件01");
  next(true);
  req.m1='中间件01存放的东西'
});
server.use((req, res, next) => {
  console.log('中间件02');
  next(true)
})
// 注册路由
server.addRoutes(routes);
// 启动路由监听
server.createRouter();
// 开启服务
server.listen(3001, () => {
  console.log("开启服务");
});
