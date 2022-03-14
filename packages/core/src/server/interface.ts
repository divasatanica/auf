import { IContext, IServerOptions, IMiddleWare  } from '@vergiss/auf-typing';
export { IContext, IServerOptions, IMiddleWare }

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
  next(ctx: IContext): Promise<unknown>;
  applyMiddleware(middlewares: IMiddleWare[]): void 
}