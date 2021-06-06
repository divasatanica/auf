import * as http from 'http';
import { Middlewares, IMiddleWare } from './middleware-manager';

export interface IServerOptions {
  port: number;
  assetsRoot: string;
  timeout?: number;
  listeningCallback?: () => void;
  errorHandler?: (e: Error) => void;
}

export interface IContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  serverOptions: IServerOptions;
  body?: any;
}

class Server {
  public options: IServerOptions;
  private next: (ctx: IContext) => void;
  private middlewareMgr: Middlewares;
  constructor(options: IServerOptions) {
    this.options = options;
  }

  setup(listeningCallback?: () => void) {
    const { port } = this.options;
    this.next = this.middlewareMgr.applyMiddlewares();
    http.createServer(async (_, res) => {
      const ctx = {
        res,
        req: _,
        body: {} as any,
        serverOptions: this.options
      };
      await this.next(ctx);
      if (ctx.body == null) {
        res.end('');
        return;
      }

      if (ctx.body.readable) {
        ctx.body.pipe(res);
      } else {
        res.end(ctx.body);
      }
    }).listen({
      port
    }, listeningCallback);
  }

  applyMiddleware(middlewares: IMiddleWare[]) {
    if (!this.middlewareMgr) {
      this.middlewareMgr = new Middlewares([
        ...middlewares
      ]);
    }
  }
}

export {
  Server
}