import { Request, Response } from 'express'
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

/* tslint:disable */

export type ExpressPlaygroundMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => void

export type Register = (
  options: MiddlewareOptions,
) => ExpressPlaygroundMiddleware

const express: Register = function voyagerExpress(options: MiddlewareOptions) {
  return (req, res, next) => {
    res.setHeader('Content-Type', 'text/html')
    const playground = renderPlaygroundPage(options)
    res.write(playground)
    res.end()
  }
}

export default express
