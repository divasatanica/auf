import * as path from 'path';
import { IContext } from '@vergiss/auf-core';

export function AuthControl(options) {
  return async function AuthControlMiddleware(ctx: IContext, next: Function) {
    const { whitelist = [] } = options;
    const { req, serverOptions } = ctx;
    const { url = '' } = req;
    const { assetsRoot } = serverOptions;
    const requestUrl = path.resolve(assetsRoot, url);

    let authorizedPath = false;
    for (let i = 0, len = whitelist.length; i < len; i ++) {
      const whitelistUrl = path.resolve(assetsRoot, whitelist[i]);

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