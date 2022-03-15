import { IMiddleWare } from '@vergiss/auf-typing';
import { IContext } from '../server';
import { makeRouteTree, IRouterTree } from './prefix-tree';

const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];

type IHTTPMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

type RouteHandlerType = (ctx: IContext, next?: RouteHandlerType | IMiddleWare) => void;

class RouterMap {
  public routerMap: Map<string, IRouterTree> = new Map();

  constructor (base?: string) {
    const routerBase = base || '';
    methods.forEach(method => {
      this.routerMap.set(method, makeRouteTree({ base: routerBase }));
    });
  }

  register(method: IHTTPMethods, urlPattern: string | RegExp, handler: RouteHandlerType) {
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

  get(urlPattern: string, handler: RouteHandlerType) {
    return this.register('GET', urlPattern, handler);
  }

  post(urlPattern: string, handler: RouteHandlerType) {
    return this.register('POST', urlPattern, handler);
  }

  delete(urlPattern: string, handler: RouteHandlerType) {
    return this.register('DELETE', urlPattern, handler);
  }

  put(urlPattern: string, handler: RouteHandlerType) {
    return this.register('PUT', urlPattern, handler);
  }

  patch(urlPattern: string, handler: RouteHandlerType) {
    return this.register('PATCH', urlPattern, handler);
  }

  options(urlPattern: string, handler: RouteHandlerType) {
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
function wrapCtx (ctx: IContext, url: string, urlPattern: string | RegExp) {
  ctx.extendInfo = ctx.extendInfo || {};
  wrapCtxWithQuery(ctx, url);
  const [urlWithParams] = url.split('?');
  let params = Object.create(null);

  if (typeof urlPattern !== 'string') {
    const result = url.match(urlPattern);

    if (result != null) {
      const [_, ...matched] = result;

      params = matched;
    } else {
      params = [];
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

function wrapCtxWithQuery(ctx: IContext, url: string) {
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

  ctx.extendInfo.query = query;
}

async function dispatchToRouteHandler(ctx: IContext, routerTree: IRouterTree) {
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