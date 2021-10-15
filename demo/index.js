const path = require('path');
const fs = require('fs');
const { Server: StaticServer, Middlewares, Router, routerMap } = require('../packages/auf/dist/index');

const port = 5000
const timeout = 3000
const callback = () => {
  console.log('Static Server Listening on', port);
}
const errorHandler = e => {
  console.error('[static-server] Error:', e.message);
}

const server = new StaticServer({
  port,
  assetsRoot: path.resolve(__dirname, '../public'),
  workerNum: 8,
});

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

server.applyMiddleware([
  Middlewares.ErrorBoundary({ errorHandler }),
  Middlewares.Timeout({ timeout }),
  Middlewares.Logger(console),
  Middlewares.AuthControl({
    whitelist: [
      '/'
    ]
  }),
  Middlewares.CacheControl(),
  Middlewares.StaticRoutes({
    // template: fs.readFileSync(path.resolve(__dirname, './static/template.html')).toString('utf-8')
  }),
  Router()
])

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
