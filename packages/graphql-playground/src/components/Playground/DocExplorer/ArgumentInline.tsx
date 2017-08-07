import * as React from 'react'
import { astFromValue, print, GraphQLList, GraphQLNonNull } from 'graphql'

export interface Props {
  arg: any
  showDefaultValue?: boolean
}

export default function Argument({ arg, showDefaultValue }: Props) {
  return (
    <span className="arg">
      <span className="arg-name">
        {arg.name}
      </span>
      {': '}
      <span className="type-name">
        {renderType(arg.type)}
      </span>
      {arg.defaultValue !== undefined &&
        showDefaultValue !== false &&
        <span>
          {' = '}
          <span className="arg-default-value">
            {print(astFromValue(arg.defaultValue, arg.type))}
          </span>
        </span>}
    </span>
  )
}

function renderType(type) {
  if (type instanceof GraphQLNonNull) {
    return (
      <span>
        {renderType(type.ofType)}
        {'!'}
      </span>
    )
  }
  if (type instanceof GraphQLList) {
    return (
      <span>
        {'['}
        {renderType(type.ofType)}
        {']'}
      </span>
    )
  }
  return (
    <span>
      {type.name}
    </span>
  )
}
