import { Server } from 'hapi'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

// tslint:disable-next-line
const pkg = require('../package.json')

export interface Register {
  (server: Server, options: MiddlewareOptions): void
  pkg?: any
}

// tslint:disable-next-line only-arrow-functions
const hapi: Register = function(server, options: any) {
  if (arguments.length !== 2) {
    throw new Error(
      `Playground middleware expects exactly 2 arguments, got ${
        arguments.length
      }`,
    )
  }

  const { path, route: config = {}, ...rest } = options

  const middlewareOptions: RenderPageOptions = {
    ...rest,
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
}

hapi.pkg = pkg

export default hapi
