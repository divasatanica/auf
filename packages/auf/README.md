# `@vergiss/auf`

This is a simple http framework written in Typescript with Node.js raw API.

## Feature

- Router Middleware supports schema string and regular expression matching.
- Custom asynchornous middlewares.
- Static resources serving with GUI.
- Run in cluster mode.

## Installation

> npm i @vergiss/auf

or 

> yarn add @vergiss/auf


## Usage

```js
const { Server: StaticServer, Middlewares, Router, RouterMapFactory } = require('@vergiss/auf');

const port = 5000;
const timeout = 3000;
const callback = () => {
  console.log('Static Server Listening on', port);
};
const errorHandler = e => {
  console.error('[static-server] Error:', e.message);
};

const server = new StaticServer({
  port,
  assetsRoot: path.resolve(__dirname, '../public'),
  workerNum: 8,
});

const routerMap = RouterMapFactory();

// Define routes and handlers
routerMap.get('/hello', async (ctx, next) => {
	ctx.body = 'yes!!!!!';
  await next(ctx);
});

// Define middlewares

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
  Middlewares.StaticRoutes({}),
  Router()
]);

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
```

## Middlewares

For more scalability, the framework itself only provide a container for middelwares and drive the context to flow through them, which makes middlewares able to modify the context or make some operation. So you can see the basic functionalities are also implemented as a middleware. It is called Onion Style Middleware, which can provide more convenient access to the context.

For the options details, you can see [Docs of built-in middlewares](!https://github.com/divasatanica/auf/blob/main/packages/middlewares/README.md).



## Router and routes

It supports two style for route definition:

1. Schema string matching like `'/api/getUser/:id'` or plain text string `'/api/echo'`
2. Regular expression matching.

In schema string matching style, the `ctx.params` will be an object; In regular expression matching style, the `ctx.params` will be an array.