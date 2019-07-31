export interface GraphQLConfigExtensions {
  endpoints?: GraphQLConfigEndpointsData
  [name: string]: any
}

export interface GraphQLResolvedConfigData {
  schemaPath: string

  includes?: string[]
  excludes?: string[]

  extensions?: GraphQLConfigExtensions
}

export type GraphQLConfig = GraphQLResolvedConfigData & {
  projects?: { [projectName: string]: GraphQLResolvedConfigData }
}

export interface GraphQLConfigEndpointsSubscription {
  url: string
  connectionParams?: { [name: string]: string | undefined }
}

export interface GraphQLConfigEndpointConfig {
  url: string
  headers?: { [name: string]: string }
  subscription?: GraphQLConfigEndpointsSubscription
  oauth?: GraphQLConfigOAuthConfig
}

export interface GraphQLConfigOAuthConfig {
  endpoint: string
  username: string
  password: string
  clientId: string
  clientSecret: string
}

export interface GraphQLConfigEndpointsMapData {
  [env: string]: GraphQLConfigEndpointConfig | string
}

export interface GraphQLConfigEndpointsMap {
  [env: string]: GraphQLConfigEndpointConfig
}

export type GraphQLConfigEndpointsData = GraphQLConfigEndpointsMapData
