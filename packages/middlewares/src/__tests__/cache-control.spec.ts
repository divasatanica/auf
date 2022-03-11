import { CacheControl } from '..';

describe('[CacheControl @@ middlewares] Normal Test', () => {
  test('Should set correct header with no-cache', done => {
    const fakeContext = {
      req: {
        url: '/1.jpg',
        headers: {}
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      body: {},
      extendInfo: {
        etag: '1c12309854'
      }
    } as any;
    const CacheControlMiddleware = CacheControl({
      'image/*': 'no-cache'
    });
  
    CacheControlMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.res.headers['cache-control']).toBe('no-cache');
      done();
    });
  });
  
  test('Should not set header', done => {
    const fakeContext = {
      req: {
        url: '/1.txt',
        headers: {}
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      body: {},
      extendInfo: {
        etag: '1c12309854'
      }
    } as any;
    const CacheControlMiddleware = CacheControl({
      'image/*': 'no-cache'
    });
  
    CacheControlMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.res.headers['cache-control']).toBeUndefined();
      done();
    });
  });
  
  test('Should set correct header max-age=0 with etag in request', done => {
    const fakeContext = {
      req: {
        url: '/1.jpg',
        headers: {}
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      body: {},
      extendInfo: {
        etag: '1c12309854'
      }
    } as any;
    const CacheControlMiddleware = CacheControl({
      'image/*': 'no-cache'
    });
  
    const fakeContext2 = {
      req: {
        url: '/1.jpg',
        headers: {
          'if-none-match': '1c12309854'
        }
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext2.res.headers[key.toLowerCase()] = value;
        }
      },
      body: {},
      extendInfo: {
        etag: '1c12309854'
      }
    } as any;
  
    CacheControlMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      return CacheControlMiddleware(fakeContext2, () => Promise.resolve())
    }).then(() => {
      expect(fakeContext2.res.headers['cache-control']).toBe('max-age=0');
      expect(fakeContext2.res.statusCode).toEqual(304);
      done();
    });
  });
});

describe('[CacheControl @@ middlewares] Default Config Test', () => {
  test('Should set correct header with default config', done => {
    const fakeContext = {
      req: {
        url: '/1.jpg',
        headers: {}
      },
      res: {
        headers: {},
        setHeader(key: string, value: string) {
          fakeContext.res.headers[key.toLowerCase()] = value;
        }
      },
      body: {},
      extendInfo: {
        etag: '1c12309854'
      }
    } as any;
    const CacheControlMiddleware = CacheControl();
  
    CacheControlMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.res.headers['cache-control']).toBe('max-age=86400');
      done();
    });
  });
});