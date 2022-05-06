
import { throwCommonError } from '@vergiss/auf-helpers';
import {
  NTreeNode,
  RouterRegExpLeafNode,
  RouterTreeLeafNode,
  isLeafNode,
  isRegExpNode,
  LEAF_SIGN
} from './nodes';
import {
  IRouterTreeOptions,
  IRouterTree
} from './interface';

export {
  IRouterTree
}

/**
 *  We use text-prefix tree to store the routes map. Cause when using plain text or template text
 *  to define a route, it might be many routes with the same namespace(prefix), using text-prefix tree
 *  can make a convenient access to match the route and get the handler. 
 */

class NTree<T> implements IRouterTree<T> {
  private root: NTreeNode<T>;

  constructor ({ base }: IRouterTreeOptions) {
    this.root = new NTreeNode(base || '');
  }

  addToTree(urlPattern: string, handler: T) {
    let p = this.root;
    // Padding an element to the rear of the array to make the leaf node.
    const urlPatternComponents = [...urlPattern.split('/').filter(Boolean), LEAF_SIGN];

    urlPatternComponents.forEach(component => {
      const { quickMap } = p;

      // If quickMap has this component, it means the route has the same namespace
      // with existed route, so get to the next level directly. If the node is a leaf
      // node, just return cause it means redundant route is adding to the tree, we dont need it.
      if (p.quickMap.has(component as string)) {
        const node = p.quickMap.get(component as string)!;
        if (isLeafNode<T>(node)) {
          return;
        }
        p = node;
        return;
      }

      if (component === LEAF_SIGN) {
        const newNode = new RouterTreeLeafNode<T>(handler);
        quickMap.set(LEAF_SIGN, newNode);
        return;
      }

      const newNode = new NTreeNode<T>(component as string);
      p.quickMap.set(component as string, newNode);
      // When the expression like ':id' shows in the route, it should
      // be treated as a parameter node.One tree node can only have one parameter node.
      if ((component as string).indexOf(':') > -1) {
        p.paramNode = newNode;
      }
      p = newNode;
    });
  }

  addRegExpToTree(urlPattern: RegExp, handler: T) {
    const root = this.root;

    root.children.push(new RouterRegExpLeafNode<T>(urlPattern, handler));
  }

  getHandlerFromRegExpNode(url: string) {
    const regExpNodes = this.root.children.filter(node => isRegExpNode<T>(node)) as RouterRegExpLeafNode<T>[];
    const matchedRegExpNodes = regExpNodes.filter(node => node.exp.test(url));

    if (matchedRegExpNodes.length === 0) {
      throwCommonError({
        message: 'Route not defined',
        statusCode: 404,
        statusMessage: 'Not Found'
      });
    }

    // Take the first mathed regular expression as the result,
    // No considering the case for multi regexp matched.
    const node = matchedRegExpNodes[0];

    return {
      handler: node.value,
      matched: node.exp
    };
  }

  getHandlerFromTree(url: string): { handler: T | null, path: string | RegExp } {
    const routeBase = this.root.value;
    const [urlWithParams, _] = url.split('?');

    if ((!!routeBase) && urlWithParams.indexOf(routeBase) < 0) {
      return {
        handler: null,
        path: ''
      }
    }
    const urlWithParamsAndWithRouteBase = (!!routeBase) ? urlWithParams.split(routeBase).filter(Boolean)[0] : urlWithParams;
    const urlComponents = urlWithParamsAndWithRouteBase.split('/').filter(Boolean);
    let p = this.root;
    let i = 0;
    let res: T;
    let path = '' as (string | RegExp);
    while (p) {
      const component = urlComponents[i ++];

      // If the quickMap has the component, return it if it's also a leaf node.
      // Or just move to the next level and store the path.
      if (p.quickMap.has(component)) {
        const node = p.quickMap.get(component)!;
        if (isLeafNode<T>(node)) {
          res = node.value;
          break;
        }
        path += '/' + node.value;
        p = node;
        continue;
      }
      if (component) {
        // If no parameter node found, try regular expression matching.
        if (!p.paramNode) {
          const { handler, matched } = this.getHandlerFromRegExpNode(url);
          return {
            handler,
            path: matched
          };
        }
        path += '/' + p.paramNode.value;
        p = p.paramNode;
        continue;
      }

      const leafNode = p.quickMap.get(LEAF_SIGN);

      if (leafNode == null) {
        throwCommonError({
          message: 'Handler not defined',
          statusCode: 500,
          statusMessage: 'Handler Not Found'
        })
      }

      res = (leafNode as RouterTreeLeafNode<T>).value;
      break;
    }

    return {
      // @ts-ignore
      handler: res,
      path
    };
  }

  getRoot() {
    return this.root;
  }
}

export function makeRouteTree<T> (options: IRouterTreeOptions) {
  return new NTree<T>(options);
}