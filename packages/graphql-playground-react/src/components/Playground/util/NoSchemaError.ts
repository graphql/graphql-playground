export class NoSchemaError extends Error {
  constructor(endpoint: string) {
    super(
      `Schema could not be fetched.\nPlease check if the endpoint '${endpoint}' is a valid GraphQL Endpoint.`,
    )
  }
}
