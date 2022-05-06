import { IContext, IServerOptions, IMiddleWare  } from '@vergiss/auf-typing';

export interface IServer {
  setup(listeningCallback?: () => void): void;
  applyMiddleware(middlewares: IMiddleWare[]): void; 
  options: IServerOptions;
}

export interface IBaseServer {
  options: IServerOptions;
  setup(listeningCallback?: () => void): void;
}

export interface IClusterServerOptions extends IServerOptions {
  workerNum?: number;
}

export interface IMiddlewareAbility {
  next(ctx: IContext): void;
  applyMiddleware(middlewares: IMiddleWare[]): void 
}