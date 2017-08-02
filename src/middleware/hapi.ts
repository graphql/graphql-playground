import { Server } from 'hapi'
import renderPlaygroundPage, {
  MiddlewareOptions,
} from './render-playground-page'

const pkg = require('../package.json')

export interface Register {
  (server: Server, options: any, next: any): void
  attributes?: any
}

// tslint:disable-next-line only-arrow-functions
const hapi: Register = function(server, options, next) {
  if (arguments.length !== 3) {
    throw new Error(
      `Voyager middleware expects exactly 3 arguments, got ${arguments.length}`,
    )
  }

  const { path, route: config = {}, ...voyagerOptions } = options

  const middlewareOptions: MiddlewareOptions = {
    ...voyagerOptions,
    version: pkg.version,
  }

  server.route({
    method: 'GET',
    path,
    config,
    handler: (request, reply) => {
      reply(renderPlaygroundPage(middlewareOptions)).header(
        'Content-Type',
        'text/html',
      )
    },
  })

  return next()
}

hapi.attributes = {
  pkg,
  multiple: false,
}

export default hapi
