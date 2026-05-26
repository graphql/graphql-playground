import * as lambda from 'aws-lambda'
import {
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

export default function lambdaPlayground(options: RenderPageOptions) {
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
