import { APIGatewayProxyHandler } from 'aws-lambda'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

export default function lambdaPlayground(options: MiddlewareOptions): APIGatewayProxyHandler {
  return (
    event,
    lambdaContext,
    callback,
  ) => {
    const body = renderPlaygroundPage(options)
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body,
    })
  }
}
