import * as React from 'react'
import * as cx from 'classnames'
import { columnWidth } from '../../../constants'

export interface Props {
  children: any
  first?: boolean
  overflow?: boolean
  width?: number
}

const ColumnDoc = ({
  children,
  first,
  overflow = true,
  width = columnWidth,
}: Props) => {
  return (
    <div
      className={cx('graph-docs-column', { first, overflow })}
      style={{ width }}
    >
      <style jsx={true}>{`
        .graph-docs-column {
          @p: .flexFixed, .pb20, .br, .bBlack10, .flex, .flexColumn;
        }
        .overflow {
          overflow-x: hidden;
          overflow-y: scroll;
        }
      `}</style>
      {children}
    </div>
  )
}

export default ColumnDoc
