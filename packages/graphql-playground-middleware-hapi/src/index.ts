import { Server } from 'hapi'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

// tslint:disable-next-line
const pkg = require('../package.json')

export interface Register {
  (server: Server, options: MiddlewareOptions, next: any): void
  attributes?: any
}

// tslint:disable-next-line only-arrow-functions
const hapi: Register = function(server, options: any, next) {
  if (arguments.length !== 3) {
    throw new Error(
      `Playground middleware expects exactly 3 arguments, got ${
        arguments.length
      }`,
    )
  }

  const { path, route: config = {}, ...rest } = options

  const middlewareOptions: RenderPageOptions = {
    ...rest,
    version: pkg.playgroundVersion,
  }

  server.route({
    method: 'GET',
    path,
    config,
    handler: async (request, reply) => {
      const body = await renderPlaygroundPage(middlewareOptions)
      reply(body).header('Content-Type', 'text/html')
    },
  })

  return next()
}

hapi.attributes = {
  pkg,
  multiple: false,
}

export default hapi
