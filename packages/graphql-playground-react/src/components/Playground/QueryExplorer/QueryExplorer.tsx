import * as React from 'react'
import Explorer from 'graphiql-explorer'
import { connect } from 'react-redux'

import { columnWidth } from '../../../constants'

class QueryExplorer extends React.PureComponent<any> {
  ref: any

  setRef = ref => {
    this.ref = ref
  }

  getWidth(props: any = this.props) {
    return columnWidth
  }

  setWidth(props: any = this.props) {
    this.props.setWidth(props)
  }

  render() {
    return (
      <Explorer
        ref={this.setRef}
        schema={this.props.schema}
        query={this.props.schema}
        onEdit={this.props.handleEditQuery}
        explorerIsOpen={true}
      />
    )
  }
}

export default connect<any, any, any>(
  null,
  null,
  null,
  { withRef: true },
)(QueryExplorer)
