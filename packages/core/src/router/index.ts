import { IContext } from '../server';

export function Router() {
  // TODO
  return async function RouterMiddleware(ctx: IContext, next: Function) {
    if (ctx.extendInfo) {
      if (ctx.extendInfo.handled) {
        await next(ctx);
        return;
      }
    }


    ctx.body = 'hello world';
    ctx.res.statusCode = 200;
  }
}