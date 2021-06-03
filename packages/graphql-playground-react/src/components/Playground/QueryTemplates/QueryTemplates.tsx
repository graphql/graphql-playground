import * as React from 'react'
import { serializeRoot } from '../util/stack'
import { columnWidth } from '../../../constants'
import { editQuery } from '../../../state/sessions/actions'
import { queryTemplates } from './templates'
import { fillPropsToQuery } from './templateUtils'
import { connect } from 'react-redux'

export interface Props {
  schema: any
}

export interface ReduxProps {
  onChange?: (query: string) => void
  // onChange: (query: string) => void
}

/*
// export default class QueryTemplates extends React.PureComponent<Props, {}> {
export class QueryTemplates extends React.PureComponent<Props & ReduxProps, {}> {
*/

class QueryTemplates extends React.Component<
  Props & ReduxProps,
  {}
> {
  ref

  getWidth(props: any = this.props) {
    const rootWidth = columnWidth
    return rootWidth
  }

  render() {
    const { schema } = this.props

    const structuredSchema = serializeRoot(schema)
// tslint:disable-next-line:no-console
console.log(structuredSchema)

    const onSetQuery = (index: number) => {
      // const query = 
      // fillPropsToQuery(schema, queryTemplates[index].query)
      this.props.onChange(fillPropsToQuery(structuredSchema, queryTemplates[index].query))
    }

    const onQuerySelect = event => {
      const index = event.target.value

      if (index === '') {
        return
      }
// tslint:disable-next-line:no-console
console.log(event)
// tslint:disable-next-line:no-console
console.log(event.target.value)
// tslint:disable-next-line:no-console
console.log(queryTemplates)

      onSetQuery(index)
    }

    const templateSelectOptions = queryTemplates.map(({title}, key) => <option key={key} value={key}>{title}</option>)
    // tslint:disable-next-line:jsx-no-lambda
    const templateListItems = queryTemplates.map(({title}, key) => <div key={key} onClick={() => onSetQuery(key)}>{title}</div>)

    return (
      <div>
        Let's put something here

        <select onChange={onQuerySelect} value="">
          <option value="">--- Select query ---</option>
          {templateSelectOptions}
        </select>

        <div>
          {templateListItems}
        </div>
      </div>
    )
  }
}

import { createStructuredSelector } from 'reselect'
const mapStateToProps = createStructuredSelector({

})

export default connect(
  mapStateToProps,
  { onChange: editQuery },
)(QueryTemplates)
