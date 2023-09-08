import http from 'http'


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
  method: Method | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /**
   * 中间件
   */
  middlewares?: Middlewares
}

/**
 * 请求上下文
 */
export interface Request<Q extends Object = any> extends http.IncomingMessage {
  /**
   * 请求路径
   */
  path: string;
  /**
   * 查询参数
   */
  query: Q;
  /**
   * 查询参数字符串
   */
  queryString: string;
}

/**
 * 响应上下文
 */
export interface Response extends http.ServerResponse {

}

/**
 * 中间件
 */
export type Middleware = (req: Request, res: Response, next: Next) => void

/**
 * next函数
 */
export type Next = (flag?: boolean | undefined) => void

/**
 * 中间件列表
 */
export type Middlewares = Middleware[]

/**
 * 请求方式
 */
export type Method = RequestMethod

/**
 * 请求方式枚举
 */
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST'
}

/**
 * 路由表
 */
export type Routes = Route[]
