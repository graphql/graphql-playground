import * as React from 'react'
import { serializeRoot } from '../util/stack'
import { columnWidth } from '../../../constants'
import { editQuery } from '../../../state/sessions/actions'
import { queryTemplates } from './templates'
import { fillDescriptionToQuery, fillPropsToQuery } from './templateUtils'
import { connect } from 'react-redux'
import { SideTabContentProps } from '../ExplorerTabs/SideTabs'
import { styled } from '../../../styled'

export interface Props {
  schema: any
}

export interface ReduxProps {
  onChange?: (query: string) => void
}

export interface State {
  includeRelations: boolean
}

/*
// export default class QueryTemplates extends React.PureComponent<Props, {}> {
export class QueryTemplates extends React.PureComponent<Props & ReduxProps, {}> {
*/

class QueryTemplates extends React.Component<
  Props & ReduxProps & SideTabContentProps,
  State
> {
  state = { includeRelations: true }
  ref

  private maxQueryRecursion: number = 1

  getWidth(props: any = this.props) {
    const rootWidth = columnWidth
    return rootWidth
  }

  setWidth(props: any = this.props) {
    this.props.setWidth(props)
  }

  render() {
    const { schema } = this.props

    const structuredSchema = serializeRoot(schema)

// tslint:disable-next-line:no-console
console.log(queryTemplates)
// tslint:disable-next-line:no-console
console.log(structuredSchema)

    // create query from template and pass it to editor
    const onSetQuery = (index: number) => {
      const maxQueryRecursion = this.state.includeRelations
        ? this.maxQueryRecursion
        : 0
      const queryWithProps = fillPropsToQuery(structuredSchema, queryTemplates[index].query, maxQueryRecursion)
      const queryWithDescription = fillDescriptionToQuery(queryWithProps, queryTemplates[index].description)
      this.props.onChange(queryWithDescription)
    }

    // set query on selectbox change
    const onQuerySelect = event => {
      const index = event.target.value

      if (index === '') {
        return
      }

      onSetQuery(index)
    }

    // change include relations sign
    const onIncludeRelationsChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox'
        ? target.checked
        : target.value

      this.setState({ includeRelations: value })
    }

    // create list and selectbox items
    const templateSelectOptions = queryTemplates.map(({title}, key) => <option key={key} value={key}>{title}</option>)
    // tslint:disable-next-line:jsx-no-lambda
    const templateListItems = queryTemplates.map(({title}, key) => <TemplateListItem key={key} onClick={() => onSetQuery(key)}>{title}</TemplateListItem>)

    return (
      <TemplatesContainer>
        Select a query template via selectbox or click on a name

        <Hr />

        <select onChange={onQuerySelect} value="">
          <option value="">--- Select query ---</option>
          {templateSelectOptions}
        </select>

        <Hr />

        <label>
          <input
            type="checkbox"
            checked={this.state.includeRelations}
            onChange={onIncludeRelationsChange} />
            Include relations
        </label>

        <Hr />

        <TemplateListContainer>
          {templateListItems}
        </TemplateListContainer>
      </TemplatesContainer>
    )
  }
}

import { createStructuredSelector } from 'reselect'
const mapStateToProps = createStructuredSelector({
  // no state mapping needed
})

export default connect(
  mapStateToProps,
  { onChange: editQuery },
)(QueryTemplates)

const TemplatesContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

const TemplateListContainer = styled.div`
  overflow: auto;
`

const TemplateListItem = styled.div`
  cursor: pointer;
  padding: 5px;

  &:hover {
    background-color: #ddd;
  }
`

const Hr = styled.hr`
  width: 100%;
  border: none;
  border-bottom: 1px solid #ddd;
`
