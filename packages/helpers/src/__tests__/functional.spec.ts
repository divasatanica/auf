import { compose, composePromise } from '..';

describe('[Functional @@ helpers] Normal Test', () => {
  test('Should return a function', () => {
    const foo = () => {};
    const bar = () => {};
  
    const result = compose([foo, bar]);
  
    expect(typeof result).toBe('function');
    expect(result(1)).toBe(undefined);
  });
  
  test('Should return a Promise instance', () => {
    const foo = async () => {};
    const bar = async () => {};
  
    const result = composePromise(foo, bar);
  
    expect(typeof result).toBe('function');
    expect(Object.prototype.toString.call(result(1))).toBe('[object Promise]')
  });
});

