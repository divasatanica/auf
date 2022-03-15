
import { CommonError } from '@vergiss/auf-helpers';

const NOT_LEAF_SIGN = Symbol('__not_leaf__');
const LEAF_SIGN = Symbol('__leaf__');
const REG_EXP_NODE_SIGN = Symbol('__regexp_leaf__');

function isLeafNode (node: any): node is RouterTreeLeafNode {
  return node.type === LEAF_SIGN;
}

function isRegExpNode (node: any): node is RouterRegExpLeafNode {
  return node.type === REG_EXP_NODE_SIGN;
}

class NTreeNode {
  public value: string;
  public children: Array<NTreeNode | RouterTreeLeafNode | RouterRegExpLeafNode>;
  public quickMap: Map<string|Symbol, NTreeNode | RouterTreeLeafNode> = new Map();
  public type: Symbol = NOT_LEAF_SIGN;
  public paramNode: NTreeNode;
  constructor (value: string) {
    this.value = value;
    this.children = [];
  }
}

class RouterTreeLeafNode<T = Function> {
  public value: T;
  public type: Symbol = LEAF_SIGN;
  constructor (value: T) {
    this.value = value;
  }
}

class RouterRegExpLeafNode<T = Function> {
  public value: T;
  public exp: RegExp;
  public type: Symbol = REG_EXP_NODE_SIGN;
  constructor (exp: RegExp, value: T) {
    this.exp = exp;
    this.value = value;
  }
}

/**
 *  We use text-prefix tree to store the routes map. Cause when using plain text or template text
 *  to define a route, it might be many routes with the same namespace(prefix), using text-prefix tree
 *  can make a convenient access to match the route and get the handler. 
 */

class NTree implements IRouterTree {
  private root: NTreeNode;

  constructor ({ base }: IRouterTreeOptions) {
    this.root = new NTreeNode(base || '');
  }

  addToTree(urlPattern: string, handler: any) {
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
        if (isLeafNode(node)) {
          return;
        }
        p = node;
        return;
      }

      if (component === LEAF_SIGN) {
        const newNode = new RouterTreeLeafNode(handler);
        quickMap.set(LEAF_SIGN, newNode);
        return;
      }

      const newNode = new NTreeNode(component as string);
      p.quickMap.set(component as string, newNode);
      // When the expression like ':id' shows in the route, it should
      // be treated as a parameter node.One tree node can only have one parameter node.
      if ((component as string).indexOf(':') > -1) {
        p.paramNode = newNode;
      }
      p = newNode;
    });
  }

  addRegExpToTree(urlPattern: RegExp, handler: Function) {
    const root = this.root;

    root.children.push(new RouterRegExpLeafNode(urlPattern, handler));
  }

  getHandlerFromRegExpNode(url: string): any {
    const regExpNode = this.root.children.filter(isRegExpNode).filter(node => node.exp.test(url));

    if (regExpNode.length === 0) {
      throw new CommonError({
        message: 'Route not defined',
        statusCode: 404,
        statusMessage: 'Not Found'
      });
    }

    // Take the first mathed regular expression as the result,
    // No considering the case for multi regexp matched.
    const node = regExpNode[0];

    return {
      handler: node.value,
      matched: node.exp
    };
  }

  getHandlerFromTree(url: string){
    const routeBase = this.root.value;
    const [urlWithParams, _] = url.split('?');
    const urlWithParamsAndWithRouteBase = (!!routeBase) ? urlWithParams.split(routeBase).filter(Boolean)[0] : urlWithParams;
    const urlComponents = urlWithParamsAndWithRouteBase.split('/').filter(Boolean);
    let p = this.root;
    let i = 0;
    let res;
    let path = '';
    while (p) {
      const component = urlComponents[i ++];

      // If the quickMap has the component, return it if it's also a leaf node.
      // Or just move to the next level and store the path.
      if (p.quickMap.has(component)) {
        const node = p.quickMap.get(component)!;
        if (isLeafNode(node)) {
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
          res = handler
          path = matched;
          break;
        }
        path += '/' + p.paramNode.value;
        p = p.paramNode;
        continue;
      }

      const leafNode = p.quickMap.get(LEAF_SIGN);

      if (leafNode == null) {
        throw new CommonError({
          message: 'Handler not defined',
          statusCode: 500,
          statusMessage: 'Handler Not Found'
        });
      }

      res = leafNode.value;
      break;
    }

    return {
      handler: res,
      path
    };
  }

  getRoot() {
    return this.root;
  }
}

export interface IRouterTree {
  addToTree(urlPattern: string, handler: any): void;
  addRegExpToTree(urlPattern: RegExp, handler: any): void;
  getRoot(): NTreeNode;
  getHandlerFromTree(url: string): any;
}

export function makeRouteTree (options: IRouterTreeOptions) {
  return new NTree(options);
}

export interface IRouterTreeOptions {
  base?: string;
}