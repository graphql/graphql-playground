import * as React from 'react'

export interface Props {
  operation: any
  onMouseOver: (operation: any) => void
  onMouseOut: () => void
  onMouseUp: (operation: any) => void
  highlight: any
}

export default class ExecuteButtonOperation extends React.Component<Props, {}> {
  render() {
    const { operation, highlight } = this.props
    return (
      <li
        key={operation.name ? operation.name.value : '*'}
        className={operation === highlight ? 'selected' : ''}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        onMouseUp={this.handleMouseUp}
      >
        {operation.name ? operation.name.value : '<Unnamed>'}
      </li>
    )
  }

  private handleMouseOver = () => {
    this.props.onMouseOver(this.props.operation)
  }

  private handleMouseOut = () => {
    this.props.onMouseOut()
  }

  private handleMouseUp = () => {
    this.props.onMouseUp(this.props.operation)
  }
}
