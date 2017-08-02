import { Context } from 'koa'
import renderPlaygroundPage, {
  MiddlewareOptions,
} from './render-playground-page'

const { version } = require('../package.json')

export interface KoaPlaygroundMiddleware {
  (ctx: Context, next: () => void): void
}

export interface Register {
  (options): KoaPlaygroundMiddleware
}

const koa: Register = options => {
  const middlewareOptions: MiddlewareOptions = {
    ...options,
    version,
  }

  return async function voyager(ctx, next) {
    try {
      ctx.body = renderPlaygroundPage(middlewareOptions)
      await next()
    } catch (err) {
      ctx.body = { message: err.message }
      ctx.status = err.status || 500
    }
  }
}

export default koa
