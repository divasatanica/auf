import { IContext, IMiddleWare } from '@vergiss/auf-typing'
import { uuid } from '@vergiss/auf-helpers';

const sign = '[static-server]';
const outSign ='<<<';

interface ILogger {
  log(...message: unknown[]): void;
}

export function Logger(logger: ILogger = console): IMiddleWare {
  return async function loggerMiddleware(ctx: IContext, next: IMiddleWare) {
    const { req, res } = ctx;
    const { method, url } = req;
    const now = Date.now();
    const traceId = `${now}___${uuid(5)}___${process.pid}`;
    await next(ctx);
    logger.log(sign, outSign, traceId, outSign, new Date().toISOString(), method, url, 'StatusCode:', res.statusCode, 'Time cost:', Date.now() - now, 'ms');
  }
}