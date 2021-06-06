import * as path from 'path';
import { IContext } from '../interfaces/server';
import { checkMimeTypes } from '../utils/mime-type';

const DefaultMaxAges = {
  'text/html': 60,
  'image/*': 86400,
  'application/javascript': 3600
};

const CacheControlHeaderName = 'Cache-Control';

export function CacheControl(config = DefaultMaxAges) {
  return async function CacheControlMiddleware(ctx: IContext, next: Function) {
    const { res, req } = ctx;
    const { url } = req;
    const extname = path.extname(url!);
    const mimeTypes = checkMimeTypes(extname);



    if (!mimeTypes) {
      await next(ctx);
      return;
    }

    const cacheControlHeader = config[mimeTypes];

    if (typeof cacheControlHeader === 'number') {
      res.setHeader(CacheControlHeaderName, `public, max-age=${cacheControlHeader}`);
    } else if (typeof cacheControlHeader === 'string') {
      res.setHeader(CacheControlHeaderName, cacheControlHeader);
    }

    await next(ctx);
  }
}