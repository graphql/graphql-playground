import { GraphQLSchema, introspectionQuery, buildClientSchema } from 'graphql'
import * as stringify from 'json-stable-stringify'
import { NoSchemaError } from './util/NoSchemaError'

export interface TracingSchemaTuple {
  schema: GraphQLSchema
  tracingSupported: boolean
}

export class SchemaFetcher {
  cache: Map<string, TracingSchemaTuple>
  constructor() {
    this.cache = new Map()
  }
  async fetch(endpoint: string, headers?: any) {
    const cachedSchema = this.cache.get(this.hash(endpoint, headers))
    return cachedSchema || this.fetchSchema(endpoint, headers)
  }
  refetch(endpoint: string, headers: any) {
    return this.fetchSchema(endpoint, headers)
  }
  hash(endpoint: string, headers: any) {
    return stringify({ endpoint, headers })
  }
  private async fetchSchema(
    endpoint: string,
    headers: any = {},
  ): Promise<{ schema: GraphQLSchema; tracingSupported: boolean } | null> {
    const response = await fetch(endpoint, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Apollo-Tracing': '1',
        credentials: 'include',
        ...headers,
      },
      body: JSON.stringify({ query: introspectionQuery }),
    })

    const schemaData = await response.json()

    if (schemaData && (schemaData.errors || !schemaData.data)) {
      throw new Error(JSON.stringify(schemaData, null, 2))
    }

    if (!schemaData) {
      throw new NoSchemaError(endpoint)
    }

    const schema = buildClientSchema(schemaData.data)
    const tracingSupported =
      schemaData.extensions && Boolean(schemaData.extensions.tracing)
    const result = {
      schema,
      tracingSupported,
    }
    this.cache.set(this.hash(endpoint, headers), result)

    return result
  }
}
