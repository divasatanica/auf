import { compose, composePromise } from '..'

test('Should return a function', () => {
  const foo = () => {};
  const bar = () => {};

  const result = compose([foo, bar]);

  expect(typeof result).toBe('function');
});

test('Should return a Promise instance', () => {
  const foo = async () => {};
  const bar = async () => {};

  const result = composePromise(foo, bar);

  expect(Object.prototype.toString.call(result(1))).toBe('[object Promise]')
});