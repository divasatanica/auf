import { CacheControl } from '..';

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

test('Should set correct header', done => {
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