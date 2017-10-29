import * as React from 'react' // tslint:disable-line
import * as cx from 'classnames'
import { PermissionQueryArgument } from '../../types'

export interface Props {
  variable: PermissionQueryArgument
  active: boolean
  onClick?: () => void
  className?: string
}

const VariableTag = ({ onClick, variable, active, className }: Props) => {
  const { name } = variable
  return (
    <div
      className={cx('variable-tag', active ? 'active' : '', className)}
      onClick={onClick}
    >
      <style jsx={true}>{`
        .variable-tag {
          @p: .br2, .white30, .flex, .itemsCenter;
          padding: 6px 6px 6px 9px;
        }
        .variable-tag.active {
          @p: .bgWhite10, .white60;
        }
        .name {
          @p: .f14, .fw4, .code, .lhSolid;
        }
        .type {
          @p: .code, .f12, .br2, .bgWhite04, .white60, .ml6;
          padding: 4px 5px 3px 5px;
        }
      `}</style>
      <div className="name">
        {name}
      </div>
      <div className="type">
        {renderType(variable)}
      </div>
    </div>
  )
}

export function renderType(variable: PermissionQueryArgument) {
  return variable.typeName + '!'
}

export default VariableTag
