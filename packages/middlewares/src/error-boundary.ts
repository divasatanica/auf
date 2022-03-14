import { IContext, IMiddleWare } from '@vergiss/auf-typing'

export function ErrorBoundary(options): IMiddleWare {

  const { errorHandler = console.error } = options

  return async function ErrorBoundaryMiddleware(ctx: IContext, next: IMiddleWare) {
    try {
      await next(ctx);
    } catch (e) {
      ctx.body = JSON.stringify({
        message: `Error: ${e.message}`,
        success: false
      });
      ctx.res.statusCode = e.statusCode || 500;
      ctx.res.statusMessage = e.statusMessage || 'Internal Error';
      errorHandler(e);
    }
  } 
}
