import * as http from 'http';

export interface IServer {
  setup(listeningCallback?: () => void): void;
  applyMiddleware(middlewares: IMiddleWare[]): void; 
  options: IServerOptions;
}

export interface IBaseServer {
  options: IServerOptions;
  setup(listeningCallback?: () => void): void;
}

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

export interface IClusterServerOptions extends IServerOptions {
  workerNum?: number;
}

export interface IMiddleWare {
  (ctx: IContext, next?: IMiddleWare): any;
}

export interface IMiddlewareAbility {
  next(ctx: IContext): Promise<unknown>;
  applyMiddleware(middlewares: IMiddleWare[]): void 
}