import { IContext } from '../interfaces/server';

export function ErrorBoundary(options) {

  const { errorHandler = console.error } = options

  return async function ErrorBoundaryMiddleware(ctx: IContext, next?) {
    try {
      await next(ctx);
    } catch (e) {
      ctx.body = `Error: ${e.message}`;
      ctx.res.statusCode = 500;
      errorHandler(e);

    }
  } 
}
