import http from 'http'
import { Route, Middleware, Middlewares, Routes, Request, Response, Next } from './types';

/**
 * express构造函数
 */
class Express {
  /**
   * http服务实例
   */
  private server: http.Server
  /**
   * 路由表
   */
  private routes: Routes
  /**
   * 全局中间件
   */
  private middlewares: Middlewares
  constructor() {
    this.server = http.createServer();
    this.routes = [];
    this.middlewares = [];
  }
  /**
   * 开启服务
   * @param port 端口号 
   * @param cb 回调
   */
  listen(port: number, cb: any) {
    this.server.listen(port, cb);
  }
  /**
   * 注册全局处理函数
   * @param middleware 中间件
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }
  /**
   * 注册路由
   * @param routes 路由表
   */
  addRoutes(routes: Routes) {
    routes.forEach((route) => this.routes.push(route));
  }
  /**
   * 创建路由(启动监听)
   */
  createRouter() {
    this.server.on("request", async (req, res) => {
      const request = this.initRequest(req);
      // 执行全局中间件
      const flag = await this.execMiddleware(request, res, this.middlewares);
      if (flag) {
        // 所有中间件被执行了,都放行了
        // 通过请求上下文去命中路由
        await this.hitRouting(request, res);
      }
    });
  }
  /**
   * 执行中间件
   * @param req 请求上下文
   * @param res 响应上下文
   * @param middlewares 中间件们
   * @returns 全局中间件是否都执行了?
   */
  private async execMiddleware(req: Request, res: Response, middlewares: Middlewares) {
    let i = 0;
    loop: for (; i < middlewares.length; i++) {
      try {
        // 处理某个中间件
        await new Promise<void>((resolve, reject) => {
          // 创建next函数
          const next: Next = (flag) => {
            if (flag || flag === undefined) {
              // 放行
              resolve();
            } else {
              // 不放行
              reject();
            }
          };
          // 执行对应中间件
          middlewares[i](req, res, next);
        });
      } catch (error) {
        // 捕获某个中间件执行中若执行了next(false)，catch捕获Promise错误，终止循环
        break loop;
      }
    }

    // 所有的中间件是否执行完了?
    return i === this.middlewares.length;
  }
  /**
   * 命中路由
   * @param req 
   * @param res 
   */
  private async hitRouting(req: Request, res: Response) {
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
      // 执行中间件
      if (route.middlewares && route.middlewares.length) {
        const flag = await this.execMiddleware(req, res, route.middlewares)
        if (!flag) {
          // 未执行完路由的所有内部中间件
          return
        }
      }
      // 将请求上下文注入到控制层中
      route.controller(req, res);
    }
  }
  /**
   * 初始化本次请求时的请求上下文
   * @param req 
   * @returns 
   */
  private initRequest(req: http.IncomingMessage) {
    const url = req.url as string
    const path = this.getPathname(url);
    const query = this.getQuery(url);
    const queryString = this.getQueryString(url);
    // 初始化request对象
    const request = {
      ...req,
      path,
      query,
      queryString,
    } as Request;
    return request;
  }
  /**
   * 获取请求资源路径
   * @param url 
   * @returns 请求资源路径
   */
  private getPathname(url: string) {
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
   * 获取查询参数字符串
   * @param url
   * @returns 参数字符串
   */
  private getQueryString(url: string) {
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
   * 获取查询参数对象
   * @param url 
   * @returns 查询参数对象
   */
  private getQuery(url: string) {
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
}

export default Express