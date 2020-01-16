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
    let searchValue = this.props.searchValue
    const withinType = this.props.withinType
    const schema = this.props.schema

    let matchFn = isMatch
    let exactMatch = false
    if (searchValue.match(/^".+"$/)) {
      exactMatch = true
      matchFn = isExactMatch
      searchValue = searchValue.slice(1, searchValue.length - 1)
    }

    let subtypeSearch: null | string = null
    const subtypeMatch = searchValue.match(/\./g)
    if (!withinType && subtypeMatch && subtypeMatch.length === 1) {
      const parts = searchValue.split('.')
      const typePart = parts[0]
      const newSearchValue = parts[1]
      if (typePart.length > 0) {
        subtypeSearch = typePart
        searchValue = newSearchValue
      }
    }

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
      if (
        withinType !== type &&
        matchFn(typeName, searchValue) &&
        !subtypeSearch
      ) {
        matchedTypes.push(
          <div className="doc-category-item" key={typeName}>
            <TypeLink type={type} x={level} y={count++} lastActive={false} />
          </div>,
        )
      }

      /* don't show match for e.g. Query.Asset when searching for exact match "Asset",
         only show Asset, however, for "Query.Asset" we want to use the maching logic
         within this if clause */
      if (type.getFields && (!exactMatch || (exactMatch && subtypeMatch))) {
        const fields = type.getFields()
        Object.keys(fields).forEach(fieldName => {
          const field = fields[fieldName]
          field.parent = type
          let matchingArgs

          /* when doing a Query.Asset search, don't match args and stuff within the query */
          if (!matchFn(fieldName, searchValue) && !subtypeSearch) {
            if (field.args && field.args.length) {
              matchingArgs = field.args.filter(arg =>
                matchFn(arg.name, searchValue),
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

          /* when doing a search within a type the subtypeSearch should be false */
          if (withinType === type) {
            matchedWithin.push(match)
          } else if (subtypeSearch) {
            /* in e.g. Query.Asset search, both Query and Asset must match */
            if (
              matchFn(typeName, subtypeSearch) &&
              matchFn(fieldName, searchValue)
            ) {
              matchedFields.push(match)
            }
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
function isExactMatch(sourceText, searchValue) {
  return sourceText === searchValue
}

const NoResult = styled.span`
  display: block;
  margin-top: 16px;
  margin-left: 16px;
`
