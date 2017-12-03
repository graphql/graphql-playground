import { Request, Response } from 'express'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

/* tslint:disable */
const { version } = require('../package.json')

export type ExpressPlaygroundMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => void

export type Register = (
  options: MiddlewareOptions,
) => ExpressPlaygroundMiddleware

const express: Register = function voyagerExpress(options: MiddlewareOptions) {
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

export default express
