import { compose } from './utils/functional';
import { IContext } from './interfaces/server';

export class Middlewares {
  public middlewares: Function[];
  constructor (middlewares: Function[]) {
    this.middlewares = middlewares
  }

  applyMiddlewares(): (ctx: IContext) => void {
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