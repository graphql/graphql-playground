import * as React from 'react'
import { InfiniteLoader, Grid, AutoSizer } from 'react-virtualized'

interface Props {
  rows: any[]
  fields: string[]
  rowCount: number
  loadMoreRows: (settings: {startIndex: number, stopIndex: number}) => void
}

interface State {
  height: number
  rowHeight: number
  overscanRowCount: number
  selectedRow: number
}

function pZ(n: number) {
  return n < 10 ? `0${n}` : n
}

export default class Table extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      height: 300,
      rowHeight: 54,
      overscanRowCount: 10,
      selectedRow: -1,
    }

    global['t'] = this
  }

  render() {
    const { rowCount } = this.props
    const { height, rowHeight, overscanRowCount } = this.state

    return (
      <div>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.props.loadMoreRows}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <Grid
                  cellRenderer={this.cellRenderer}
                  className='grid'
                  noContentRenderer={this.noContentRenderer}
                  columnWidth={this.getColumnWidth}
                  columnCount={this.props.fields.length}
                  overscanRowCount={overscanRowCount}
                  rowHeight={rowHeight}
                  rowCount={rowCount}
                  width={width}
                  height={height}
                  registerChild={registerChild}
                  onRowsRendered={onRowsRendered}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    )
  }

  private noContentRenderer = () => {
    return (
      <div>
        No Cells
      </div>
    )
  }

  private textToString(value) {
    if (value instanceof Date) {
      return `${pZ(value.getMonth() + 1)}/${pZ(value.getDate())}/${value.getFullYear().toString().slice(2,4)} ` +
          `${value.getHours()}:${pZ(value.getMinutes())}:${pZ(value.getSeconds())}`
    }
    return value.toString()
  }

  private cellRenderer = ({key, style, columnIndex, rowIndex}) => {
    const field = this.props.fields[columnIndex]
    const {selectedRow} = this.state
    return (
      <div
        key={key}
        style={style}
        className={`cell ${selectedRow === rowIndex ? 'selected' : ''}`}
        onClick={() => this.selectRow(rowIndex)}
      >
        <style jsx>{`
          .cell {
            @inherit: .bbox, .pv16, .ph25, .f16;
            &.selected {
              @inherit: .bgBlue, .white;
            }
          }
        `}</style>
        {this.textToString(this.props.rows[rowIndex][field])}
      </div>
    )
  }

  private selectRow(rowIndex: number) {
    this.setState({selectedRow: rowIndex} as State)
  }

  private isRowLoaded = ({index}) => {
    return Boolean(this.props.rows[index])
  }

  private getColumnWidth = () => {
    return 250
  }
}