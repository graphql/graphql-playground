import { Server } from 'hapi'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

const pkg = require('../package.json')

export interface Register {
  (server: Server, options: MiddlewareOptions): void
}

export interface Plugin {
  pkg?: any
  register: Register
}

const plugin: Plugin = {
  pkg,
  register: function (server, options: any) {
    if (arguments.length !== 2) {
      throw new Error(`Playground middleware expects exactly 2 arguments, got ${arguments.length}`)
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
      handler: (request, h) => h.response(renderPlaygroundPage(middlewareOptions)).type('text/html')
    })
  }
}

export default plugin
