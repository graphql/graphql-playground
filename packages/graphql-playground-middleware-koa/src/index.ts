import { Context, Next } from 'koa'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

export declare type KoaPlaygroundMiddlewareOptions = MiddlewareOptions

/* tslint:disable-next-line */
export type KoaPlaygroundMiddleware = (ctx: Context, next: Next) => Promise<void>

export type Register = (options: KoaPlaygroundMiddlewareOptions) => KoaPlaygroundMiddleware

const koa: Register = options => {
  return async function voyager(ctx, next) {
    try {
      ctx.body = await renderPlaygroundPage(options)
      await next()
    } catch (err) {
      ctx.body = { message: err.message }
      ctx.status = err.status || 500
    }
  }
}

export default koa
