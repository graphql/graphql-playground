import * as React from 'react'
import * as PropTypes from 'prop-types'

export interface ThemeProps {
  onRef?: any
}

function withTheme<Props = { onRef?: any }>(
  Component,
): React.ComponentClass<Props> {
  return class WithTheme extends React.Component<Props & ThemeProps, {}> {
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
        <Component
          localTheme={this.context.localTheme.theme}
          {...this.props}
          ref={this.props.onRef}
        />
      )
    }
  }
}

export default withTheme
