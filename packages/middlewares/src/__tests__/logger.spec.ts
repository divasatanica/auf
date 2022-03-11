import { Logger } from '..';

describe('[Logger @@ middlewares] Normal Test', () => {
  test('Should call the log function one time', done => {
    const logFn = jest.fn();
    const fakeLogger = { log: logFn };
    const LoggerMiddleware = Logger(fakeLogger);
    const fakeContext = {
      body: {},
      res: {},
      req: {}
    } as any;
  
    LoggerMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(logFn).toBeCalledTimes(1);
      done();
    });
    expect(logFn).toBeCalledTimes(0);
  });
});

describe('[Logger @@ middlewares] Default Logger Test', () => {
  test('Should call the console.log function one time without logger injected', done => {
    const temp = console.log;
    const fn = jest.fn();
    console.log = fn;
    const LoggerMiddleware = Logger();
    const fakeContext = {
      body: {},
      res: {},
      req: {}
    } as any;
  
    LoggerMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fn).toBeCalledTimes(1);
      console.log = temp;
      done();
    });
    expect(fn).toBeCalledTimes(0);
  });
});