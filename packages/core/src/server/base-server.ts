import * as http from 'http';
import { IContext, IServerOptions } from '@vergiss/auf-typing';
import { IBaseServer } from './interface';
import { Context } from './context';

class BaseServer implements IBaseServer {
  public options: IServerOptions;
  constructor(options: IServerOptions) {
    this.options = Object.freeze(options);
  }

  setup(listeningCallback?: () => void, handleContext?: (ctx: IContext) => Promise<unknown>): void {
    const { port } = this.options;
    http.createServer(async (_, res) => {
      const ctx = new Context(_, res, this.options);
      try {
        if (handleContext) {
          await handleContext(ctx);
        }
        if (ctx.body == null) {
          res.end('');
          return;
        }
  
        if (ctx.body.readable) {
          ctx.body.pipe(res);
        } else {
          res.end(ctx.body);
        }
      } catch (e) {
        res.end(JSON.stringify({
          success: false,
          message: e
        }))
      }
    }).listen({
      port
    }, listeningCallback);
  };
}

export {
  BaseServer
}