import * as React from 'react'
import * as cx from 'classnames'

export interface Props {
  children: any
  first?: boolean
}

const ColumnDoc = ({ children, first }: Props) => {
  return (
    <div className={cx('graph-docs-column', { first })}>
      <style jsx={true}>{`
        .graph-docs-column {
          @p: .flexFixed, .pb20, .br, .bBlack10;
          width: 300px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .graph-docs-column.first {
          width: 294px;
        }
      `}</style>
      {children}
    </div>
  )
}

export default ColumnDoc
