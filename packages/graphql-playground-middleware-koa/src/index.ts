import { Context } from 'koa'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
  RenderPageOptions,
} from 'graphql-playground-html'

/* tslint:disable-next-line */
const { playgroundVersion } = require('../package.json')

export type KoaPlaygroundMiddleware = (ctx: Context, next: () => void) => void

export type Register = (options: MiddlewareOptions) => KoaPlaygroundMiddleware

const koa: Register = options => {
  const middlewareOptions: RenderPageOptions = {
    ...options,
    version: playgroundVersion,
  }

  return async function voyager(ctx, next) {
    try {
      ctx.body = await renderPlaygroundPage(middlewareOptions)
      await next()
    } catch (err) {
      ctx.body = { message: err.message }
      ctx.status = err.status || 500
    }
  }
}

export default koa
