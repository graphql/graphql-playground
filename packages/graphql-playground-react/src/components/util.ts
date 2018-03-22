import { GraphQLConfig, GraphQLConfigEnpointConfig } from '../graphqlConfig'

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
