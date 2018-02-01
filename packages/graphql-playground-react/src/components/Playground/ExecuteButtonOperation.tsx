import * as React from 'react'

export interface Props {
  operation: any
  onMouseOver: (operation: any) => void
  onMouseOut: () => void
  onMouseUp: (operation: any) => void
  highlight: any
}

const ExecuteButtonOperation: React.SFC<Props> = ({
  highlight,
  onMouseOver,
  onMouseOut,
  onMouseUp,
  operation,
}) => (
  <li
    key={operation.name ? operation.name.value : '*'}
    className={operation === highlight ? 'selected' : ''}
    // tslint:disable-next-line
    onMouseOver={() => onMouseOver(operation)}
    onMouseOut={onMouseOut}
    // tslint:disable-next-line
    onMouseUp={() => onMouseUp(operation)}
  >
    {operation.name ? operation.name.value : '<Unnamed>'}
  </li>
)

export default ExecuteButtonOperation
