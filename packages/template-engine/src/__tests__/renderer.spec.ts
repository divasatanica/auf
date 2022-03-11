import {
  render
} from '../renderer';
import {
  TYPE_TOKEN_NORMAL,
  TYPE_TOKEN_DATA_PROP,
  TYPE_DATA_PROP_INFO
} from '../parser';

describe('[Renderer @@ template-engine] Normal Test', () => {
  test('Should render normal html markups', () => {
    const tokens = [
      {
        token: '<div>Hello world</div>',
        type: TYPE_TOKEN_NORMAL 
      }
    ]
    expect(render(tokens, {})).toStrictEqual(['<div>Hello world</div>']);
  });
  
  test('Should render markups with data', () => {
    const tokens = [
      {
        token: {
          props: [
            {
              propPath: ['this', 'name'],
              match: '{{ this.name }}'
            }
          ],
          template: '<div>Hello world, {{ this.name }}</div>',
          type: TYPE_DATA_PROP_INFO
        },
        type: TYPE_TOKEN_DATA_PROP
      }
    ]
    expect(render(tokens, { name: 'coma' })).toStrictEqual(['<div>Hello world, coma</div>']);
  });
  
  // TODO
});
