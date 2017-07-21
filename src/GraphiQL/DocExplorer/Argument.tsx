import * as React from 'react'
import { astFromValue, print } from 'graphql'
import TypeLink from './TypeLink'

export interface Props {
  arg: any
  level: number
  showDefaultValue?: boolean
}

export default function Argument({ arg, showDefaultValue, level }: Props) {
  return (
    <span className="arg">
      <style jsx={true}>{`
        .arg:after {
          content: '';
        }
      `}</style>
      <TypeLink type={arg} level={level} />
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
