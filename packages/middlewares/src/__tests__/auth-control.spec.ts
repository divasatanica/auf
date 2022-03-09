import { AuthControl } from '..';

const Config = {
  whitelist: [
    '/img'
  ]
}

test('Should let the context pass through', done => {
  const AuthControlMiddleware = AuthControl(Config);
  const fakeContext = {
    req: {
      url: '/img/1.jpg'
    },
    serverOptions: {
      assetsRoot: '/dev/coma'
    },
    body: {} as any
  };
  const fakeNext = () => new Promise<void>(resolve => {
    fakeContext.body = JSON.stringify({ success: true, data: 1 });
    resolve();
  })
  AuthControlMiddleware(fakeContext, fakeNext).then(() => {
    const body = JSON.parse(fakeContext.body);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(1);
    done();
  });
});

test('Should return 403 error', done => {
  const AuthControlMiddleware = AuthControl(Config);
  const fakeContext = {
    req: {
      url: '/imsgs/1.jpg'
    },
    serverOptions: {
      assetsRoot: '/dev/coma'
    },
    res: {
      statusCode: 200
    },
    body: {} as any
  };
  const fakeNext = () => new Promise<void>(resolve => {
    fakeContext.body = JSON.stringify({ success: true, data: 1 });
    resolve();
  })
  AuthControlMiddleware(fakeContext, fakeNext).then(() => {
    expect(fakeContext.res.statusCode).toEqual(403);
    expect(fakeContext.body).toBe('Forbidden Path');
    done();
  });
});