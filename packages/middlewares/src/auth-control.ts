import * as path from 'path';
import { IContext, IMiddleWare } from '@vergiss/auf-typing';

export function AuthControl(options): IMiddleWare {
  return async function AuthControlMiddleware(ctx: IContext, next: IMiddleWare) {
    const { whitelist = [] } = options;
    const { req, serverOptions } = ctx;
    const { url = '' } = req;
    const { assetsRoot } = serverOptions;
    const requestUrl = path.resolve(assetsRoot, url);

    let authorizedPath = false;
    for (let i = 0, len = whitelist.length; i < len; i ++) {
      let whitelistUrl = path.resolve(assetsRoot, whitelist[i]);

      if (whitelistUrl[whitelistUrl.length - 1] !== '/') {
        whitelistUrl += '/';
      }

      if (requestUrl.indexOf(whitelistUrl) === 0) {
        authorizedPath = true;
      }
    }

    if (authorizedPath) {
      await next(ctx);
    } else {
      ctx.res.statusCode = 403;
      ctx.body = 'Forbidden Path';
      return;
    }
  }
}