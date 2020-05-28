import { Server, Plugin } from '@hapi/hapi'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

export interface Register {
  (server: Server, options: MiddlewareOptions): void
}

const plugin: Plugin = {
  name: 'graphql-playground',
  register: function (server, options: any) {
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
    }

    server.route({
      method: 'GET',
      path,
      config,
      handler: (_request, h) =>
        h.response(renderPlaygroundPage(middlewareOptions)).type('text/html'),
    })
  },
}

export default plugin
