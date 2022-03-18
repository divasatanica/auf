import { compose } from '@vergiss/auf-helpers';
import { IContext, IMiddleWare } from '@vergiss/auf-typing';
import { IMiddlewareAbility } from './interface';

class Middlewares {
  private middlewares: Array<IMiddleWare>;
  private wrappedMiddlewares: Array<(fn?: IMiddleWare) => void>;
  constructor (middlewares: IMiddleWare[]) {
    this.middlewares = middlewares
  }

  applyMiddlewares(): (ctx: IContext) => void {
    this.wrappedMiddlewares = this.middlewares.map(fn => {
      return function (next = (() => Promise.resolve())) {
        return async function (ctx: IContext) {
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
    this.next = this.middleware.applyMiddlewares();
  }
}