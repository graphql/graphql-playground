export interface GraphQLConfigExtensions {
  endpoints?: GraphQLConfigEnpointsData
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

export interface GraphQLConfigEnpointsSubscription {
  url: string
  connectionParams?: { [name: string]: string | undefined }
}

export interface GraphQLConfigEnpointConfig {
  url: string
  headers?: { [name: string]: string }
  subscription?: GraphQLConfigEnpointsSubscription
}

export interface GraphQLConfigEnpointsMapData {
  [env: string]: GraphQLConfigEnpointConfig | string
}

export interface GraphQLConfigEnpointsMap {
  [env: string]: GraphQLConfigEnpointConfig
}

export type GraphQLConfigEnpointsData = GraphQLConfigEnpointsMapData
