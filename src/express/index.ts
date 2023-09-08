import http from 'http'
import { Middleware, Middlewares, Request, Response, Next } from './types';

/**
 * express构造函数
 */
class Express {
  /**
   * http服务实例
   */
  private server: http.Server
  /**
   * 全局中间件
   */
  private middlewares: Middlewares
  constructor() {
    this.server = http.createServer();
    this.middlewares = [];
  }
  /**
   * 开启服务
   * @param port 端口号 
   * @param cb 回调
   */
  listen(port: number, cb?: any) {
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
   * 启动http请求监听
   */
  start() {
    this.server.on("request", (req, res) => {
      const request = this.initRequest(req);
      // 执行全局中间件
      this.execMiddleware(request, res, this.middlewares);
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
        await new Promise<void>(async (resolve, reject) => {
          // 创建next函数
          const next: Next = (flag = true) => {
            if (flag) {
              resolve()
            } else {
              reject()
            }
          };
          // 执行对应中间件
          await middlewares[i](req, res, next);
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