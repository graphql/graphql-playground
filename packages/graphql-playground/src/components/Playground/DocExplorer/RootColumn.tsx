import * as React from 'react'
import ColumnDoc from './ColumnDoc'
import SearchResults from './SearchResults'
import GraphDocsRoot from './GraphDocsRoot'
import SearchBox from './SearchBox'

interface Props {
  searchValue: string
  schema: any
  width: number
  setWidth: (width: number) => void
  handleSearch: (value: string) => void
}

export default class RootColumn extends React.PureComponent<Props, {}> {
  render() {
    const { searchValue, schema, width, setWidth, handleSearch } = this.props
    return (
      <ColumnDoc width={width} overflow={false}>
        <SearchBox isShown={true} onSearch={handleSearch} />
        <div className="overflowAuto flexAuto">
          {searchValue &&
            <SearchResults
              searchValue={searchValue}
              schema={schema}
              level={0}
              onSetWidth={setWidth}
            />}
          {!searchValue &&
            <GraphDocsRoot schema={schema} onSetWidth={setWidth} />}
        </div>
      </ColumnDoc>
    )
  }
}
