import { IContext, IMiddleWare } from '@vergiss/auf-typing'

export function Timeout(config = { timeout: 15000 }): IMiddleWare {
  return async function TimeoutMiddleware(ctx: IContext, next: IMiddleWare) {
    const timeout = new Promise(r => {
      setTimeout(() => r({ hasTimeout: true }), config.timeout);
    });
    const normalResolvedNext = next(ctx).then(() => ({ hasTimeout: false }));

    const result = await Promise.race([
      timeout,
      normalResolvedNext
    ]);

    const { hasTimeout } = result;

    if (hasTimeout) {
      ctx.body = JSON.stringify({
        success: false,
        message: `Request timeout, proceeded ${config.timeout} ms`
      });
      ctx.res.statusCode = 503;
    }
  }
}