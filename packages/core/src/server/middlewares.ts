import { compose } from '@vergiss/auf-helpers';
import { IContext, IMiddleWare } from '@vergiss/auf-typing';
import { IMiddlewareAbility } from './interface';

class Middlewares {
  public middlewares: Function[];
  constructor (middlewares: Function[]) {
    this.middlewares = middlewares
  }

  applyMiddlewares(): (ctx: IContext) => Promise<unknown> {
    this.middlewares = this.middlewares.map(fn => {
      return function (next = (() => Promise.resolve())) {
        return async function (ctx: IContext) {
          await fn(ctx, next);
        }
      }
    })
    const [lastActionGenerator, ...restActionGenerators] = this.middlewares.reverse();

    return compose(restActionGenerators)(lastActionGenerator());
  }
}

export class MiddlewaresAbility implements IMiddlewareAbility {
  next: (ctx: IContext) => Promise<unknown>;
  private middleware: Middlewares;
  applyMiddleware(middlewares: IMiddleWare[]): void {
    this.middleware = new Middlewares(middlewares);
    this.next = this.middleware.applyMiddlewares();
  }
}