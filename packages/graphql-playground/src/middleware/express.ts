import { Request, Response } from 'express'
import renderPlaygroundPage, {
  MiddlewareOptions,
} from './render-playground-page'

/* tslint:disable */
const { version } = require('../package.json')

export type ExpressPlaygroundMiddleware = (
  _req: Request,
  res: Response,
  next: () => void,
) => void

export type Register = (options: any) => ExpressPlaygroundMiddleware

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
