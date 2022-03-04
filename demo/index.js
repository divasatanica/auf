const path = require('path');
const fs = require('fs');
const { Server: StaticServer, Middlewares, Router, RouterMapFactory } = require('../packages/auf/dist/index');
const Config = {
  chunkSize: 50 * 1024 * 1024
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
  const { files, index, filename, chunkCount } = body;
  const _file = files[0];
  const { file } = _file

  const stream = fs.createWriteStream(path.resolve(__dirname, `${filename}-${index}`));
  stream.write(file, 'binary');

  ctx.body = JSON.stringify({ msg: 'success', success: true, data: Number(index) / Number(chunkCount) });
  stream.end();
  stream.on('finish', async () => {
    console.log('Writing Finished')
    if (Number(chunkCount) === Number(index) + 1) {
      const mergeStream = fs.createWriteStream(path.resolve(__dirname, filename));
      const chunkArr = Array.from({ length: chunkCount }).map((_, index) => index);
      
      let promise = new Promise((resolve) => {
        const fd = path.resolve(__dirname, `${filename}-${0}`)
        const readData = fs.readFileSync(fd)
  
        const writable = mergeStream.write(readData, 'binary');
  
        // mergeStream.on('finish', () => {
        //   resolve(1);
        // });
        if (!writable) {
          mergeStream.on('drain', () => {
            resolve(1);
            fs.unlink(fd, console.error)
          })
        }
      })
      
      let q = 0;
      while (q < chunkCount - 1) {
        promise = promise.then(index => {
          return new Promise(resolve => {
            const fd = path.resolve(__dirname, `${filename}-${index}`)
            const readData = fs.readFileSync(fd)
  
            const writable = mergeStream.write(readData, 'binary');
  
            if (!writable) {
              mergeStream.on('drain', () => {
                resolve(index + 1);
              })
            } else {
              resolve(index + 1)
            }

            fs.unlink(fd, console.error)
          })
        })
        q ++;
      }
      
    }
  })
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
  // Middlewares.StaticRoutes({
  //   template: fs.readFileSync(path.resolve(__dirname, './template.html')).toString('utf-8')
  // }),
  Router()
])

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
