import { IContext } from '../interfaces/server';
import { uuid } from '../utils/tools'

const sign = '[static-server]';
const outSign ='<<<';

export function Logger(logger = console) {
  return async function loggerMiddleware(ctx: IContext, next: Function) {
    const { req, res } = ctx;
    const { method, url } = req;
    const now = Date.now();
    const traceId = `${now}___${uuid(5)}___${process.pid}`;
    await next(ctx);
    logger.log(sign, outSign, traceId, outSign, new Date().toISOString(), method, url, 'StatusCode:', res.statusCode, 'Time cost:', Date.now() - now, 'ms');
  }
}