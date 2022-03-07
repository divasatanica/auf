import { compose } from '@vergiss/auf-helpers';
import { IContext } from './server';

export interface IMiddleWare {
  (ctx: IContext, next?: IMiddleWare): any;
}

export class Middlewares {
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