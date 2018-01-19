import * as React from 'react'
import Tooltip from '../Tooltip'

export default class TokenTooltip extends React.Component {
  render() {
    return (
      <Tooltip
        open={true}
        onClose={this.handleToggle}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <h1>This is the tooltip</h1>
      </Tooltip>
    )
  }
  handleToggle = () => {
    //
  }
}
