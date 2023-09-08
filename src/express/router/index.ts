import { Middlewares, Request, Response } from "../types"
import { RouteHandler, RouterOption, Route, Routes } from './types'
class Router {
  /**
   * 路由
   */
  private routes: Routes
  /**
   * 路由根路径
   */
  private rootPath: string | undefined;

  /**
   * 无参构造
   */
  constructor()
  /**
   * 设置根路径构造函数
   * @param rootPath 根路径 
   */
  constructor(rootPath: string)
  /**
   * 配置项式构造函数
   * @param option 
   */
  constructor(option: RouterOption)
  constructor(option?: RouterOption | string | undefined) {
    if (typeof option === 'undefined') {
      // 未传参的构造函数
      this.routes = []
      this.rootPath = undefined
    } else {
      // 传参构造函数
      if (typeof option === 'string') {
        // 设置路由根路径
        this.rootPath = option
        // 注册路由
        this.routes = []
      } else {
        // 传入的配置项
        const { rootPath, routes } = option
        this.rootPath = rootPath
        if (rootPath !== undefined) {
          this.routes = routes ? this.setRoutesPathPrefix(routes) : []
        } else {
          // 未设置根路径
          this.routes = routes ? routes : []
        }
      }
    }
  }

  /**
   * 批量添加路由
   * @param routes 路由表
   */
  addRoutes(routes: Routes) {
    if (this.rootPath === undefined) {
      // 没有设置根路径
      routes.forEach(route => this.routes.push(route))
    } else {
      // 设置了路由根路径
      const _routes = this.setRoutesPathPrefix(routes)
      _routes.forEach(route => this.routes.push(route))
    }
  }

  /**
   * 添加get方法的路由
   */
  get(path: string, handler: RouteHandler): void
  /**
   * 有独享中间件的路由
   */
  get(path: string, middlewares: Middlewares, handler: RouteHandler): void
  get(path: string, middlewares: RouteHandler | Middlewares, handler?: RouteHandler) {

    // 注册的路由路径
    const _path = this.formatPath(path)

    if (handler) {
      // 有中间件的路由
      const route: Route = {
        path: _path,
        controller: handler,
        method: RequestMethod.GET,
        middlewares: middlewares as Middlewares
      }
      this.routes.push(route)
    } else {
      // 无中间件的路由
      const route: Route = {
        path: _path,
        controller: middlewares as RouteHandler,
        method: RequestMethod.GET,
      }
      this.routes.push(route)
    }
  }

  /**
 * 添加post方法的路由
 */
  post(path: string, handler: RouteHandler): void
  /**
   * 有独享中间件的路由
   */
  post(path: string, middlewares: Middlewares, handler: RouteHandler): void
  post(path: string, middlewares: RouteHandler | Middlewares, handler?: RouteHandler) {

    // 注册的路由路径
    const _path = this.formatPath(path)

    if (handler) {
      // 有中间件的路由
      const route: Route = {
        path: _path,
        controller: handler,
        method: RequestMethod.POST,
        middlewares: middlewares as Middlewares
      }
      this.routes.push(route)
    } else {
      // 无中间件的路由
      const route: Route = {
        path: _path,
        controller: middlewares as RouteHandler,
        method: RequestMethod.POST,
      }
      this.routes.push(route)
    }
  }

  /**
   * 注册子路由,默认添加父路由的前缀
   * @param router 子路由
   * @param setPrefix 子路由需不需要添加父路由的路径前缀
   */
  addRouter(router: Router, setPrefix = true) {
    if (this.rootPath === undefined) {
      // 父路由没有根路径 直接注册
      router.routes.forEach(route => this.routes.push(route))
    } else {
      // 父路由有根路径
      if (setPrefix) {
        // 设置根路径
        this.setRoutesPathPrefix(router.routes).forEach(route => this.routes.push(route))
      } else {
        // 不设置根路径,直接注册
        router.routes.forEach(route => this.routes.push(route))
      }
    }
  }

  /**
   * 分发路由，注册为全局中间件，来处理请求
   */
  handleRequest() {
    const context = this
    return (req: Request, res: Response) => {
      context.hitRouting(req, res)
    }
  }

  /**
   * 击中路由
   * @param req 请求上下文
   * @param res 响应上下文
   */
  private async hitRouting(req: Request, res: Response) {
    const { path, method } = req
    const route = this.routes.find(route => route.method === method && route.path === path)
    if (route === undefined) {
      // 未命中
      res.statusCode = 404;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          code: 404,
          message: "404 not found!",
          path,
          method,
        })
      )
    } else {
      // 命中
      if (route.middlewares) {
        // 有中间件
        const flag = await this.execMiddware(req, res, route.middlewares)
        if (flag) {
          // 执行了全部中间件，才能执行后续的处理函数
          route.controller(req, res)
        }
      } else {
        // 无中间件
        route.controller(req, res)
      }
    }
  }
  /**
   * 执行中间件
   * @param req 请求上下文 
   * @param res 响应上下文
   * @param middlewares 中间件们
   * @returns 
   */
  private async execMiddware(req: Request, res: Response, middlewares: Middlewares) {
    let i = 0;
    for (; i < middlewares.length; i++) {
      const middleware = middlewares[i]
      try {
        await new Promise<void>(async (resolve, reject) => {
          const next = (flag = true) => {
            flag ? resolve() : reject()
          }
          await middleware(req, res, next)
        })
      } catch (error) {
        break;
      }
    }
    return i === middlewares.length
  }

  /**
   * 遍历路由表,给每个路由路径添加根路径前缀
   * 调用前注意:根路由不能是undefined!
   */
  private setRoutesPathPrefix(routes: Routes) {
    if (this.rootPath === undefined) throw new Error('根路径未设置，不能调用setRoutesPathPrefix')
    return routes.map(route => {
      return {
        ...route,
        path: `${this.rootPath}${route.path}`
      }
    })
  }
  /**
   * 给path添加根路径前缀
   * @param path path
   * @returns 格式化后path
   */
  private formatPath(path: string) {
    return this.rootPath === undefined ? path : `${this.rootPath}${path}`
  }

}

/**
 * 请求方式枚举
 */
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE"
}


export default Router