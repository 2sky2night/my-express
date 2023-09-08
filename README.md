### 安装本地运行依赖

```shell
  pnpm install
```

### 测试项目启动

在终端执行下列命令会运行 src/test/index.ts 项目，用来测试库相关功能如，中间件、路由注册、路由下发、注册子路由

```shell
  pnpm run dev
```

### 概述

express 主模块和 router 模块
express 主模块提供：创建 express 实例、注册中间件、开启 http 请求监听的功能
router 模块提供了：根据路由表注册路由、注册 get、post 等请求方式的路由、添加子路由、设置路由根路径等功能

### express

#### Express 构造函数

创建 express 实例

```js
const app = new Express();
```

#### express.start 开启 http 请求监听

调用该方法后，会监听 request 事件，并执行所有注册的全局中间件

```js
const app = new Express();
app.start();
```

#### express.listen 开启服务器应用

和原生 http.listen 效果一样

```js
const app = new Express();
app.listen(3000, () => {
  console.log("开启服务器成功!");
});
```

#### express.use 注册全局中间件

express 中间件的 req 继承了原有的 req 请求上下文，新增了 path、query、queryString 对象,res 是原生的响应上下文，next 函数可以决定是否执行下一个中间件

```js
const app = new Express();
app.use((req, res, next) => {
  req.path; // 请求资源路径
  req.query; // 解析出来的查询参数对象
  req.queryString; // 查询参数字符串
  next(); // 放行此次中间件
  next(true); // 放行此次中间件
  next(false); // 不方向，后续中间件不再执行
});
```

### Router

#### router 构造函数

构造函数可以创建一个路由，可以同时配置路由的根路径以及注册路由表，通过函数重载实现了多种参数的构造函数

```js
const router = new Router(); //无参
const router = new Router("/api"); // 初始化请求根路径，后续注册的路由都会带上该请求前缀
const router = new Router({ rootPath: "/api", routes: [] }); // 同上功能，并初始化路由
```

#### addRoutes

批量注册路由,注册的路由会根据是否有根路径来添加路径前缀。

```js
const rouer = new Router();
router.addRoutes([]);
```

#### 方法路由

使用 post、get 等实例方法来快速注册路由，同时也支持注册独享路由中间件，会优先执行中间件，然后再执行路由控制器

```js
const rouer = new Router();
// 注册路由
router.get("/hello", (_, res) => {
  console.log("hello");
  res.end("ok");
});
// 注册路由并配置独享中间件
router.post(
  "/test",
  [
    (req, res, next) => {
      console.log("中间件");
      next();
    },
  ],
  (req, res) => {
    res.end("ok");
  }
);
```

#### 注册子路由

注册子路由，可以让父路由器集成子路由器的所有路由，可以让子路由继承或不继承父路由的路径前缀。注意该方法是让父路由器集成子路由器的所有子路由!也就是父路由器拥有子路由器的所有路由表

```js
const router01 = new Router("/api");
const router02 = new Router("/user"); // 变成 /api/user/...
const router03 = new Router("/static", false); // 变成 /static
router01.addRouter(router02);
```

#### 路由中间件

通过 express 的 use 方法注册中间件，把路由器作为全局中间件，去下发到对应的路由器中，再命中路由执行对应的路由处理函数

```js
const router = new Router();
app.use(router.handleRequest());
```
