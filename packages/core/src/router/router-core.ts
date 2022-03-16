import { IMiddleWare, IContext } from '@vergiss/auf-typing';
import { makeRouteTree, IRouterTree } from './prefix-tree';

const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'] as IHTTPMethods[];

export type IHTTPMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

type RouteHandlerType = (ctx: IContext, next?: RouteHandlerType | IMiddleWare) => Promise<any>;
type URLPatternType = string | RegExp;
class RouterMap {
  public routerMap: Map<IHTTPMethods, IRouterTree<RouteHandlerType>> = new Map();

  constructor (base?: string) {
    const routerBase = base || '';
    methods.forEach(method => {
      this.routerMap.set(method, makeRouteTree<RouteHandlerType>({ base: routerBase }));
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

  getFromMap(method: IHTTPMethods) {
    return this.routerMap.get(method);
  }

  all(pattern: URLPatternType, handler: RouteHandlerType) {
    methods.forEach(method => {
      this.register(method, pattern, handler);
    });
  }

  get(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('GET', urlPattern, handler);
  }

  post(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('POST', urlPattern, handler);
  }

  delete(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('DELETE', urlPattern, handler);
  }

  put(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('PUT', urlPattern, handler);
  }

  patch(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('PATCH', urlPattern, handler);
  }

  options(urlPattern: URLPatternType, handler: RouteHandlerType) {
    return this.register('OPTIONS', urlPattern, handler);
  }

  head(urlPattern: URLPatternType, handler: RouteHandlerType) {
    const headHandler: RouteHandlerType = async (ctx, next) => {
      await handler(ctx, next);

      if (ctx.body) {
        if (typeof ctx.body === 'object' || typeof ctx.body === 'string') {
          const contentLengthOffset = 2;
          ctx.res.setHeader('content-length', JSON.stringify(ctx.body).length - contentLengthOffset);
          ctx.body = '';
          ctx.extendInfo.handled = true;
        }
      }
    }
    return this.register('HEAD', urlPattern, headHandler);
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
  const { pathname: urlWithParams } = new URL(url, 'https://auf.dev' /* it's just a fake domain for parse relative path */);
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
  const { search: queryString } = new URL(url, 'https://auf.dev' /* it's just a fake domain for parse relative path */);
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

async function dispatchToRouteHandler(ctx: IContext, routerTree: IRouterTree<RouteHandlerType>) {
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