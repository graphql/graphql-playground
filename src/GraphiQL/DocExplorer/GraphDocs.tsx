import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { isType } from 'graphql'
import { getLeft } from 'graphiql/dist/utility/elementPosition'
import { DocExplorer } from '../DocExplorer'
import FieldDoc from './FieldDoc'
import SearchBox from './SearchBox'
import SearchResults from './SearchResults'
import GraphDocsRoot from './GraphDocsRoot'
import ColumnDoc from './ColumnDoc'

export interface Props {
  schema: any
  storageGet: (key: string) => any
  storageSet: (key: string, val: any) => void
}

export interface State {
  docsOpen: boolean
  docsWidth: number
  navStack: any[]
  searchValue: string
}

export default class GraphDocs extends React.Component<Props, State> {
  private docExplorerComponent: any

  constructor(props) {
    super(props)
    // Take old values from storage
    this.state = {
      docsOpen: props.storageGet('docExplorerOpen') === 'true' || false,
      docsWidth: Number(props.storageGet('docExplorerWidth')) || 350,
      navStack: [],
      searchValue: '',
    }
  }

  componentWillUnmount() {
    // Save values for next session when the component is destroyed
    this.props.storageSet('docExplorerWidth', this.state.docsWidth)
    this.props.storageSet('docExplorerOpen', this.state.docsOpen)
  }

  render() {
    const { schema } = this.props
    const { docsOpen, docsWidth, navStack, searchValue } = this.state
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
                  onClickType={type => this.handleClickField(type, 0)}
                />}
              {!searchValue &&
                <GraphDocsRoot
                  schema={schema}
                  onClickType={this.handleClickField}
                />}
            </ColumnDoc>}
          {navStack.map((stack, id) =>
            <ColumnDoc key={id}>
              <FieldDoc
                schema={schema}
                field={stack}
                onClickType={this.handleClickField}
                level={id + 1}
              />
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
    this.setState({ docsOpen: !this.state.docsOpen })
  }

  private handleClickField = (field, level) => {
    const { navStack } = this.state
    const isCurrentlyShown =
      navStack.length > 0 && navStack[navStack.length - 1] === field
    // If type is of type query etc.. empty the list
    if (level === 0) {
      this.setState({ navStack: [field] })
    } else if (!isCurrentlyShown) {
      let newNavStack = navStack
      if (level < navStack.length) {
        newNavStack = navStack.slice(0, level)
      }
      newNavStack = newNavStack.concat([field])
      this.setState({ navStack: newNavStack })
    }
  }

  private handleDocsResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.state.docsWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = ReactDOM.findDOMNode(this)
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const docsSize = app.clientWidth - cursorPos

      if (docsSize < 100) {
        this.setState({ docsOpen: false })
      } else {
        this.setState({
          docsOpen: true,
          docsWidth: Math.min(docsSize, 850),
        })
      }
    }

    let onMouseUp: any = () => {
      if (!this.state.docsOpen) {
        this.setState({ docsWidth: hadWidth })
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
