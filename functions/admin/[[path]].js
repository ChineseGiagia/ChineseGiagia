// 兜底：/admin/* 显式路由鉴权，即使根级中间件因平台原因未拦截静态资源，也不会放行
export { onRequest } from "../_middleware.js";
