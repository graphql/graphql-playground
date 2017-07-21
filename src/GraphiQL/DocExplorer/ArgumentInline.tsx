import * as React from 'react'
import { astFromValue, print } from 'graphql'

interface Props {
  arg: any
  showDefaultValue?: boolean
}

export default function Argument({ arg, showDefaultValue }: Props) {
  return (
    <span className="arg">
      <style jsx={true}>{`
        .arg:after {
          content: '';
        }
      `}</style>
      <span className="arg-name">
        {arg.name}
      </span>
      {': '}
      <span className="type-name">
        {arg.type.name}
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
