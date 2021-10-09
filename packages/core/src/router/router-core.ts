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


function wrapCtx (ctx: IContext, url: string, urlPattern: string) {
  ctx.extendInfo = ctx.extendInfo || {};
  const [urlWithParams, queryString = ''] = url.split('?');
  let params = Object.create(null);
  const query = queryString.split('&').reduce((acc, curr) => {
    const [key, value] = curr.split('=');
    return {
      ...acc,
      [key]: value
    }
  }, {});
  const urlComponents = urlWithParams.split('/');
  const urlPatternComponents = urlPattern.split('/');

  ctx.extendInfo.query = query;

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

function dispatchToRouteHandler(ctx: IContext, routerTree: IRouterTree) {
  const { url } = ctx.req;
  const { handler, path } = routerTree.getHandlerFromTree(url!);

  const wrappedCtx = wrapCtx(ctx, url!, path);

  return {
    ctx: wrappedCtx,
    handler
  }
}

export {
  dispatchToRouteHandler,
  RouterMap
}