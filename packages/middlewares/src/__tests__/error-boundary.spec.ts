import { ErrorBoundary } from '..';

test('Should return response with error message', done => {
  const errorHandler = jest.fn();
  const ErrorBoundaryMiddleware = ErrorBoundary({ errorHandler });
  const fakeContext = {
    res: {},
    body: {}
  } as any;
  const message = 'Unit test error';
  const throwError = async () => {
    throw new Error(message);
  }

  ErrorBoundaryMiddleware(fakeContext, throwError).then(() => {
    const body = JSON.parse(fakeContext.body);
    expect(body.success).toBe(false);
    expect(body.message).toBe(`Error: ${message}`);
    done();
  });
});