import * as fs from 'fs';
import * as path from 'path';
import { IContext } from '@vergiss/auf-core';
import { Engine } from '@vergiss/auf-template-engine';
import { getMD5 } from '@vergiss/auf-helpers';

export function StaticRoutes(options) {
  return async function StaticRoutesMiddleware(ctx: IContext, next: Function) {
    const { template = fs.readFileSync(path.resolve(__dirname, './static/template.html')).toString('utf-8') } = options;
    const { req, serverOptions } = ctx;
    const { url } = req;
    const { assetsRoot } = serverOptions;

    if (!assetsRoot || typeof assetsRoot !== 'string') {
      throw new Error('AssetsRoot must be set');
    }
  
    const resourcePath = assetsRoot + (global.decodeURIComponent(url!) || '');
    try {
      const stat = fs.lstatSync(resourcePath);

      if (stat.isDirectory()) {
        const dirs = fs.readdirSync(resourcePath, {
          withFileTypes: true
        });
        let files = [] as any[];
        dirs.forEach(value => {
          let name = value.name;
          if (value.isDirectory()) {
            name += '/';
          }
          files.push({
            path: path.join(url!, value.name),
            name: name
          });
        })
        ctx.body = Engine.renderWithStream(template, {
          files,
          currentDirectory: global.decodeURIComponent(url!)
        }/*, {
          uglify: true
        }*/);
        ctx.res.statusCode = 200;
        ctx.extendInfo.handled = true;
        await next(ctx);
        return;
      }
  
      if (!stat.isFile()) {
        throw new Error();
      }
    } catch (e) {
      await next(ctx);
      if (ctx.extendInfo.handled) {
        return;
      }
      ctx.body = 'Not Found'
      ctx.res.statusCode = 404;
      return;
    }
    
    const { res } = ctx;
    const etag = await getMD5(resourcePath);
    res.setHeader('Etag', etag);
    ctx.extendInfo.etag = etag;
    ctx.body = fs.createReadStream(resourcePath);
    await next(ctx);
  }
}