import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as keycode from 'keycode'
import { getLeft } from 'graphiql/dist/utility/elementPosition'
import FieldDoc from './FieldDoc'
import ColumnDoc from './ColumnDoc'
import {
  addStack,
  toggleDocs,
  changeWidthDocs,
  changeKeyMove,
} from '../../../state/docs/actions'
import Spinner from '../../Spinner'
import { columnWidth } from '../../../constants'
import RootColumn from './RootColumn'
import * as cn from 'classnames'
import {
  serialize,
  getElementRoot,
  serializeRoot,
  getElement,
} from '../util/stack'
import { GraphQLSchema } from 'graphql'
import { getSessionDocs } from '../../../state/docs/selectors'

interface StateFromProps {
  navStack: any[]
  docsOpen: boolean
  docsWidth: number
  keyMove: boolean
}

interface DispatchFromProps {
  addStack: (sessionId: string, field: any, x: number, y: number) => any
  toggleDocs: (sessionId: string, open?: boolean) => any
  changeWidthDocs: (sessionId: string, width: number) => any
  changeKeyMove: (sessionId: string, move: boolean) => any
}

export interface Props {
  schema: GraphQLSchema
  sessionId: string
}

export interface State {
  searchValue: string
  widthMap: any
}

class GraphDocs extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
> {
  private refDocExplorer: any
  private clientX: number = 0
  private clientY: number = 0

  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      widthMap: {},
    }
    ;(window as any).d = this
  }

  componentWillReceiveProps(nextProps: Props & StateFromProps) {
    // If user use default column size % columnWidth
    // Make the column follow the clicks
    if (
      this.props.navStack.length !== nextProps.navStack.length ||
      this.props.navStack.slice(-1)[0] !== nextProps.navStack.slice(-1)[0] ||
      (!this.props.schema && nextProps.schema)
    ) {
      this.setWidth(nextProps)
    }
  }

  setWidth(props: any = this.props) {
    requestAnimationFrame(() => {
      const width = this.getWidth(props)
      this.props.changeWidthDocs(
        props.sessionId,
        Math.min(width, window.innerWidth - 86),
      )
    })
  }

  getWidth(props: any = this.props) {
    const rootWidth = this.state.widthMap.root || columnWidth
    const stackWidths = props.navStack.map(
      stack => this.state.widthMap[stack.field.path] || columnWidth,
    )

    return [rootWidth].concat(stackWidths).reduce((acc, curr) => acc + curr, 0)
  }

  componentDidMount() {
    this.setWidth()
  }

  render() {
    const { docsOpen, docsWidth, schema, navStack } = this.props
    const docsStyle = { width: docsOpen ? docsWidth : 0 }

    let emptySchema
    if (schema === undefined) {
      // Schema is undefined when it is being loaded via introspection.
      emptySchema = <Spinner />
    } else if (schema === null) {
      // Schema is null when it explicitly does not exist, typically due to
      // an error during introspection.
      emptySchema = (
        <div className="error-container">{'No Schema Available'}</div>
      )
    }

    return (
      <div
        className={cn('graph-docs docExplorerWrap docs', { open: docsOpen })}
        style={docsStyle}
      >
        <style jsx={true} global={true}>{`
          .graphiql-container .doc-category-title {
            @p: .mh0, .ph16;
            border: none;
          }
          .doc-type-description p {
            @p: .pa16, .f14;
          }
          .graphiql-container .doc-type-description {
            @p: .mh0, .ph16, .f14;
          }
          .doc-header .doc-category-item {
            @p: .f16;
            word-wrap: break-word;
          }
          .doc-description p {
            @p: .f14;
          }
        `}</style>
        <style jsx={true}>{`
          .docs :global(.doc-category-title) {
            @p: .pa16, .f14;
          }
          .graph-docs :global(code) {
            @p: .mono, .br2;
            padding: 1px 2px;
            background: rgba(0, 0, 0, 0.06);
          }
          .graph-docs {
            @p: .absolute, .h100;
            right: -2px;
          }
          .graph-docs.open {
            z-index: 2000;
          }
          .docs-button {
            @p: .absolute, .white, .bgGreen, .pv6, .z2, .ttu, .fw6, .f12, .ph10,
              .pointer;
            box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);
            line-height: 17px;
            letter-spacing: 0.45px;
            padding-bottom: 8px;
            transform: rotate(-90deg);
            left: -50px;
            top: 129px;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
          }
          .doc-explorer {
            @p: .flex, .relative, .h100;
            letter-spacing: 0.3px;
            outline: none;
            box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);
          }
          .doc-explorer-container {
            @p: .flex, .relative, .h100, .w100;
            overflow-x: auto;
            overflow-y: hidden;
          }
          .doc-explorer:before {
            @p: .top0, .bottom0, .bgGreen, .absolute, .z3;
            left: 0px;
            content: '';
            width: 6px;
          }
          .doc-explorer-gradient {
            @p: .z1, .absolute, .top0, .bottom0;
            pointer-events: none;
            content: '';
            width: 20px;
            left: 0px;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 1) 30%,
              rgba(255, 255, 255, 0)
            );
          }
          .docExplorerResizer {
            @p: .top0, .bottom0, .absolute, .z5;
            cursor: col-resize;
            left: -7px;
            content: '';
            width: 20px;
          }
        `}</style>
        <div className="docs-button" onClick={this.handleToggleDocs}>
          Schema
        </div>
        <div
          className="docExplorerResizer"
          onMouseDown={this.handleDocsResizeStart}
        />
        <div className="doc-explorer-gradient" />
        {docsOpen && (
          <div
            className="doc-explorer"
            onKeyDown={this.handleKeyDown}
            onMouseMove={this.handleMouseMove}
            tabIndex={0}
            ref={this.setDocExplorerRef}
          >
            <div className="doc-explorer-container">
              {emptySchema && <ColumnDoc>{emptySchema}</ColumnDoc>}
              {schema && (
                <RootColumn
                  schema={schema}
                  width={this.state.widthMap.root || columnWidth - 1}
                  searchValue={this.state.searchValue}
                  handleSearch={this.handleSearch}
                  sessionId={this.props.sessionId}
                />
              )}
              {navStack.map((stack, index) => (
                <ColumnDoc
                  key={index}
                  width={this.state.widthMap[stack.field.path] || columnWidth}
                >
                  <FieldDoc
                    schema={schema}
                    field={stack.field}
                    level={index + 1}
                    sessionId={this.props.sessionId}
                  />
                </ColumnDoc>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  public showDocFromType = type => {
    this.props.toggleDocs(this.props.sessionId, true)
    this.props.addStack(this.props.sessionId, type, 0, 0)
  }

  private setDocExplorerRef = ref => {
    this.refDocExplorer = ref
  }

  private handleSearch = (value: string) => {
    this.setState({ searchValue: value })
  }

  private handleToggleDocs = () => {
    if (!this.props.docsOpen && this.refDocExplorer) {
      this.refDocExplorer.focus()
    }
    this.props.toggleDocs(this.props.sessionId)
    this.setWidth()
  }

  private handleKeyDown = e => {
    // we don't want to interfere with inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.ctrlKey
    ) {
      return
    }
    e.preventDefault()
    this.props.changeKeyMove(this.props.sessionId, true)
    const lastNavStack =
      this.props.navStack.length > 0 &&
      this.props.navStack[this.props.navStack.length - 1]
    const beforeLastNavStack =
      this.props.navStack.length > 0 &&
      this.props.navStack[this.props.navStack.length - 2]
    const keyPressed = keycode(e)
    switch (keyPressed) {
      case 'esc':
        this.props.toggleDocs(this.props.sessionId, false)
        break
      case 'left':
        if (beforeLastNavStack) {
          this.props.addStack(
            this.props.sessionId,
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
            this.props.addStack(
              this.props.sessionId,
              firstElement,
              lastNavStack.x + 1,
              0,
            )
          }
        } else {
          const obj = serializeRoot(this.props.schema)
          const element = getElementRoot(obj, 0)
          if (element) {
            this.props.addStack(this.props.sessionId, element, 0, 0)
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
              this.props.sessionId,
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
              this.props.sessionId,
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
      const newSize = app.clientWidth - cursorPos
      const maxSize = window.innerWidth - 50
      const docsSize = maxSize < newSize ? maxSize : newSize

      if (docsSize < 100) {
        this.props.toggleDocs(this.props.sessionId, false)
      } else {
        this.props.toggleDocs(this.props.sessionId, true)
        this.props.changeWidthDocs(this.props.sessionId, docsSize)
      }
    }

    let onMouseUp: any = () => {
      if (!this.props.docsOpen) {
        this.props.changeWidthDocs(this.props.sessionId, hadWidth)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private handleMouseMove = e => {
    this.clientX = e.clientX
    this.clientY = e.clientY
    if (
      this.props.keyMove &&
      this.clientX !== e.clientX &&
      this.clientY !== e.clientY
    ) {
      this.props.changeKeyMove(this.props.sessionId, false)
    }
  }
}

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
  getSessionDocs,
  mapDispatchToProps,
  null,
  { withRef: true },
)(GraphDocs)
