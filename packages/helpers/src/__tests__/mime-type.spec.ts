import { checkMimeTypes } from '..';

describe('[MimeType @@ helpers] Normal Test', () => {
  test('Should return correct mime-types', () => {
    const testCases = [
      ['.html', 'text/html'],
      ['.htm', 'text/html'],
      ['.jpg', 'image/*'],
      ['.png', 'image/*'],
      ['.jpeg', 'image/*'],
      ['.js', 'application/javascript'],
      ['.py', 'text/plain']
    ];
  
    testCases.forEach(([ input, expectResult ]) => {
      expect(checkMimeTypes(input)).toBe(expectResult);
    });
  });
});
