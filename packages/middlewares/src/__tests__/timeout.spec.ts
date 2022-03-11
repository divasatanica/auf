import { Timeout } from '..';

interface IFakeContext {
  body: any;
  extendInfo: any;
  res: any;
  serverOptions: any;
  req: any;
}

let fakeContext: IFakeContext;

const Config = {
  timeout: 3000
};

beforeEach(() => {
  jest.useFakeTimers('modern');
  fakeContext = {
    body: {},
    extendInfo: {},
    res: {},
    req: {},
    serverOptions: {}
  } as any;
});

describe('[Timeout @@ middlewares] Normal Test', () => {
  test('Should set timeout result to ctx.body', done => {
    const TimeoutMiddleware = Timeout(Config);
    const sleep = (time: number) => new Promise(resolve => {
      setTimeout(resolve, time);
    });
    
    TimeoutMiddleware(fakeContext, () => sleep(4000)).then(() => {
      const body = JSON.parse(fakeContext.body);
      expect(body.success).toEqual(false);
      expect(body.message).toBe(`Request timeout, proceeded ${Config.timeout} ms`)
      expect(fakeContext.res.statusCode).toEqual(503);
      done();
    });
    jest.advanceTimersByTime(6500);
  });
  
  test('Should correctly set ctx.body without timeout', done => {
    const TimeoutMiddleware = Timeout(Config);
    const sleep = (time: number) => new Promise<void>(resolve => {
      setTimeout(() => {
        fakeContext.body = JSON.stringify({ success: true, data: 1 });
        resolve()
      }, time);
    });
    
    TimeoutMiddleware(fakeContext, () => sleep(500)).then(() => {
      const body = JSON.parse(fakeContext.body);
      expect(body.success).toEqual(true);
      expect(body.data).toEqual(1);
      done();
    });
    jest.advanceTimersByTime(1000);
  });  
});

describe('[Timeout @@ middlewares] Default Config Test', () => {
  test('Should set default timeout', done => {
    const TimeoutMiddleware = Timeout();
    const sleep = (time: number) => new Promise<void>(resolve => {
      setTimeout(() => {
        fakeContext.body = JSON.stringify({ success: true, data: 1 });
        resolve()
      }, time);
    });
    
    TimeoutMiddleware(fakeContext, () => sleep(15500)).then(() => {
      const body = JSON.parse(fakeContext.body);
      expect(body.success).toEqual(false);
      expect(body.message).toBe(`Request timeout, proceeded ${15000} ms`)
      expect(fakeContext.res.statusCode).toEqual(503);
      done();
    });
    jest.advanceTimersByTime(15000);
  });
});
