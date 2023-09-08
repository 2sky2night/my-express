import http from 'http'

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
export type Middleware = (req: Request, res: Response, next: Next) => Promise<any> | any

/**
 * next函数
 */
export type Next = (flag?: boolean) => void

/**
 * 中间件列表
 */
export type Middlewares = Middleware[]
