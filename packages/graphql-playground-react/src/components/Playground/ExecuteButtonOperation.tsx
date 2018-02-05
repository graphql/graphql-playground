import * as React from 'react'

export interface Props {
  operation: any
  onMouseOver: (operation: any) => void
  onMouseOut: () => void
  onMouseUp: (operation: any) => void
  highlight: any
}

class ExecuteButtonOperation extends React.PureComponent<Props> {
  render() {
    return (
      <li
        key={this.props.operation.name ? this.props.operation.name.value : '*'}
        className={
          this.props.operation === this.props.highlight ? 'selected' : ''
        }
        onMouseOver={this.onMouseOver}
        onMouseOut={this.props.onMouseOut}
        onMouseUp={this.onMouseUp}
      >
        {this.props.operation.name
          ? this.props.operation.name.value
          : '<Unnamed>'}
      </li>
    )
  }
  private onMouseOver = () => {
    this.props.onMouseOver(this.props.operation)
  }

  private onMouseUp = () => {
    this.props.onMouseUp(this.props.operation)
  }
}

export default ExecuteButtonOperation
