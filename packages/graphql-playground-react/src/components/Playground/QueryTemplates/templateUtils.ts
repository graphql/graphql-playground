// interface for query template
export interface IQueryTemplate {
  title: string
  description: string
  query: string
}

// fields ignored in query props expansion
const ignoredFields = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdById',
  'updatedById',
  'deletedById',
  'version',

  // Joystream's dataObject `owner` is problematic because it's variant and will need some special handling
  'owner',
]

// define markers that can be used in template queries
export const allPropsMarker = '#allProps#'
export const descriptionMarker = '#description#'

// define indent constants
const indent = ' '.repeat(2) // extra spaces in query line start to be removed
const baseIndent = 2 // indent for query content (this correlates to indent in the .ts code)
const formatRegex = new RegExp(`^${indent.repeat(baseIndent)}`, 'gm') // regex for finding base indent

/*
  Sets nice formatting to the query template.
*/
export function formatQuery(template: IQueryTemplate): IQueryTemplate {
  return {
    ...template,
    query: template.query.replace(formatRegex, '') + "\n"
  }
}

/*
  Fills a list of properties to the given query.
*/
export function fillPropsToQuery(schema: any, query: string, maxRelationRecursions: number): string {
  const usedQueryName = query
    .replace(allPropsMarker, '') // remove all markers
    .replace(descriptionMarker, '') // remove all markers
    .match(/query *\{[\s]*([a-zA-z]+)/)[1]

  const schemaQuery = schema.queries.find(item => item.name === usedQueryName)
  const concatedProps = concatQueryProps(schemaQuery, maxRelationRecursions)

  const result = query.replace(allPropsMarker, concatedProps)

  return result
}

/*
  Fills query template's description into the query.
*/
export function fillDescriptionToQuery(query: string, description: string): string {
  const formattedDesription = description
    .replace(/^/gm, indent + '# ')
    .replace(indent, '') // replace first (extra) indent

  return query.replace(descriptionMarker, formattedDesription)
}

/*
  Prepares a list of properties for the given query.
*/
function concatQueryProps(schemaPart: any, maxRelationRecursions: number, objsSoFar = []): string {
  const subType = findQuerySubType(schemaPart.type)
  const tmpResult = queryPropsTypeRecursion(subType, maxRelationRecursions)

  const result = tmpResult

  return result
}

/*
  Recursively walks through query properties and it's relations.
*/
function queryPropsTypeRecursion(subType, remainingRecursion: number, objsSoFar = []): string {
  const fields = subType._fields

  const concatedProps = Object.entries(fields).reduce((acc, [key, value]: [string, {name: string, type: any}]) => {
    // skip ignored fields
    if (ignoredFields.includes(value.name)) {
      return acc
    }

    const tmpIndent = indent.repeat(baseIndent + objsSoFar.length)

    // value seems to represent scalar property?
    if (!value.type) {
      return acc + tmpIndent + value.name + ",\n"
    }

    const innerType = findQuerySubType(value.type)

    // ensure infinite recursion between relations is prevented
    if (objsSoFar.includes(innerType)) {
      return acc // recursion stop
    }

    // skip relation if recursion max was reached
    if (innerType._fields && !remainingRecursion) {
      return acc
    }

    // in case of relation expand object properties
    if (innerType._fields) {
      const innerContent = queryPropsTypeRecursion(innerType, remainingRecursion - 1, [...objsSoFar, subType])
      return acc + `${tmpIndent}${value.name} {${innerContent}${tmpIndent}},\n`
    }

    // return property name if no previous conditions were met (unexpected scenario)
    return acc + tmpIndent + value.name + ",\n"
  }, "\n")

  return concatedProps
}

/*
  Finds type in query object.
*/
function findQuerySubType(schemaPart: any): Record<string, any> {
  let tmp = schemaPart

  // walkthrough subtypes until fields definition is found
  while (!tmp._fields) {
    // escape if type has no sub type definition
    if (!tmp.type && !tmp.ofType) {
      return {}
    }

    // descend into subtype
    tmp = tmp.type || tmp.ofType
  }

  return tmp
}

// functions for generatic generic query templates
export const genericTemplates = {
  // get all records
  getAll: (queryName: string) => {
    return `query {
      ${descriptionMarker}
      ${queryName} { ${allPropsMarker} }
    }`
  },

  // get one specific record by it's id
  getOne: (queryName: string) => {
    return `query {
      ${descriptionMarker}
      ${queryName}(where: { id_eq: 1 }) { ${allPropsMarker} }
    }`
  },
}
