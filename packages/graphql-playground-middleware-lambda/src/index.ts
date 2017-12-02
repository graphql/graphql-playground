import * as lambda from 'aws-lambda'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-middleware'

/* tslint:disable-next-line */
const { version } = require('../package.json')

export default function lambdaPlayground(options: MiddlewareOptions) {
  return (event, lambdaContext: lambda.Context, callback: lambda.Callback) => {
    const middlewareOptions: RenderPageOptions = {
      ...options,
      version,
    }
    const body = renderPlaygroundPage(middlewareOptions)
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body,
    })
  }
}
