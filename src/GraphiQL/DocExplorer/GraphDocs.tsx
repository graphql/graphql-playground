import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as keycode from 'keycode'
import { getLeft } from 'graphiql/dist/utility/elementPosition'
import FieldDoc from './FieldDoc'
import SearchBox from './SearchBox'
import SearchResults from './SearchResults'
import GraphDocsRoot from './GraphDocsRoot'
import ColumnDoc from './ColumnDoc'
import {
  addStack,
  toggleDocs,
  changeWidthDocs,
  changeKeyMove,
} from '../../actions/graphiql-docs'
import { serialize, serializeRoot, getElement, getElementRoot } from './utils'

interface StateFromProps {
  navStack: any[]
  docsOpen: boolean
  docsWidth: number
  keyMove: boolean
}

interface DispatchFromProps {
  addStack: (field: any, x: number, y: number) => any
  toggleDocs: (open?: boolean) => any
  changeWidthDocs: (width: number) => any
  changeKeyMove: (move: boolean) => any
}

export interface Props {
  schema: any
}

export interface State {
  searchValue: string
  clientX?: number
  clientY?: number
}

class GraphDocs extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
> {
  private refDocExplorer: any

  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
    }
  }

  componentWillReceiveProps(nextProps: Props & StateFromProps) {
    // If user use default column size % 300
    // Make the column follow the clicks
    if (
      this.props.navStack.length < nextProps.navStack.length &&
      nextProps.navStack.length < 3 &&
      this.props.docsWidth % 300 === 0
    ) {
      this.props.changeWidthDocs(300 * (nextProps.navStack.length + 1))
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
            @p: .flex, .flexRow, .relative;
            @inherit: .h100;
            border-left: 6px solid $green;
            overflow-x: auto;
            overflow-y: hidden;
            letter-spacing: 0.3px;
            outline: none;
          }
          .doc-explorer-gradient {
            @p: .z1, .absolute, .top0, .bottom0;
            pointer-events: none;
            content: "";
            width: 20px;
            left: 6px;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 1),
              rgba(255, 255, 255, 0)
            );
          }
        `}</style>
        <div className="docs-button" onClick={this.handleToggleDocs}>
          Docs
        </div>
        <div
          className="docExplorerResizer"
          onMouseDown={this.handleDocsResizeStart}
        />
        <div className="doc-explorer-gradient" />
        <div
          className="doc-explorer"
          onKeyDown={this.handleKeyDown}
          onMouseMove={this.handleMouseMove}
          tabIndex={0}
          ref={element => {
            this.refDocExplorer = element
          }}
        >
          {emptySchema &&
            <ColumnDoc>
              {emptySchema}
            </ColumnDoc>}
          {schema &&
            <ColumnDoc first={true}>
              <SearchBox isShown={true} onSearch={this.handleSearch} />
              {searchValue &&
                <SearchResults
                  searchValue={searchValue}
                  schema={schema}
                  level={0}
                />}
              {!searchValue && <GraphDocsRoot schema={schema} />}
            </ColumnDoc>}
          {navStack.map((stack, index) =>
            <ColumnDoc key={index}>
              <FieldDoc schema={schema} field={stack.field} level={index + 1} />
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
    if (!this.props.docsOpen) {
      this.refDocExplorer.focus()
    }
    this.props.toggleDocs()
  }

  private handleMouseMove = e => {
    this.setState({ clientX: e.clientX, clientY: e.clientY })
    if (
      this.props.keyMove &&
      this.state.clientX !== e.clientX &&
      this.state.clientY !== e.clientY
    ) {
      this.props.changeKeyMove(false)
    }
  }

  private handleKeyDown = e => {
    // we don't want to interfer with inputs
    if (e.target instanceof HTMLInputElement) {
      return
    }
    e.preventDefault()
    this.props.changeKeyMove(true)
    const lastNavStack =
      this.props.navStack.length > 0 &&
      this.props.navStack[this.props.navStack.length - 1]
    const beforeLastNavStack =
      this.props.navStack.length > 0 &&
      this.props.navStack[this.props.navStack.length - 2]
    const keyPressed = keycode(e)
    switch (keyPressed) {
      case 'esc':
        this.props.toggleDocs(false)
        break
      case 'left':
        if (beforeLastNavStack) {
          this.props.addStack(
            beforeLastNavStack.field,
            beforeLastNavStack.x,
            beforeLastNavStack.y,
          )
        }
        break
      case 'right':
        if (lastNavStack) {
          const obj = serialize(this.props.schema, lastNavStack.field)
          const firstElement = getElement(obj, 0)
          if (firstElement) {
            this.props.addStack(firstElement, lastNavStack.x + 1, 0)
          }
        } else {
          const obj = serializeRoot(this.props.schema)
          const element = getElementRoot(obj, 0)
          if (element) {
            this.props.addStack(element, 0, 0)
          }
        }
        break
      case 'up':
      case 'down':
        if (beforeLastNavStack) {
          const obj = serialize(this.props.schema, beforeLastNavStack.field)
          const element = getElement(
            obj,
            keyPressed === 'up' ? lastNavStack.y - 1 : lastNavStack.y + 1,
          )
          if (element) {
            this.props.addStack(
              element,
              lastNavStack.x,
              keyPressed === 'up' ? lastNavStack.y - 1 : lastNavStack.y + 1,
            )
          }
        } else {
          const obj = serializeRoot(this.props.schema)
          const element = getElementRoot(
            obj,
            keyPressed === 'up' ? lastNavStack.y - 1 : lastNavStack.y + 1,
          )
          if (element) {
            this.props.addStack(
              element,
              0,
              keyPressed === 'up' ? lastNavStack.y - 1 : lastNavStack.y + 1,
            )
          }
        }
        break
    }
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
        this.props.changeWidthDocs(docsSize)
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
  keyMove: graphiqlDocs.keyMove,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addStack,
      toggleDocs,
      changeWidthDocs,
      changeKeyMove,
    },
    dispatch,
  )

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(GraphDocs)
