/**
 * A simple template engine implemented with regular expression.
 * It scans the template line by line, match the syntax with regular expression.
 */
import { Readable } from 'stream';
import { IToken } from './type';
import { Parser, EVENT_TOKEN_GENERATED, EVENT_PARSING_END } from './parser';
import { render as renderWithTokens } from './renderer';

const defaultRenderOption = {
  uglify: false
};

class RenderStream extends Readable {
  private template: string;
  private dataSource: Parser;
  private data: any;
  constructor(template: string, data: any) {
    super({
      objectMode: true
    });
    this.template = template;
    this.data = data;
  }

  _read() {
    this.dataSource = new Parser();
    this.dataSource.on(EVENT_TOKEN_GENERATED, token => {
      this.push(renderWithTokens([token], this.data).join(''));
    });

    this.dataSource.on(EVENT_PARSING_END, () => {
      this.push(null);
    });
    this.dataSource.on('error', e => {
      console.error('Error:', e.message);
    })
    this.dataSource.parseTemplate(this.template);
  }
}

export class Engine {
  static render(template: string, data: any, options = defaultRenderOption): Promise<string> {
    return new Promise(resolve => {
      const parser = new Parser();
      const tokens = [] as IToken[];
      parser.on(EVENT_TOKEN_GENERATED, token => {
        tokens.push(token);
      });

      parser.on(EVENT_PARSING_END, () => {
        const out = renderWithTokens(tokens, data);

        resolve(out.join(options.uglify ? '' : '\n'));
      });
      parser.parseTemplate(template);
    });
  }

  static renderWithStream(template: string, data: any) {
    const stream = new RenderStream(template, data);

    return stream;
  }
}