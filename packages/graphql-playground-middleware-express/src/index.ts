import { Request, Response } from 'express'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

/* tslint:disable */
const { playgroundVersion } = require('../package.json')

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
    version: playgroundVersion,
  }

  return async (req, res, next) => {
    res.setHeader('Content-Type', 'text/html')
    const playground = await renderPlaygroundPage(middlewareOptions)
    res.write(playground)
    res.end()
    next()
  }
}

export default express
