import { Engine } from '..';

test('Should render correct HTML markups', done => {
  const template = '<% <p>Total Files: {{ this.files.length }}</p> %>';

  Engine.render(
    template,
    {
      files: [1]
    },
    {
      uglify: true
    }
  ).then(res => {
    expect(res).toBe('<p>Total Files: 1</p>');
    done();
  });
});

test('Should render correct HTML markups with stream', done => {
  const template = '<% <p>Total Files: {{ this.files.length }}</p> %>';

  const stream = Engine.renderWithStream(
    template,
    {
      files: [1]
    }
  );
  expect(typeof stream.readable).toBe('boolean');
  let result = [] as any[];
  stream.resume();
  stream.on('data', data => {
    result.push(data);
  });
  stream.on('end', () => {
    expect(result).toStrictEqual(['<p>Total Files: 1</p>']);
    done();
  });
});