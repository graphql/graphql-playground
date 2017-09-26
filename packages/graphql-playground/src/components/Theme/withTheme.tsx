import * as React from 'react'
import * as PropTypes from 'prop-types'

function withTheme<Props = {}>(Component): React.ComponentClass<Props> {
  return class WithTheme extends React.Component<Props, {}> {
    static contextTypes = {
      theme: PropTypes.object,
    }
    mounted: boolean

    rerender = () => {
      if (this.mounted) {
        this.forceUpdate()
      }
    }

    componentDidMount() {
      // subscribe to future theme changes
      this.mounted = true
      this.context.theme.subscribe(this.rerender)
    }

    componentWillUnmount() {
      this.mounted = false
      this.context.theme.unsubscribe(this.rerender)
    }

    render() {
      return <Component theme={this.context.theme.theme} {...this.props} />
    }
  }
}

export default withTheme
