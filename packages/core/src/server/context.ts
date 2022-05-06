import * as http from 'http';
import { IContext, IServerOptions, ContextExtendInfoType } from '@vergiss/auf-typing';

class Context implements IContext {
  public res: http.ServerResponse;
  public req: http.IncomingMessage;
  public serverOptions: IServerOptions;
  public extendInfo: ContextExtendInfoType;
  private _body: any;
  constructor (req: http.IncomingMessage, res: http.ServerResponse, serverOptions: IServerOptions) {
    this.res = res;
    this.req = req;
    this.serverOptions = serverOptions;
    this._body = {} as any;
    this.extendInfo = {
      visMap: new WeakSet(),
      handled: false
    };
  }

  get body() {
    return this._body;
  }

  set body(value: any) {
    this.extendInfo.handled = true;
    this._body = value;
  }

  get reqBody() {
    return this.extendInfo.body;
  }

  get query() {
    return this.extendInfo.query;
  }

  get params() {
    return this.extendInfo.params;
  }
}

export {
  Context
}