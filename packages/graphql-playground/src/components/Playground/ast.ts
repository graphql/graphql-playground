import { parse, visit } from 'graphql'
import { validate } from 'graphql/validation'
import { PermissionQueryArgument } from '../../types'

export function putVariablesToQuery(
  query: string,
  variables: PermissionQueryArgument[],
) {
  let newQuery = query

  try {
    const ast = parse(query)
    // let nameEnd = -1
    let selectionStart = -1

    visit(ast, {
      // Name(node) {
      //   if (nameEnd === -1) {
      //     nameEnd = node.loc.end
      //     debugger
      //   }
      // },
      SelectionSet(node) {
        if (selectionStart === -1) {
          selectionStart = node.loc.start
        }
      },
    })

    // newQuery = query.slice(0, nameEnd) + renderVariables(variables) + query.slice(selectionStart, query.length)
    newQuery =
      'query ' +
      renderVariables(variables) +
      query.slice(selectionStart, query.length)
  } catch (e) {
    //
  }

  return newQuery
}

export function extractSelection(query: string) {
  let newQuery = query

  try {
    const ast = parse(query)
    let selectionStart = -1
    let selectionEnd = -1

    visit(ast, {
      SelectionSet(node) {
        // take first selection
        if (selectionStart === -1 && selectionEnd === -1) {
          selectionStart = node.loc.start
          selectionEnd = node.loc.end
        }
      },
    })

    newQuery = query.slice(selectionStart, selectionEnd)
  } catch (e) {
    //
  }

  return newQuery
}

export function addVarsAndName(
  modelNamePlural: string,
  query: string,
  vars: PermissionQueryArgument[],
  schema: any,
) {
  let newQuery = query

  try {
    const ast = parse(query)
    let selectionStart = -1
    let selectionEnd = -1

    visit(ast, {
      SelectionSet(node) {
        // take first selection
        if (selectionStart === -1 && selectionEnd === -1) {
          selectionStart = node.loc.start
          selectionEnd = node.loc.end
        }
      },
    })

    const { variables } = getVariableNamesFromQuery(query, false, schema)
    const mappedVariables = variables.map(variable =>
      vars.find(arg => arg.name === variable),
    )

    const printedVariables = renderVariables(mappedVariables as any)

    newQuery =
      `query ` + printedVariables + query.slice(selectionStart, query.length)
  } catch (e) {
    //
  }

  return newQuery
}

export function getVariableNamesFromQuery(
  query: string,
  definitionOnly: boolean = false,
  schema: any,
): { variables: string[]; valid: boolean } {
  const variables = new Set()
  let valid = true

  try {
    const ast = parse(query)

    let config = {}

    if (definitionOnly) {
      config = {
        VariableDefinition(node) {
          variables.add('$' + node.variable.name.value)
        },
      }
    } else {
      config = {
        Variable(node) {
          variables.add('$' + node.name.value)
        },
      }
    }

    visit(ast, config)

    const validation = validate(schema, ast)
    if (validation.length > 0) {
      valid = false
    }
  } catch (e) {
    valid = false
  }

  const result = Array.from(variables)

  return {
    variables: result,
    valid,
  }
}

function renderVariables(variables: PermissionQueryArgument[]) {
  if (variables.length === 0) {
    return ' '
  }
  return (
    '(' +
    variables
      .map(variable => `${variable.name}: ${renderType(variable)}`)
      .join(', ') +
    ') '
  )
}

export function renderType(variable: PermissionQueryArgument) {
  return variable.typeName + '!'
}
