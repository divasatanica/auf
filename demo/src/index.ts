import * as fs from 'fs';
import * as path from 'path';
import { Server, Middlewares, Router, RouterMapFactory, CommonError } from '../../packages/auf';

const Config = {
  chunkSize: 5 * 1024 * 1024,
  publicDir: path.resolve(__dirname, '../public')
};

const serverTag = '[auf]';
const errorTag = 'Error:';
const port = 60000;
const timeout = 5000;
const callback = () => {
  console.log(serverTag, 'Server Listening on', port);
}
const errorHandler = (e: Error) => {
  console.error(serverTag, errorTag, e.message, '\n', e.stack);
}
const routerMap = RouterMapFactory(/* base= */'/api');
const fsredirPromise = (path: string) => new Promise<string[]>((resolve, reject) => {
  fs.readdir(path, (err, files) => {
    if (err) {
      reject(new CommonError({
        message: err.message,
        statusCode: 500,
        statusMessage: 'File not exists'
      }));
    }
    resolve(files);
  });
});

const server = new Server({
  port,
  assetsRoot: Config.publicDir
});

routerMap.get('/test-multi', async (ctx, next) => {
  ctx.body = 'hi~';
  next && await next(ctx);
  next && await next(ctx);
});

routerMap.get('/upload/config', async (ctx, next) => {
  ctx.body = JSON.stringify(Object.assign({}, { chunkSize: Config.chunkSize }))
  // @ts-ignore
  next && await next(ctx);
});

routerMap.head('/upload/config', async (ctx, next) => {
  ctx.body = JSON.stringify(Object.assign({}, { chunkSize: Config.chunkSize }));
  next && await next(ctx);
});

routerMap.get('/upload/chunkIndex', async (ctx, next) => {
  const res = await fsredirPromise(Config.publicDir);
  // const res = [];
  const hash = ctx.query.hash;
  const fileWithHash = res.filter(file => file.indexOf(hash) === 0)
  ctx.body = JSON.stringify({
    success: true,
    message: '',
    data: fileWithHash.length
  });
  next && await next(ctx);
});

routerMap.post('/upload', async (ctx, next) => {
  const body = ctx.reqBody;
  const { files, index, filename: _filename, chunkCount, fileHash } = body;
  const _file = files[0];
  const { file } = _file;
  const filename = decodeURIComponent(_filename);

  const stream = fs.createWriteStream(path.resolve(Config.publicDir, `${fileHash}-${index}`));
  stream.write(file, 'binary');

  ctx.body = JSON.stringify({ msg: 'success', success: true, data: (Number(index) + 1) / Number(chunkCount) });
  stream.end();
  stream.on('finish', async () => {
    console.log('Writing Finished')
    if (Number(chunkCount) === Number(index) + 1) {
      const mergeStream = fs.createWriteStream(path.resolve(Config.publicDir, filename));
      // const chunkArr = Array.from({ length: chunkCount }).map((_, index) => index);
      
      let promise = new Promise<number>((resolve) => {
        const fd = path.resolve(Config.publicDir, `${fileHash}-${0}`)
        const readData = fs.readFileSync(fd)
  
        const writable = mergeStream.write(readData, 'binary');
  
        if (!writable) {
          console.log('Waiting Drain Event For', index);
          const drainListener = () => {
            resolve(1);
            fs.existsSync(fd) && fs.unlink(fd, err => err && console.error(err));
            mergeStream.removeListener('drain', drainListener);
          }
          mergeStream.on('drain', drainListener)
        }
      })
      
      let q = 0;
      while (q < chunkCount - 1) {
        promise = promise.then(index => {
          return new Promise<number>(resolve => {
            const fd = path.resolve(Config.publicDir, `${fileHash}-${index}`)
            const readData = fs.readFileSync(fd)
  
            const writable = mergeStream.write(readData, 'binary');
  
            if (!writable) {
              console.log('Waiting Drain Event For', index);
              const drainListener = () => {
                resolve(index + 1);
                mergeStream.removeListener('drain', drainListener);
              }
              mergeStream.on('drain', drainListener)
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
  next && await next(ctx);
});

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
  Middlewares.ErrorBoundary({
    errorHandler,
    renderError: true
  }),
  Middlewares.Timeout({ timeout }),
  Middlewares.Logger(console),
  Middlewares.StaticRoutes({
    fileSystem: fs
  }),
  Middlewares.BodyParser(),
  Router()
])


try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
