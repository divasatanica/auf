export interface ITreeNode<T> {
  value: T;
}

type HandlerResultType<T> = { handler: T, path: string | RegExp };

export interface IRouterTree<T> {
  addToTree(urlPattern: string, handler: T): void;
  addRegExpToTree(urlPattern: RegExp, handler: T): void;
  getRoot(): ITreeNode<string>;
  getHandlerFromTree(url: string): HandlerResultType<T | null>;
}

export interface IRouterTreeOptions {
  base?: string;
}