import { IMiddleWare, IContext } from '@vergiss/auf-typing';
import { RouterMap, dispatchToRouteHandler } from './router-core';

// enum IHttpMethods {
//   GET = 'GET',
//   POST = 'POST',
//   PUT = 'PUT',
//   DELETE = 'DELETE',
//   OPTIONS = 'OPTIONS',
//   PATCH = 'PATCH'
// }

let routerMap: RouterMap;

function RouterMapFactory (base: string = '') {
  if (routerMap) {
    return routerMap;
  }

  routerMap = new RouterMap(base);
  return routerMap;
}

function Router(): IMiddleWare {
  return async function RouterMiddleware(ctx: IContext, next: IMiddleWare) {
    if (ctx.extendInfo) {
      if (ctx.extendInfo.handled) {
        await next(ctx);
        return;
      }
    }

    const { method } = ctx.req;
    const { handler, ctx: wrappedCtx } = await dispatchToRouteHandler(ctx, routerMap.getFromMap(method!)!);

    await handler(wrappedCtx, next);
  }
}

export {
  RouterMapFactory,
  Router
}