const path = require('path');
const fs = require('fs');
const { Server: StaticServer, Middlewares } = require('./packages/auf/dist/index');

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
  assetsRoot: path.resolve(__dirname, './public'),
  workerNum: 8,
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
    template: fs.readFileSync(path.resolve(__dirname, './static/template.html')).toString('utf-8')
  })
])

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
