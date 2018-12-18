import * as React from 'react'
import Spinner from './Spinner'

export interface State {
  component?: any
}

const asyncComponent = importComponent => {
  return class extends React.Component<any, State> {
    state: State = {
      component: null,
    }
    componentDidMount() {
      importComponent().then(cmp => {
        this.setState({ component: cmp.default })
      })
    }

    render() {
      const C = this.state.component as any
      return C ? <C {...this.props} /> : <Spinner />
    }
  }
}

export default asyncComponent
