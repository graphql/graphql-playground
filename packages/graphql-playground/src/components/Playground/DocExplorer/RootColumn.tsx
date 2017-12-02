import * as React from 'react'
import ColumnDoc from './ColumnDoc'
import SearchResults from './SearchResults'
import GraphDocsRoot from './GraphDocsRoot'
import SearchBox from './SearchBox'

export interface Props {
  searchValue: string
  schema: any
  width: number
  handleSearch: (value: string) => void
  sessionId: string
}

export default class RootColumn extends React.PureComponent<Props, {}> {
  render() {
    const { searchValue, schema, width, sessionId, handleSearch } = this.props
    return (
      <ColumnDoc width={width} overflow={false}>
        <SearchBox isShown={true} onSearch={handleSearch} />
        <div className="overflowAuto flexAuto">
          {searchValue && (
            <SearchResults
              searchValue={searchValue}
              schema={schema}
              level={0}
              sessionId={sessionId}
            />
          )}
          {!searchValue && (
            <GraphDocsRoot schema={schema} sessionId={sessionId} />
          )}
        </div>
      </ColumnDoc>
    )
  }
}
