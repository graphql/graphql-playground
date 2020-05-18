import * as lambda from 'aws-lambda'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

export default function lambdaPlayground(options: MiddlewareOptions) {
  return async (
    _event,
    _lambdaContext: lambda.Context,
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
