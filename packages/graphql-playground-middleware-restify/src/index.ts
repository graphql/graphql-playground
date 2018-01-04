import {
  renderPlaygroundPage,
} from 'graphql-playground-middleware';
import { Request, Response } from 'restify';
import { MiddlewareOptions, RenderPageOptions }  from 'graphql-playground-html'

/* tslint:disable */
const { version } = require('../package.json')

export type RestifyPlaygroundMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => void

export type Register = (
  options: MiddlewareOptions,
) => RestifyPlaygroundMiddleware

const restify: Register = function voyagerRestify(options: MiddlewareOptions) {
  const middlewareOptions: RenderPageOptions = {
    ...options,
    version,
  }

  return (req, res, next) => {
    res.setHeader('Content-Type', 'text/html')
    res.write(renderPlaygroundPage(middlewareOptions))
    res.end()
    next()
  }
}

export default restify