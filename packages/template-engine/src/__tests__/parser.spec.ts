import { IToken } from '../type';
import {
  Parser,
  EVENT_TOKEN_GENERATED,
  EVENT_PARSING_END,
  TYPE_TOKEN_NORMAL
} from '../parser';

describe('[Parser @@ template-engine] Normal Test', () => {
  test('Should correctly parse template', done => {
    const parser = new Parser();
    let tokens = [] as IToken[];
  
    parser.on(EVENT_TOKEN_GENERATED, token => {
      tokens.push(token);
    });
  
    parser.on(EVENT_PARSING_END, () => {
      const expectedResult = [
        {
          token: '<div>Hello world</div>',
          type: TYPE_TOKEN_NORMAL 
        }
      ];
  
      expect(tokens).toStrictEqual(expectedResult);
      done();
    });
  
    parser.parseTemplate('<div>Hello world</div>')
  });
});

