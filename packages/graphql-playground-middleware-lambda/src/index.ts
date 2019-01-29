import * as lambda from 'aws-lambda'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

/* tslint:disable-next-line */

export default function lambdaPlayground(options: MiddlewareOptions) {
  return async (
    event,
    lambdaContext: lambda.Context,
    callback: lambda.Callback,
  ) => {
    const body = await renderPlaygroundPage(options)
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body,
    })
  }
}
