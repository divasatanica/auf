# `@vergiss/auf-middlewares`

This packages contains built-in middlewares for the framework `@vergiss/auf`. This doc is about the options of them.

## Options

### 1.AuthControl Middleware

It can make a whitelist for static directory access.Only path in the whitelist array can be accessed from remote.

#### Option schema

```js
{
  whitelist: string[];
}
```

### 2.CacheControl Middleware

It provide ability to control the cache of static resources. The config defines the value of `max-age` for different mime-types. 

#### Option schema

```js
{
  config: {
    'text/html': number; // Default: 60
    'image/*': number; // Default: 86400
    'application/javascript': number; // Default: 3600
  }
}
```
TBD: There will be more mime types added into the option.

### 3.ErrorBoundary Middleware

It define an error boundary which can handle the exception. Pass an error handler into it to handle the exception and it will not propogate upper.

#### Option schema

```js
{
  errorHandler?: (err: Error) => void; // Default: console.error
}
```

### 4.ErrorBoundary Middleware

It define an simple access logger which accept a logger-like instance to make you able to determine where these log should be sent or stored.

#### Option schema
```js
{
  logger?: Logger; // Default: console
}
```

### 5.StaticRoutes Middleware

It provide ability to the serve static resources and access them with GUI, and it will generate an etag for cache control.

#### Option schema
```js
{
  template?: string; // Default: Built-in File browser page template
}
```

### 6. Timeout Middleware

It handles the timeout case in the handler, which accept custom timeout deadline in millsecond.

#### Option schema
```js
{
  timeout: number; // Default: 15000(ms)
}
```