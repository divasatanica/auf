const NOT_LEAF_SIGN = '__not_leaf__';
const LEAF_SIGN = '__leaf__';

function isLeafNode (node: any): node is RouterTreeLeafNode {
  return node.type === LEAF_SIGN;
}

class NTreeNode {
  public value: string;
  public children: Array<NTreeNode | RouterTreeLeafNode>;
  public quickMap: Map<string, NTreeNode | RouterTreeLeafNode> = new Map();
  public type: string = NOT_LEAF_SIGN;
  public paramNode: NTreeNode;
  constructor (value: string) {
    this.value = value;
    this.children = [];
  }
}

class RouterTreeLeafNode {
  public value: Function;
  public type: string = LEAF_SIGN;
  constructor (value: Function) {
    this.value = value;
  }
}

class NTree implements IRouterTree {
  private root = new NTreeNode('');

  addToTree(urlPattern: string, handler: any) {
    let p = this.root;
    const urlPatternComponents = [...urlPattern.split('/').filter(Boolean), LEAF_SIGN];

    urlPatternComponents.forEach(component => {
      const { children } = p;

      if (p.quickMap.has(component)) {
        const node = p.quickMap.get(component)!;
        if (isLeafNode(node)) {
          return;
        }
        p = node;
        return;
      }

      if (component === LEAF_SIGN) {
        const newNode = new RouterTreeLeafNode(handler);
        children.push(newNode);
        return;
      }

      const newNode = new NTreeNode(component);
      children.push(newNode);
      p.quickMap.set(component, newNode);
      if (component.indexOf(':') > -1) {
        p.paramNode = newNode;
      }
      p = newNode;
    });
  }

  getHandlerFromTree(url: string): any{
    const [urlWithParams, _] = url.split('?');
    const urlComponents = urlWithParams.split('/').filter(Boolean);
    let p = this.root;
    let i = 0;
    let res;
    let path = '';
    while (p) {
      const component = urlComponents[i ++];

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
        if (!p.paramNode) {
          throw new Error('Route not defined')
        }
        path += '/' + p.paramNode.value;
        p = p.paramNode;
        continue;
      }

      const leafNode = p.children.filter(isLeafNode)[0];

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
  getRoot(): NTreeNode;
  getHandlerFromTree(url: string): any;
}

export function makeRouteTree () {
  return new NTree();
}