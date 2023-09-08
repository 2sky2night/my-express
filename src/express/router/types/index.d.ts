import { Request, Response,Middlewares } from '../../types'

/**
 * 创建路由的配置项
 */
export interface RouterOption {
  rootPath?: string;
  routes?: Routes
}
/**
 * 路由处理函数
 */
export type RouteHandler = (req: Request, res: Response) => any | Promise<any>

/**
 * 路由元信息
 */
export interface Route {
  /**
   * 路由路径
   */
  path: string;
  /**
   * 控制器
   * @param req 
   * @param res 
   * @returns 
   */
  controller: <Q extends Object = any> (req: Request<Q>, res: Response) => void;
  /**
   * 请求方法
   */
  method: "GET" | "PUT" | "DELETE" | "POST" | "PATCH"
  /**
   * 中间件
   */
  middlewares?: Middlewares
}

/**
 * 路由表
 */
export type Routes = Route[]
