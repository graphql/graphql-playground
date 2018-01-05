import * as lambda from 'aws-lambda'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

/* tslint:disable-next-line */
const { version } = require('../package.json')

export default function lambdaPlayground(options: MiddlewareOptions) {
  return async (
    event,
    lambdaContext: lambda.Context,
    callback: lambda.Callback,
  ) => {
    const middlewareOptions: RenderPageOptions = {
      ...options,
      version,
    }
    const body = await renderPlaygroundPage(middlewareOptions)
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body,
    })
  }
}
