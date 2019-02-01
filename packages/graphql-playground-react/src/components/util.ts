import { GraphQLConfig, GraphQLConfigEnpointConfig } from '../graphqlConfig'
import { GraphQLSchema, printSchema } from 'graphql'
import * as LRU from 'lru-cache'

export function getActiveEndpoints(
  config: GraphQLConfig,
  envName: string,
  projectName?: string,
): { endpoint: string; subscriptionEndpoint?: string; headers?: any } {
  if (projectName) {
    const env = config.projects![projectName].extensions!.endpoints![envName]!
    return getEndpointFromEndpointConfig(env)
  } else {
    const env = config.extensions!.endpoints![envName]!
    return getEndpointFromEndpointConfig(env)
  }
}

export function getEndpointFromEndpointConfig(
  env: GraphQLConfigEnpointConfig | string,
) {
  if (typeof env === 'string') {
    return {
      endpoint: env,
      subscriptionEndpoint: undefined,
    }
  } else {
    return {
      endpoint: env.url,
      subscriptionEndpoint: env.subscription
        ? env.subscription!.url
        : undefined,
      headers: env.headers,
    }
  }
}

const printSchemaCache: LRU.Cache<GraphQLSchema, string> = new LRU({ max: 10 })
/**
 * A cached version of `printSchema`
 * @param schema GraphQLSchema instance
 */
export function cachedPrintSchema(schema: GraphQLSchema) {
  const cachedString = printSchemaCache.get(schema)
  if (cachedString) {
    return cachedString
  }

  const schemaString = printSchema(schema)
  printSchemaCache.set(schema, schemaString)

  return schemaString
}
