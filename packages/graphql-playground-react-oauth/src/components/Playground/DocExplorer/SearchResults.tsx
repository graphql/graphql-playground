import * as React from 'react'
import { styled } from '../../../styled'
import TypeLink from './TypeLink'

export interface Props {
  schema: any
  withinType?: any
  searchValue: string
  level: number
  sessionId: string
}

export default class SearchResults extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.schema !== nextProps.schema ||
      this.props.searchValue !== nextProps.searchValue
    )
  }

  render() {
    const { level } = this.props
    const searchValue = this.props.searchValue
    const withinType = this.props.withinType
    const schema = this.props.schema

    const matchedWithin: any[] = []
    const matchedTypes: any[] = []
    const matchedFields: any[] = []

    const typeMap = schema.getTypeMap()
    let typeNames = Object.keys(typeMap)

    // Move the within type name to be the first searched.
    if (withinType) {
      typeNames = typeNames.filter(n => n !== withinType.name)
      typeNames.unshift(withinType.name)
    }

    let count = 0
    for (const typeName of typeNames) {
      if (
        matchedWithin.length + matchedTypes.length + matchedFields.length >=
        100
      ) {
        break
      }

      const type = typeMap[typeName]
      if (withinType !== type && isMatch(typeName, searchValue)) {
        matchedTypes.push(
          <div className="doc-category-item" key={typeName}>
            <TypeLink type={type} x={level} y={count++} lastActive={false} />
          </div>,
        )
      }

      if (type.getFields) {
        const fields = type.getFields()
        Object.keys(fields).forEach(fieldName => {
          const field = fields[fieldName]
          field.parent = type
          let matchingArgs

          if (!isMatch(fieldName, searchValue)) {
            if (field.args && field.args.length) {
              matchingArgs = field.args.filter(arg =>
                isMatch(arg.name, searchValue),
              )
              if (matchingArgs.length === 0) {
                return
              }
            } else {
              return
            }
          }

          const match = (
            <div className="doc-category-item" key={typeName + '.' + fieldName}>
              <TypeLink
                key="type"
                type={field}
                x={level}
                y={count++}
                showParentName={true}
                lastActive={false}
              />
            </div>
          )

          if (withinType === type) {
            matchedWithin.push(match)
          } else {
            matchedFields.push(match)
          }
        })
      }
    }

    if (
      matchedWithin.length + matchedTypes.length + matchedFields.length ===
      0
    ) {
      return <NoResult>No results found.</NoResult>
    }

    if (withinType && matchedTypes.length + matchedFields.length > 0) {
      return (
        <div>
          {matchedWithin}
          <div className="doc-category">
            <div className="doc-category-title">{'other results'}</div>
            {matchedTypes}
            {matchedFields}
          </div>
        </div>
      )
    }

    return (
      <div>
        {matchedWithin}
        {matchedTypes}
        {matchedFields}
      </div>
    )
  }
}

function isMatch(sourceText, searchValue) {
  try {
    const escaped = searchValue.replace(/[^_0-9A-Za-z]/g, ch => '\\' + ch)
    return sourceText.search(new RegExp(escaped, 'i')) !== -1
  } catch (e) {
    return sourceText.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
  }
}

const NoResult = styled.span`
  display: block;
  margin-top: 16px;
  margin-left: 16px;
`
