const http = require("http");

module.exports = class Express {
  constructor() {
    /**
     * http应用实例
     * @type {http.Server}
     */
    this.server = http.createServer();
    /**
     * 路由表
     * @type {import('../express').Routes}
     */
    this.routes = [];
    /**
     * 中间件
     * @type {import('../express').Middlewares}
     */
    this.middlewares = [];
  }
  /**
   * 开启服务
   * @param {number} port 端口
   * @param {Function} cb 回调
   */
  listen(port, cb) {
    this.server.listen(port, cb);
  }
  /**
   * 注册全局中间件
   * @param {import('../express').Middleware} middleware
   */
  use(middleware) {
    this.middlewares.push(middleware);
  }
  /**
   * 注册路由表
   * @param {import('../express').Routes} routes
   */
  addRoutes(routes) {
    routes.forEach((route) => this.routes.push(route));
  }
  /**
   * 创建路由(启动监听)
   */
  createRouter() {
    this.server.on("request", async (req, res) => {
      const request = this.initRequest(req);
      // 执行中间件
      const flag = await this.execMiddleware(request, res);
      if (flag) {
        // 所有中间件被执行了,都放行了
        // 通过请求上下文去命中路由
        this.hitRouting(request, res);
      }
    });
  }
  /**
   * 执行中间件
   * @param {import('../express').Request} req
   * @param {http.ServerResponse} res
   * @returns 所有中间件是否执行完了?
   */
  async execMiddleware(req, res) {
    let i = 0;
    loop: for (; i < this.middlewares.length; i++) {
      try {
        // 处理某个中间件
        await new Promise((resolve, reject) => {
          // 创建next函数
          const next = (flag) => {
            if (flag || flag === undefined) {
              // 放行
              resolve();
            } else {
              // 不放行
              reject();
            }
          };
          // 执行对应中间件
          this.middlewares[i](req, res, next);
        });
      } catch (error) {
        // next(false)中间件循环
        break loop;
      }
    }

    // 所有的中间件是否执行完了?
    return i === this.middlewares.length;
  }
  /**
   * 命中路由
   * @param {import('../express').Request} req
   * @param {http.ServerResponse} res
   */
  hitRouting(req, res) {
    const { path, method } = req;
    // 匹配路由
    const index = this.routes.findIndex((route) => {
      return route.path === path && route.method.toUpperCase() === method;
    });

    if (index === -1) {
      // 未匹配到路由
      res.statusCode = 404;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          code: 404,
          message: "404 not found!",
          path,
          method,
        })
      );
    } else {
      // 匹配到路由了
      const route = this.routes[index];
      // 将请求上下文注入到控制层中
      route.controller(req, res);
    }
  }
  /**
   * 初始化request上下文
   * @param {http.IncomingMessage} req
   */
  initRequest(req) {
    const path = this.getPathname(req.url);
    const query = this.getQuery(req.url);
    const queryString = this.getQueryString(req.url);
    // 初始化request对象
    const request = {
      ...req,
      path,
      query,
      queryString,
    };
    return request;
  }
  /**
   * 获取请求资源路径
   * @param {string} url 请求资源路径
   */
  getPathname(url) {
    // 获取到查询参数？的索引
    const index = url.indexOf("?");
    let path = "";
    if (index === -1) {
      // 无查询参数 直接返回
      path = url;
    } else {
      // 有查询参数，解析出路径
      path = url.substring(0, index);
    }
    return path;
  }
  /**
   * 获取查询参数字符串型
   * @param {string} url
   */
  getQueryString(url) {
    // 获取到查询参数？的索引
    const index = url.indexOf("?");
    if (index === -1) {
      // 无查询参数
      return "";
    } else {
      // 有查询参数
      const queryString = url.substring(index + 1);
      return queryString;
    }
  }
  /**
   * 获取查询参数
   * @param {string} url
   * @returns
   */
  getQuery(url) {
    // 获取到查询参数？的索引
    const index = url.indexOf("?");
    if (index === -1) {
      // 无查询参数
      return {};
    } else {
      // 有查询参数
      const queryString = url.substring(index + 1);
      return (
        queryString
          // 切割成键值对的字符串数组
          .split("&")
          // 把元素中的键值对字符串切割开
          .map((ele) => {
            return ele.split("=");
          })
          // 去除空串key
          .filter((ele) => {
            return ele[0];
          })
          // 将数组计算成查询参数对象
          .reduce((pre, cur) => {
            const [key, value] = cur;
            return {
              ...pre,
              [key]: value,
            };
          }, {})
      );
    }
  }
};
