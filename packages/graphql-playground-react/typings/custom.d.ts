interface Window {
  GraphQLPlayground: any
  version: string
}

declare module '*.json' {
  const value: any
  export default value
}
