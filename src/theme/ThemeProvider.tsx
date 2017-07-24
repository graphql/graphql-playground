import * as React from 'react'
import * as PropTypes from 'prop-types'

export class Theme {
  theme: string
  subscriptions: any[]

  constructor(theme: string) {
    this.theme = theme
    this.subscriptions = []
  }

  setTheme(theme) {
    this.theme = theme
    this.subscriptions.forEach(f => f())
  }

  subscribe(f) {
    this.subscriptions.push(f)
  }
}

export interface ThemeProviderProps {
  theme: string
}

// tslint:disable-next-line
export default class ThemeProvider extends React.Component<
  ThemeProviderProps,
  {}
> {
  static childContextTypes = {
    theme: PropTypes.object,
  }

  private theme: Theme

  constructor(p, c) {
    super(p, c)
    // theme provider uses the same Theme object
    // during it's entire lifecycle
    this.theme = new Theme(this.props.theme)
  }

  // update theme whenever needed. This propagate changes to subscribed components
  componentWillReceiveProps(next) {
    this.theme.setTheme(next.theme)
  }

  getChildContext() {
    return { theme: this.theme }
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
