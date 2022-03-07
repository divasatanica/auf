const path = require('path');
const fs = require('fs');
const { Server: StaticServer, Middlewares, Router, RouterMapFactory } = require('../packages/auf/dist/index');
const Config = {
  chunkSize: 5 * 1024 * 1024
}

const port = 60000
const timeout = 5000
const callback = () => {
  console.log('Static Server Listening on', port);
}
const errorHandler = e => {
  console.error('[static-server] Error:', e.message, e.stack);
}
const fsredirPromise = path => new Promise((resolve, reject) => {
  fs.readdir(path, (err, files) => {
    if (err) {
      reject(err);
    }
    resolve(files);
  });
});

const server = new StaticServer({
  port,
  assetsRoot: path.resolve(__dirname, './public'),
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
  next(ctx);
});

routerMap.get('/upload/chunkIndex', async (ctx, next) => {
  const res = await fsredirPromise(path.resolve(__dirname, './'));
  // const res = [];
  const hash = ctx.query.hash;
  const fileWithHash = res.filter(file => file.indexOf(hash) === 0)
  ctx.body = JSON.stringify({
    success: true,
    message: '',
    data: fileWithHash.length
  });
  await next(ctx);
});

routerMap.post('/upload', async (ctx, next) => {
  const body = ctx.reqBody;
  const { files, index, filename: _filename, chunkCount, fileHash } = body;
  const _file = files[0];
  const { file } = _file;
  const filename = decodeURIComponent(_filename);

  const stream = fs.createWriteStream(path.resolve(__dirname, `${fileHash}-${index}`));
  stream.write(file, 'binary');

  ctx.body = JSON.stringify({ msg: 'success', success: true, data: (Number(index) + 1) / Number(chunkCount) });
  stream.end();
  stream.on('finish', async () => {
    console.log('Writing Finished')
    if (Number(chunkCount) === Number(index) + 1) {
      const mergeStream = fs.createWriteStream(path.resolve(__dirname, filename));
      const chunkArr = Array.from({ length: chunkCount }).map((_, index) => index);
      
      let promise = new Promise((resolve) => {
        const fd = path.resolve(__dirname, `${fileHash}-${0}`)
        const readData = fs.readFileSync(fd)
  
        const writable = mergeStream.write(readData, 'binary');
  
        // mergeStream.on('finish', () => {
        //   resolve(1);
        // });
        if (!writable) {
          mergeStream.on('drain', () => {
            resolve(1);
            fs.existsSync(fd) && fs.unlink(fd, err => err && console.error(err))
          })
        }
      })
      
      let q = 0;
      while (q < chunkCount - 1) {
        promise = promise.then(index => {
          return new Promise(resolve => {
            const fd = path.resolve(__dirname, `${fileHash}-${index}`)
            const readData = fs.readFileSync(fd)
  
            const writable = mergeStream.write(readData, 'binary');
  
            if (!writable) {
              mergeStream.on('drain', () => {
                resolve(index + 1);
              })
            } else {
              resolve(index + 1)
            }

            fs.unlink(fd, err => err && console.error(err))
          })
        })
        q ++;
      }
      
    }
  });
  await next(ctx);
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
  // Middlewares.AuthControl({
  //   whitelist: [
  //     '/'
  //   ]
  // }),
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
