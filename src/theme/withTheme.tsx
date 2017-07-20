import * as React from 'react'
import * as PropTypes from 'prop-types'

function withTheme<Props = {}>(Component) {
  class WithTheme extends React.Component<Props, {}> {
    static contextTypes = {
      theme: PropTypes.object,
    }

    componentDidMount() {
      // subscribe to future theme changes
      this.context.theme.subscribe(() => this.forceUpdate())
    }
    render() {
      return <Component theme={this.context.theme.theme} {...this.props} />
    }
  }
  return WithTheme
}

export default withTheme
