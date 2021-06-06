import { IContext } from '../interfaces/server';

export function Timeout(config = { timeout: 3000 }) {
  return async function TimeoutMiddleware(ctx: IContext, next: Function) {
    const timeout = new Promise(r => {
      setTimeout(() => r({ hasTimeout: true }), config.timeout);
    });
    const normalResolvedNext = next(ctx).then(() => ({ hasTimeout: false }));

    const result = await Promise.race([
      timeout,
      normalResolvedNext
    ]);

    const { hasTimeout } = result;

    if (hasTimeout) {
      ctx.body = 'Timeout';
      ctx.res.statusCode = 503;
    }
  }
}