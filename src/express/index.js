"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
/**
 * express构造函数
 */
var Express = /** @class */ (function () {
    function Express() {
        this.server = http_1.default.createServer();
        this.routes = [];
        this.middlewares = [];
    }
    /**
     * 开启服务
     * @param port 端口号
     * @param cb 回调
     */
    Express.prototype.listen = function (port, cb) {
        this.server.listen(port, cb);
    };
    /**
     * 注册全局处理函数
     * @param middleware 中间件
     */
    Express.prototype.use = function (middleware) {
        this.middlewares.push(middleware);
    };
    /**
     * 注册路由
     * @param routes 路由表
     */
    Express.prototype.addRoutes = function (routes) {
        var _this = this;
        routes.forEach(function (route) { return _this.routes.push(route); });
    };
    /**
     * 创建路由(启动监听)
     */
    Express.prototype.createRouter = function () {
        var _this = this;
        this.server.on("request", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var request, flag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = this.initRequest(req);
                        return [4 /*yield*/, this.execMiddleware(request, res, this.middlewares)];
                    case 1:
                        flag = _a.sent();
                        if (!flag) return [3 /*break*/, 3];
                        // 所有中间件被执行了,都放行了
                        // 通过请求上下文去命中路由
                        return [4 /*yield*/, this.hitRouting(request, res)];
                    case 2:
                        // 所有中间件被执行了,都放行了
                        // 通过请求上下文去命中路由
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 执行中间件
     * @param req 请求上下文
     * @param res 响应上下文
     * @param middlewares 中间件们
     * @returns 全局中间件是否都执行了?
     */
    Express.prototype.execMiddleware = function (req, res, middlewares) {
        return __awaiter(this, void 0, void 0, function () {
            var i, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < middlewares.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // 处理某个中间件
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                // 创建next函数
                                var next = function (flag) {
                                    if (flag || flag === undefined) {
                                        // 放行
                                        resolve();
                                    }
                                    else {
                                        // 不放行
                                        reject();
                                    }
                                };
                                // 执行对应中间件
                                middlewares[i](req, res, next);
                            })];
                    case 3:
                        // 处理某个中间件
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        // 捕获某个中间件执行中若执行了next(false)，catch捕获Promise错误，终止循环
                        return [3 /*break*/, 6];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // 所有的中间件是否执行完了?
                    return [2 /*return*/, i === this.middlewares.length];
                }
            });
        });
    };
    /**
     * 命中路由
     * @param req
     * @param res
     */
    Express.prototype.hitRouting = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var path, method, index, route, flag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = req.path, method = req.method;
                        index = this.routes.findIndex(function (route) {
                            return route.path === path && route.method.toUpperCase() === method;
                        });
                        if (!(index === -1)) return [3 /*break*/, 1];
                        // 未匹配到路由
                        res.statusCode = 404;
                        res.setHeader("content-type", "application/json");
                        res.end(JSON.stringify({
                            code: 404,
                            message: "404 not found!",
                            path: path,
                            method: method,
                        }));
                        return [3 /*break*/, 4];
                    case 1:
                        route = this.routes[index];
                        if (!(route.middlewares && route.middlewares.length)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.execMiddleware(req, res, route.middlewares)];
                    case 2:
                        flag = _a.sent();
                        if (!flag) {
                            // 未执行完路由的所有内部中间件
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        // 将请求上下文注入到控制层中
                        route.controller(req, res);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化本次请求时的请求上下文
     * @param req
     * @returns
     */
    Express.prototype.initRequest = function (req) {
        var url = req.url;
        var path = this.getPathname(url);
        var query = this.getQuery(url);
        var queryString = this.getQueryString(url);
        // 初始化request对象
        var request = __assign(__assign({}, req), { path: path, query: query, queryString: queryString });
        return request;
    };
    /**
     * 获取请求资源路径
     * @param url
     * @returns 请求资源路径
     */
    Express.prototype.getPathname = function (url) {
        // 获取到查询参数？的索引
        var index = url.indexOf("?");
        var path = "";
        if (index === -1) {
            // 无查询参数 直接返回
            path = url;
        }
        else {
            // 有查询参数，解析出路径
            path = url.substring(0, index);
        }
        return path;
    };
    /**
     * 获取查询参数字符串
     * @param url
     * @returns 参数字符串
     */
    Express.prototype.getQueryString = function (url) {
        // 获取到查询参数？的索引
        var index = url.indexOf("?");
        if (index === -1) {
            // 无查询参数
            return "";
        }
        else {
            // 有查询参数
            var queryString = url.substring(index + 1);
            return queryString;
        }
    };
    /**
     * 获取查询参数对象
     * @param url
     * @returns 查询参数对象
     */
    Express.prototype.getQuery = function (url) {
        // 获取到查询参数？的索引
        var index = url.indexOf("?");
        if (index === -1) {
            // 无查询参数
            return {};
        }
        else {
            // 有查询参数
            var queryString = url.substring(index + 1);
            return (queryString
                // 切割成键值对的字符串数组
                .split("&")
                // 把元素中的键值对字符串切割开
                .map(function (ele) {
                return ele.split("=");
            })
                // 去除空串key
                .filter(function (ele) {
                return ele[0];
            })
                // 将数组计算成查询参数对象
                .reduce(function (pre, cur) {
                var _a;
                var key = cur[0], value = cur[1];
                return __assign(__assign({}, pre), (_a = {}, _a[key] = value, _a));
            }, {}));
        }
    };
    return Express;
}());
exports.default = Express;
