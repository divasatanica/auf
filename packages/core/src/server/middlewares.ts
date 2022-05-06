import { compose } from '@vergiss/auf-helpers';
import { IContext, IMiddleWare } from '@vergiss/auf-typing';
import { IMiddlewareAbility } from './interface';

/**
 * Check if a middleware is called multiple times. It has side effect.
 * @param fn The middleware function
 * @param ctx Context object
 */
function checkIfMultipleVisited (fn: IMiddleWare, ctx: IContext) {
  if (ctx.extendInfo.visMap.has(fn)) {
    throw new Error('The "next" method can\'t be called multiple times.');
  }
  ctx.extendInfo.visMap.add(fn);
}

/**
 * Returns a resolved promise as the middlewares chain's tail.
 * @param ctx Context object
 */
function wrapResolvedPromise (ctx: IContext) {
  checkIfMultipleVisited(wrapResolvedPromise, ctx);
  return Promise.resolve();
}

class Middlewares {
  private middlewares: Array<IMiddleWare>;
  private wrappedMiddlewares: Array<(fn?: IMiddleWare) => void>;
  constructor (middlewares: IMiddleWare[]) {
    this.middlewares = middlewares
  }

  getMiddlewareChain(): (ctx: IContext) => void {
    this.wrappedMiddlewares = this.middlewares.map(fn => {
      return function (next = wrapResolvedPromise) {
        return async function (ctx: IContext) {
          checkIfMultipleVisited(fn, ctx);
          await fn(ctx, next);
        }
      }
    });
    const [lastActionGenerator, ...restActionGenerators] = this.wrappedMiddlewares.reverse();

    return compose(restActionGenerators)(lastActionGenerator());
  }
}

export class MiddlewaresAbility implements IMiddlewareAbility {
  next: (ctx: IContext) => void;
  private middleware: Middlewares;
  applyMiddleware(middlewares: IMiddleWare[]): void {
    this.middleware = new Middlewares(middlewares);
    this.next = this.middleware.getMiddlewareChain();
  }
}