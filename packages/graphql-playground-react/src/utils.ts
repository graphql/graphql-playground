import * as prettier from 'prettier/standalone'
import * as graphql from 'prettier/parser-graphql'
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

interface PrettierOptions {
  printWidth: number
  tabWidth: number
  useTabs: boolean
}

export function prettify(query: string, options: PrettierOptions) {
  return prettier.format(query, {
    ...options,
    parser: 'graphql',
    plugins: [graphql],
  })
}

export function isIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
