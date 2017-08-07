import { isType, GraphQLInterfaceType, GraphQLObjectType } from 'graphql'

// Return the deeper type found on object
// For example [[[Company]!]!]! will return only Company
export function getDeeperType(type: any): any {
  if (type.ofType) {
    return getDeeperType(type.ofType)
  }
  return type
}

export interface SerializedRoot {
  queries: any[]
  mutations: any[]
  subscriptions: any[]
}
// Serialize schema to get root object
export function serializeRoot(schema): SerializedRoot {
  const obj: SerializedRoot = {
    queries: [],
    mutations: [],
    subscriptions: [],
  }
  const queryType = schema.getQueryType()
  const queryFieldMap = queryType.getFields()
  obj.queries = Object.keys(queryFieldMap).map(
    fieldName => queryFieldMap[fieldName],
  )
  const mutationType = schema.getMutationType && schema.getMutationType()
  if (mutationType) {
    const mutationFieldMap = mutationType.getFields()
    obj.mutations = Object.keys(mutationFieldMap).map(
      fieldName => mutationFieldMap[fieldName],
    )
  }
  const subscriptionType =
    schema.getSubscriptionType && schema.getSubscriptionType()
  if (subscriptionType) {
    const subscriptionFieldMap = mutationType.getFields()
    obj.subscriptions = Object.keys(subscriptionFieldMap).map(
      fieldName => subscriptionFieldMap[fieldName],
    )
  }
  return obj
}

// Return element that match index on root object
export function getElementRoot(obj: any, index: number) {
  let i = 0
  if (obj.queries[index + i]) {
    return obj.queries[index + i]
  }
  i += obj.queries.length
  if (obj.mutations[index - i]) {
    return obj.mutations[index - i]
  }
  i += obj.mutations.length
  if (obj.subscriptions[index - i]) {
    return obj.subscriptions[index - i]
  }
}

export interface SerializedObj {
  fields: any[]
  interfaces: any[]
  args: any[]
  implementations: any[]
}
// Serialize field
export function serialize(schema, field) {
  const obj: SerializedObj = {
    fields: [],
    interfaces: [],
    args: [],
    implementations: [],
  }
  let type = field.type || field
  const isVarType = isType(type)
  if (type.ofType) {
    type = getDeeperType(type.ofType)
  }
  // Get fields
  if (type.getFields) {
    const fieldMap = type.getFields()
    obj.fields = Object.keys(fieldMap).map(name => fieldMap[name])
  }
  // Get interfaces
  if (type instanceof GraphQLObjectType) {
    obj.interfaces = type.getInterfaces()
  }
  // Get args
  obj.args = field.args ? field.args : []
  // Get implementations
  if (isVarType && type instanceof GraphQLInterfaceType) {
    obj.implementations = schema.getPossibleTypes(type)
  }
  return obj
}

// Return element that match index on object
export function getElement(obj: any, index: number) {
  let i = 0
  if (obj.interfaces[index + i]) {
    return obj.interfaces[index + i]
  }
  i += obj.interfaces.length
  if (obj.fields[index - i]) {
    return obj.fields[index - i]
  }
  i += obj.fields.length
  if (obj.args[index - i]) {
    return obj.args[index - i]
  }
  i += obj.args.length
  if (obj.implementations[index - i]) {
    return obj.implementations[index - i]
  }
}
