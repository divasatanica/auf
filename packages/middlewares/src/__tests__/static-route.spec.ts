import { StaticRoutes } from '..';
import { MockFileSystem } from './test-helper';

let mockFs = new MockFileSystem([
  '/1.jpg',
  '/2.jpg',
  '/files'
]);

describe('[StaticRoutes @@ middlewares] Normal Test', () => {
  test('Should render correct html for directory request', done => {
    const StaticRoutesMiddleware = StaticRoutes({
      fileSystem: mockFs,
      template: '<% <p>Total Files: {{ this.files.length }}</p> %>'
    });
    const fakeContext = {
      req: {
        url: '/files',
      },
      res: {
        headers: {},
        setHeaders(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      serverOptions: {
        assetsRoot: '/dev/coma'
      },
      body: {} as any,
      extendInfo: {}
    } as any;

    StaticRoutesMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      return new Promise<string>(resolve => {
        expect(fakeContext.body.readable).toBe(true);
        let body = '';
        fakeContext.body.on('data', data => {
          body += data;
        });
        fakeContext.body.on('end', () => {
          resolve(body);
        });
      });
    }).then(res => {
      expect(res).toBe('<p>Total Files: 3</p>')
      done();
    })
  });

  test('Should return correct response for file request', done => {
    const StaticRoutesMiddleware = StaticRoutes({
      fileSystem: mockFs,
      template: '<% <p>Total Files: {{ this.files.length }}</p> %>'
    });
    const fakeContext = {
      req: {
        url: '/1.jpg',
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      serverOptions: {
        assetsRoot: '/dev/coma'
      },
      body: {} as any,
      extendInfo: {}
    } as any;

    StaticRoutesMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.body.readable).toBe(true);
      expect(fakeContext.extendInfo.etag).toBeTruthy();
      done();
    })
  });
});