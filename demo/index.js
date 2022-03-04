const path = require('path');
const fs = require('fs');
const { Server: StaticServer, Middlewares, Router, RouterMapFactory } = require('../packages/auf/dist/index');
const Config = {
  chunkSize: 10 * 1024 * 1024
}

const port = 60000
const timeout = 15000
const callback = () => {
  console.log('Static Server Listening on', port);
}
const errorHandler = e => {
  console.error('[static-server] Error:', e.message, e.stack);
}

const server = new StaticServer({
  port,
  assetsRoot: path.resolve(__dirname, '../public'),
  workerNum: 8,
});

const routerMap = RouterMapFactory();

routerMap.get('/act/hello', async (ctx, next) => {
  ctx.body = 'yes!!!!!';
  await next(ctx);
});

routerMap.get('/act/:id/:moduleId', async (ctx, next) => {
  ctx.body = 'yes!!!!!' + ctx.params.id + '--' + ctx.params.moduleId + ' pageId:' + ctx.query.pageId;
  await next(ctx);
})

routerMap.post('/test', async (ctx, next) => {
  ctx.body = 'Hello world -- ' + ctx.reqBody.a + ' A=' + ctx.query.a;
  await next(ctx);
});

routerMap.get(/aabb\/(\w+)\/(\d+)/, async (ctx, next) => {
  ctx.body = 'Hello world -- ' + ctx.params[0] + ' id= ' + ctx.params[1];
  await next(ctx);
});

routerMap.get('/upload/config', async (ctx, next) => {
  console.log(Config)
  ctx.body = JSON.stringify(Object.assign({}, Config))
});

routerMap.post('/upload', async (ctx, next) => {
  const body = ctx.reqBody;
  const { files, index } = body;
  const _file = files[0];
  const { file } = _file

  const stream = fs.createWriteStream(path.resolve(__dirname, `${_file.filename}-${index}`));
  stream.write(file, 'binary');

  ctx.body = JSON.stringify({ msg: 'success', success: true });
})

const CORS = function () {
  return async function (ctx, next) {
    await next(ctx)

    const { res } = ctx
    // console.log(res)
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
}

server.applyMiddleware([
  CORS(),
  Middlewares.ErrorBoundary({ errorHandler }),
  Middlewares.Timeout({ timeout }),
  Middlewares.Logger(console),
  Middlewares.AuthControl({
    whitelist: [
      '/'
    ]
  }),
  Middlewares.CacheControl(),
  Middlewares.BodyParser(),
  Middlewares.StaticRoutes({
    template: fs.readFileSync(path.resolve(__dirname, './template.html')).toString('utf-8')
  }),
  Router()
])

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
