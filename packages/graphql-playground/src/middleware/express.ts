import { Request, Response } from 'express'
import renderPlaygroundPage, {
  MiddlewareOptions,
} from './render-playground-page'

const { version } = require('../package.json')

export interface ExpressVoyagerMiddleware {
  (_req: Request, res: Response, next: () => void): void
}

export interface Register {
  (options): ExpressVoyagerMiddleware
}

const express: Register = function voyagerExpress(options) {
  const middlewareOptions: MiddlewareOptions = {
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

export default express
