import * as http from 'http';
import { Middlewares, IMiddleWare } from './middleware-manager';
import { Router } from './router';

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
  extendInfo?: any;
}

class Context {
  public res: http.ServerResponse;
  public req: http.IncomingMessage;
  public serverOptions: IServerOptions;
  public extendInfo: any;
  private _body: any;
  constructor (req: http.IncomingMessage, res: http.ServerResponse, serverOptions: IServerOptions) {
    this.res = res;
    this.req = req;
    this.serverOptions = serverOptions;
    this._body = {} as any;
    this.extendInfo = {} as any;
  }

  get body() {
    return this._body;
  }

  set body(value: any) {
    this.extendInfo.handled = true;
    this._body = value;
  }
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
      const ctx = new Context(_, res, this.options);
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
        ...middlewares,
        Router()
      ]);
    }
  }
}

export {
  Server
}