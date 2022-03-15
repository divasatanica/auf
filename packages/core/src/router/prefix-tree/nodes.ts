import { ITreeNode } from './interface';
export const NOT_LEAF_SIGN = Symbol('__not_leaf__');
export const LEAF_SIGN = Symbol('__leaf__');
export const REG_EXP_NODE_SIGN = Symbol('__regexp_leaf__');

export function isLeafNode<T> (node: any): node is RouterTreeLeafNode<T> {
  return node.type === LEAF_SIGN;
}

export function isRegExpNode<T> (node: any): node is RouterRegExpLeafNode<T> {
  return node.type === REG_EXP_NODE_SIGN;
}

class TreeNode implements ITreeNode<string> {
  public value: string;
  public type: Symbol = NOT_LEAF_SIGN;
  constructor(value: string) {
    this.value = value;
  }
}

class LeafNode<T> implements ITreeNode<T> {
  public value: T;
  public type: symbol;
  constructor(value: T) {
    this.value = value;
  }
}

export class NTreeNode<T> extends TreeNode {
  public quickMap: Map<string|Symbol, NTreeNode<T> | RouterTreeLeafNode<T> | RouterRegExpLeafNode<T>> = new Map();
  public paramNode: NTreeNode<T>;
  public children: Array<NTreeNode<T> | RouterRegExpLeafNode<T> | RouterTreeLeafNode<T>> = [];
}

export class RouterTreeLeafNode<T> extends LeafNode<T>{
  public type: symbol = LEAF_SIGN;
}

export class RouterRegExpLeafNode<T> extends LeafNode<T> {
  public exp: RegExp;
  public value: T;
  public type: symbol = REG_EXP_NODE_SIGN;
  constructor (exp: RegExp, value: T) {
    super(value);
    this.exp = exp;
  }
}