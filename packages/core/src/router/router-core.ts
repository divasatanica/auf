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

  register(method: string, urlPattern: string, handler: Function) {
    const methodRouterTree = this.routerMap.get(method);

    if (!methodRouterTree) {
      return;
    }

    methodRouterTree.addToTree(urlPattern, handler);
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


async function wrapCtx (ctx: IContext, url: string, urlPattern: string) {
  ctx.extendInfo = ctx.extendInfo || {};
  const [urlWithParams, queryString = ''] = url.split('?');
  let params = Object.create(null);
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
  const urlComponents = urlWithParams.split('/');
  const urlPatternComponents = urlPattern.split('/');

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
          [key]: value
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

  for (let i = 0, len = urlPatternComponents.length; i < len; i ++) {
    const urlPatternComponent = urlPatternComponents[i];
    const urlComponent = urlComponents[i];

    if (urlPatternComponent.indexOf(':') < 0) {
      continue;
    }

    params[urlPatternComponent.replace(':', '')] = urlComponent;
  }

  ctx.extendInfo.params = params;

  Object.defineProperty(ctx, 'params', {
    get() {
      return ctx.extendInfo.params;
    }
  });

  Object.defineProperty(ctx, 'query', {
    get() {
      return ctx.extendInfo.query;
    }
  });

  return ctx;
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