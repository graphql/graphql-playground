import * as React from 'react'
import { astFromValue, print } from 'graphql'
import TypeLink from './TypeLink'

interface Props {
  arg: any
  showDefaultValue?: boolean
  onClickType: (field: any) => void
}

export default function Argument({
  arg,
  onClickType,
  showDefaultValue,
}: Props) {
  return (
    <span className="arg">
      <style jsx={true}>{`
        .arg:after {
          content: '';
        }
      `}</style>
      <TypeLink type={arg} onClick={onClickType} />
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
