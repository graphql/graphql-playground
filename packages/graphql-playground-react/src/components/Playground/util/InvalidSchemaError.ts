import type { GraphQLError } from "graphql";

export class InvalidSchemaError extends Error {
  constructor(validationErrors: readonly GraphQLError[]) {
    super(
      `Invalid schema Error:\n${validationErrors.join('\n')}`,
    )
  }
}
