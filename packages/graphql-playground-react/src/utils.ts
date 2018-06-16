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

export function prettify(query: string, printWidth: number) {
  try {
    return prettier.format(query, {
      parser: 'graphql',
      printWidth,
      plugins: [graphql],
    })
  } catch (e) {
    //TODO show erros somewhere
    console.log(e)
  }
}
