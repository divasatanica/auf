import { uuid } from '..';

describe('[Tools @@ helpers] Normal Test', () => {
  test('Should be a string', () => {
    expect(typeof uuid(5)).toBe('string');
  });
});
