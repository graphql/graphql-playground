import { print, parse } from 'graphql'

// tslint:disable

export function safely(cb: any) {
  return function*(...args) {
    try {
      yield cb(...args)
    } catch (e) {
      console.error(e)
    }
  }
}

export function prettify(query) {
  return print(parse(query))
}
