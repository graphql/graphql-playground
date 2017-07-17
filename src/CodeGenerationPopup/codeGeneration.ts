import { GraphQLClient, Environment } from '../types'

export class CodeGenerator {
  private client: GraphQLClient
  private environment: Environment
  private endpointUrl: string

  constructor(
    client: GraphQLClient,
    environment: Environment,
    endpointUrl: string,
  ) {
    this.client = client
    this.environment = environment
    this.endpointUrl = endpointUrl
  }

  getSetup() {
    const template = `$ npm install `

    if (this.client === 'lokka') {
      return template + `lokka lokka-transport-http`
    } else if (this.client === 'fetch') {
      return template + `isomorphic-fetch es6-promise`
    }

    return ''
  }

  getCode(query: string) {
    return (
      this.getImports() + this.getTransport() + '\n' + this.getQueryCode(query)
    )
  }

  private getTransport() {
    if (this.client === 'lokka') {
      return `
const headers = {
  Authorization: 'Bearer YOUR_AUTH_TOKEN'
}

const client = new Lokka({
  transport: new Transport('${this.endpointUrl}', {headers})
});
`
    }

    return ''
  }

  private getImports() {
    if (this.client === 'lokka' && this.environment === 'Node') {
      return `const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;
`
    } else if (this.client === 'lokka' && this.environment === 'Browser') {
      return `import {Lokka} from 'lokka'
import {Transport} from 'lokka-transport-http'
`
    } else if (this.client === 'fetch') {
      return `require('es6-promise').polyfill()
require('isomorphic-fetch')
`
    }

    return ''
  }

  private getQueryCode(query: string) {
    if (query.includes('mutation')) {
      return this.getMutation(query)
    } else {
      return this.getQuery(query)
    }
  }

  private getQuery(query: string) {
    if (this.client === 'lokka') {
      return `function getItems() {
  return client.query(\`
  ${query.split('\n').map((line, i) => '    ' + line).join('\n')}
  \`)
}`
    }

    if (this.client === 'fetch') {
      return `function getItems() {` + this.getFetchBody(query) + `}`
    }

    return ''
  }

  private getFetchBody(query: string) {
    const jsonQuery = JSON.stringify({
      query,
    })
    return `
    return fetch('${this.endpointUrl}', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      //   'Authorization': 'Bearer YOUR_AUTH_TOKEN'
      },
      body: '${jsonQuery}',
    })
`
  }

  private getMutation(query: string) {
    const curlyIndex = query.indexOf('{')

    const strippedQuery = query.slice(curlyIndex, query.length)
    if (this.client === 'lokka') {
      return `function setItem() {
return client.mutate(\`
${strippedQuery.split('\n').map((line, i) => '    ' + line).join('\n')}
  \`)
}`
    }

    if (this.client === 'fetch') {
      return `function setItem() {` + this.getFetchBody(query) + `}`
    }

    return ''
  }
}
