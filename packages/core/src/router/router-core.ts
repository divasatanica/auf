import { IContext } from '../server';
import { makeRouteTree, IRouterTree } from './prefix-tree';

const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];

class RouterMap {
  public routerMap: Map<string, IRouterTree> = new Map();

  constructor () {
    methods.forEach(method => {
      this.routerMap.set(method, makeRouteTree());
    });
  }

  register(method: string, urlPattern: string | RegExp, handler: Function) {
    const methodRouterTree = this.routerMap.get(method);

    if (!methodRouterTree) {
      return;
    }

    if (typeof urlPattern === 'string') {
      methodRouterTree.addToTree(urlPattern, handler);
    } else {
      methodRouterTree.addRegExpToTree(urlPattern, handler);
    }
  }

  getFromMap(method: string) {
    return this.routerMap.get(method);
  }

  get(urlPattern: string, handler: Function) {
    return this.register('GET', urlPattern, handler);
  }

  post(urlPattern: string, handler: Function) {
    return this.register('POST', urlPattern, handler);
  }

  delete(urlPattern: string, handler: Function) {
    return this.register('DELETE', urlPattern, handler);
  }

  put(urlPattern: string, handler: Function) {
    return this.register('PUT', urlPattern, handler);
  }

  patch(urlPattern: string, handler: Function) {
    return this.register('PATCH', urlPattern, handler);
  }

  options(urlPattern: string, handler: Function) {
    return this.register('OPTIONS', urlPattern, handler);
  }
}

/**
 * Add params/body/query data to the context object.
 * @param ctx Context object
 * @param url Request URL
 * @param urlPattern Matched URL pattern
 * @returns Wrapped context object with params
 */
async function wrapCtx (ctx: IContext, url: string, urlPattern: string | RegExp) {
  ctx.extendInfo = ctx.extendInfo || {};
  await wrapCtxWithQueryOrBody(ctx, url);
  const [urlWithParams] = url.split('?');
  let params = Object.create(null);

  if (typeof urlPattern !== 'string') {
    const result = url.match(urlPattern);

    if (result != null) {
      const [_, ...matched] = result;

      params = matched;
    }
  } else {
    const urlComponents = urlWithParams.split('/');
    const urlPatternComponents = urlPattern.split('/');
    for (let i = 0, len = urlPatternComponents.length; i < len; i ++) {
      const urlPatternComponent = urlPatternComponents[i];
      const urlComponent = urlComponents[i];
  
      if (urlPatternComponent.indexOf(':') < 0) {
        continue;
      }
  
      params[urlPatternComponent.replace(':', '')] = urlComponent;
    }
  }

  ctx.extendInfo.params = params;
  return ctx;
}

async function wrapCtxWithQueryOrBody(ctx: IContext, url: string) {
  const [_, queryString = ''] = url.split('?');
  const query = queryString.split('&').reduce((acc, curr) => {
    if (!curr) {
      return acc;
    }
    const [key, value] = curr.split('=');
    return {
      ...acc,
      [key]: value
    }
  }, Object.create(null));

  let data = '';
  ctx.req.on('data', chunk => {
    data += chunk;
  });

  const readReq = new Promise<void>((resolve, reject) => {
    ctx.req.on('end', () => {
      const body = data.split('&').reduce((acc, curr) => {
        if (!curr) {
          return acc;
        }
        const [key, value] = curr.split('=');
        return {
          ...acc,
          [decodeURIComponent(key)]: decodeURIComponent(value)
        }
      }, Object.create(null));
      resolve(body);
    });

    ctx.req.on('error', err => {
      reject(err);
    });
  })

  const parsedBody = await readReq;

  ctx.extendInfo.query = query;
  ctx.extendInfo.body = parsedBody;
}

async function dispatchToRouteHandler(ctx: IContext, routerTree: IRouterTree) {
  const { url } = ctx.req;
  const { handler, path } = routerTree.getHandlerFromTree(url!);

  const wrappedCtx = await wrapCtx(ctx, url!, path);

  return {
    ctx: wrappedCtx,
    handler
  }
}

export {
  dispatchToRouteHandler,
  RouterMap
}