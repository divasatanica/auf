import { IContext } from '../server';
import { RouterMap, dispatchToRouteHandler } from './router-core';

// enum IHttpMethods {
//   GET = 'GET',
//   POST = 'POST',
//   PUT = 'PUT',
//   DELETE = 'DELETE',
//   OPTIONS = 'OPTIONS',
//   PATCH = 'PATCH'
// }

const routerMap = new RouterMap();

function Router() {
  return async function RouterMiddleware(ctx: IContext, next: Function) {
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
  routerMap,
  Router
}