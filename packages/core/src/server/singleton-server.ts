import { IContext, IMiddleWare, IServerOptions } from '@vergiss/auf-typing';
import { MiddlewaresAbility } from './middlewares';
import { IServer, IMiddlewareAbility } from './interface';
import { BaseServer } from './base-server';

class Server extends BaseServer implements IServer, IMiddlewareAbility {
  public options: IServerOptions;
  private middlewareAbility: IMiddlewareAbility = new MiddlewaresAbility();
  constructor(options: IServerOptions) {
    super(options);
  }

  setup(listeningCallback?: () => void) {
    super.setup(listeningCallback, async ctx => this.next(ctx))
  }

  next(ctx: IContext) {
    return this.middlewareAbility.next(ctx);
  }

  applyMiddleware(middlewares: IMiddleWare[]) {
    this.middlewareAbility.applyMiddleware(middlewares);
  }
}

export {
  Server
}