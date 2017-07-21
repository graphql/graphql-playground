import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getLeft } from 'graphiql/dist/utility/elementPosition'
import FieldDoc from './FieldDoc'
import SearchBox from './SearchBox'
import SearchResults from './SearchResults'
import GraphDocsRoot from './GraphDocsRoot'
import ColumnDoc from './ColumnDoc'
import { toggleDocs, changeWidthDocs } from '../../actions/graphiql-docs'

interface StateFromProps {
  navStack: any[]
  docsOpen: boolean
  docsWidth: number
}

interface DispatchFromProps {
  toggleDocs: (open?: boolean) => any
  changeWidthDocs: (width: number) => any
}

export interface Props {
  schema: any
}

export interface State {
  searchValue: string
}

class GraphDocs extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
> {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
    }
  }

  render() {
    const { docsOpen, docsWidth, schema, navStack } = this.props
    const { searchValue } = this.state
    const docsStyle = { width: docsOpen ? docsWidth : 0 }

    let emptySchema
    if (schema === undefined) {
      // Schema is undefined when it is being loaded via introspection.
      emptySchema = (
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      )
    } else if (schema === null) {
      // Schema is null when it explicitly does not exist, typically due to
      // an error during introspection.
      emptySchema = (
        <div className="error-container">
          {'No Schema Available'}
        </div>
      )
    }

    return (
      <div className="graph-docs docExplorerWrap" style={docsStyle}>
        <style jsx={true} global={true}>{`
          .graphiql-container .doc-category-title {
            @p: .mh0, .ph16;
            border: none;
          }
          .graphiql-container .doc-type-description {
            @p: .mh0, .ph16, .f14;
          }
          .doc-header .doc-category-item {
            @p: .f16;
            word-wrap: break-word;
          }
        `}</style>
        <style jsx={true}>{`
          .graph-docs {
            @p: .absolute, .right0, .h100, .z999;
          }
          .docs-button {
            @inherit: .absolute, .white, .bgGreen, .pa6, .br2, .z2, .ttu, .fw6,
              .f14, .ph10, .pointer;
            padding-bottom: 8px;
            transform: rotate(-90deg);
            left: -44px;
            top: 115px;
          }
          .doc-explorer {
            @p: .flex, .flexRow;
            @inherit: .relative, .h100;
            border-left: 6px solid $green;
            overflow-x: auto;
            overflow-y: hidden;
          }
        `}</style>
        <div className="docs-button" onClick={this.handleToggleDocs}>
          Docs
        </div>
        <div
          className="docExplorerResizer"
          onMouseDown={this.handleDocsResizeStart}
        />
        <div className="doc-explorer">
          {emptySchema &&
            <ColumnDoc>
              {emptySchema}
            </ColumnDoc>}
          {schema &&
            <ColumnDoc>
              <SearchBox isShown={true} onSearch={this.handleSearch} />
              {searchValue &&
                <SearchResults
                  searchValue={searchValue}
                  schema={schema}
                  level={0}
                />}
              {!searchValue && <GraphDocsRoot schema={schema} />}
            </ColumnDoc>}
          {navStack.map((stack, id) =>
            <ColumnDoc key={id}>
              <FieldDoc schema={schema} field={stack} level={id + 1} />
            </ColumnDoc>,
          )}
        </div>
      </div>
    )
  }

  private handleSearch = (value: string) => {
    this.setState({ searchValue: value })
  }

  private handleToggleDocs = () => {
    this.props.toggleDocs()
  }

  private handleDocsResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.props.docsWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = ReactDOM.findDOMNode(this)
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const docsSize = app.clientWidth - cursorPos

      if (docsSize < 100) {
        this.props.toggleDocs(false)
      } else {
        this.props.toggleDocs(true)
        this.props.changeWidthDocs(Math.min(docsSize, 850))
      }
    }

    let onMouseUp: any = () => {
      if (!this.props.docsOpen) {
        this.props.changeWidthDocs(hadWidth)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
}

const mapStateToProps = ({ graphiqlDocs }) => ({
  navStack: graphiqlDocs.navStack,
  docsOpen: graphiqlDocs.docsOpen,
  docsWidth: graphiqlDocs.docsWidth,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      toggleDocs,
      changeWidthDocs,
    },
    dispatch,
  )

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(GraphDocs)
