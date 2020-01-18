import * as React from 'react'
import { astFromValue, print } from 'graphql'
import TypeLink from './TypeLink'

export interface Props {
  arg: any
  x: number
  y: number
  showDefaultValue?: boolean
  sessionId: string
}

export default function Argument({
  arg,
  showDefaultValue,
  x,
  y,
}: // sessionId,
Props) {
  return (
    <span>
      <TypeLink
        type={arg}
        x={x}
        y={y}
        lastActive={false}
        afterNode={
          arg.defaultValue !== undefined &&
          showDefaultValue !== false && (
            <span>
              {' = '}
              <span className="arg-default-value">
                {print(astFromValue(arg.defaultValue, arg.type))}
              </span>
            </span>
          )
        }
      />
    </span>
  )
}
