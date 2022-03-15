import { CommonError, isCommonError } from '..';

describe('[ErrorClass @@ helpers] Normal Test', () => {
  test('Should correctly judge the type of common error object', () => {
    const obj = new CommonError({ message: 'Test', statusCode: 404, statusMessage: 'Hello world' });

    expect(isCommonError(obj)).toBe(true);
    expect(isCommonError({})).toBe(false);
  });

  test('Should initialize properties properly', () => {
    const obj = new CommonError({ message: 'Test', statusCode: 404, statusMessage: 'Hello world' });

    expect(obj.message).toBe('Test');
    expect(obj.statusCode).toBe(404);
    expect(obj.statusMessage).toBe('Hello world');
  });

  test('Should be instance of Error', () => {
    const obj = new CommonError({ message: 'Test', statusCode: 404, statusMessage: 'Hello world' });

    expect(obj instanceof Error).toBe(true);
  });
});