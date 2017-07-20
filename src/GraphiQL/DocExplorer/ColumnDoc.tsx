import * as React from 'react'
import * as classNames from 'classnames'

export interface Props {
  children: any
}

const ColumnDoc = ({ children }: Props) => {
  return (
    <div className="graph-docs-column">
      <style jsx={true}>{`
        .graph-docs-column {
          @p: .flexFixed, .pb20;
          width: 300px;
          overflow-y: auto;
          overflow-x: hidden;
          @p: .br, .bBlack10;
        }
      `}</style>
      {children}
    </div>
  )
}

export default ColumnDoc
