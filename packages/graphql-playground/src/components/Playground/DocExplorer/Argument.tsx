import * as React from 'react'
import { astFromValue, print } from 'graphql'
import TypeLink from './TypeLink'

export interface Props {
  arg: any
  x: number
  y: number
  showDefaultValue?: boolean
  onSetWidth: (width: number) => void
}

export default function Argument({
  arg,
  showDefaultValue,
  x,
  y,
  onSetWidth,
}: Props) {
  return (
    <span className="arg">
      <style jsx={true}>{`
        .arg:after {
          content: '';
        }
      `}</style>
      <TypeLink
        type={arg}
        x={x}
        y={y}
        afterNode={
          arg.defaultValue !== undefined &&
          showDefaultValue !== false &&
          <span>
            {' = '}
            <span className="arg-default-value">
              {print(astFromValue(arg.defaultValue, arg.type))}
            </span>
          </span>
        }
        onSetWidth={onSetWidth}
      />
    </span>
  )
}
