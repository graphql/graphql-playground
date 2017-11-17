import * as React from 'react'
import * as PropTypes from 'prop-types'

function withTheme<Props = {}>(Component): React.ComponentClass<Props> {
  return class WithTheme extends React.Component<Props, {}> {
    static contextTypes = {
      localTheme: PropTypes.object,
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
      this.context.localTheme.subscribe(this.rerender)
    }

    componentWillUnmount() {
      this.mounted = false
      this.context.localTheme.unsubscribe(this.rerender)
    }

    render() {
      return (
        <Component localTheme={this.context.localTheme.theme} {...this.props} />
      )
    }
  }
}

export default withTheme
