import { resolve } from 'path';
import { readFileSync } from 'fs';
import { IContext, IMiddleWare } from '@vergiss/auf-typing';
import { isCommonError } from '@vergiss/auf-helpers';
import { Engine } from '@vergiss/auf-template-engine';

interface IErrorBoundaryOptions {
  errorHandler(err: any): void;
  renderError?: boolean | ((ctx: IContext) => boolean);
}

export function ErrorBoundary(options: IErrorBoundaryOptions): IMiddleWare {

  const { errorHandler = console.error, renderError } = options

  return async function ErrorBoundaryMiddleware(ctx: IContext, next: IMiddleWare) {
    try {
      await next(ctx);
    } catch (e) {
      const shouldRenderError = typeof renderError === 'function' ? renderError(ctx) : !!renderError;
      if (isCommonError(e) && shouldRenderError) {
        ctx.body = Engine.renderWithStream(
          readFileSync(resolve(__dirname, './static/error.html')).toString('utf-8'),
          {
            ...e,
            stack: e.stack && e.stack.replace(/\<(\w+)\>/g, '&lt$1&gt') || ''
          }
        );
      } else {
        ctx.body = JSON.stringify({
          message: `Error: ${e.message}`,
          success: false
        });
      }
      ctx.res.statusCode = e.statusCode || 500;
      ctx.res.statusMessage = e.statusMessage || 'Internal Error';
      errorHandler(e);
    }
  } 
}
