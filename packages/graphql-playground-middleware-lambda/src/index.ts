import * as lambda from 'aws-lambda'
import renderPlaygroundPage, {
  MiddlewareOptions,
} from './render-playground-page'

/* tslint:disable-next-line */
const { version } = require('../package.json')

export default function lambdaPlayground(options: MiddlewareOptions) {
  return (event, lambdaContext: lambda.Context, callback: lambda.Callback) => {
    const middlewareOptions: MiddlewareOptions = {
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
