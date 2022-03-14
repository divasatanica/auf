import http from 'http';
import { Readable } from 'stream';

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
  body: string | Readable | Record<string, any>;
  extendInfo: Record<string, any>;
  get reqBody(): Record<string, any>;
  get query(): Record<string, string>;
  get params(): Record<string, string>; 
}

export interface IMiddleWare {
  (ctx: IContext, next?: IMiddleWare): any;
}