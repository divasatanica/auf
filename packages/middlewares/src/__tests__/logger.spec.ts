import { Logger } from '..';

test('Should call the log function one time', done => {
  const logFn = jest.fn();
  const fakeLogger = { log: logFn };
  const LoggerMiddleware = Logger(fakeLogger);
  const fakeContext = {
    body: {},
    res: {},
    req: {}
  };

  LoggerMiddleware(fakeContext, () => Promise.resolve()).then(() => {
    expect(logFn).toBeCalledTimes(1);
    done();
  });
  expect(logFn).toBeCalledTimes(0);
});

test('Should call the console.log function one time without logger injected', done => {
  const temp = console.log;
  console.log = () => {};
  jest.spyOn(console, 'log');
  const LoggerMiddleware = Logger();
  const fakeContext = {
    body: {},
    res: {},
    req: {}
  };

  LoggerMiddleware(fakeContext, () => Promise.resolve()).then(() => {
    expect(console.log).toBeCalledTimes(1);
    console.log = temp;
    done();
  });
  expect(console.log).toBeCalledTimes(0);
});