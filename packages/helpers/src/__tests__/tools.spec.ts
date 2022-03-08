import { uuid } from '..';

test('Should be a string', () => {
  expect(typeof uuid(5)).toBe('string');
});