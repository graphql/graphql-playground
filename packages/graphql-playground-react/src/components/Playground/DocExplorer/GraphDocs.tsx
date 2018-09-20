import * as React from 'react'
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
  setDocsVisible,
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
import { getSelectedSessionIdFromRoot } from '../../../state/sessions/selectors'
import { createStructuredSelector } from 'reselect'
import { styled } from '../../../styled'

interface StateFromProps {
  docs: {
    navStack: any[]
    docsOpen: boolean
    docsWidth: number
    keyMove: boolean
  }
}

interface DispatchFromProps {
  addStack: (sessionId: string, field: any, x: number, y: number) => any
  toggleDocs: (sessionId: string) => any
  setDocsVisible: (sessionId: string, open: boolean) => any
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
  ref
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
      this.props.docs.navStack.length !== nextProps.docs.navStack.length ||
      this.props.docs.navStack.slice(-1)[0] !==
        nextProps.docs.navStack.slice(-1)[0] ||
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
    const stackWidths = props.docs.navStack.map(
      stack => this.state.widthMap[stack.field.path] || columnWidth,
    )

    return [rootWidth].concat(stackWidths).reduce((acc, curr) => acc + curr, 0)
  }

  componentDidMount() {
    this.setWidth()
  }

  render() {
    const { docsOpen, docsWidth, navStack } = this.props.docs
    const { schema } = this.props
    const docsStyle = { width: docsOpen ? docsWidth : 0 }

    let emptySchema
    if (schema === undefined) {
      // Schema is undefined when it is being loaded via introspection.
      emptySchema = <Spinner />
    } else if (schema === null) {
      // Schema is null when it explicitly does not exist, typically due to
      // an error during introspection.
      emptySchema = <ErrorContainer>{'No Schema Available'}</ErrorContainer>
    }

    return (
      <Docs
        className={cn('graph-docs docExplorerWrap docs', { open: docsOpen })}
        style={docsStyle}
        innerRef={this.setRef}
      >
        <style jsx={true} global={true}>{`
          .graph-docs .doc-category-title {
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
        `}</style>
        <DocsButton onClick={this.handleToggleDocs}>Schema</DocsButton>
        <DocsResizer onMouseDown={this.handleDocsResizeStart} />
        <DocsGradient />
        <DocsExplorer
          onKeyDown={this.handleKeyDown}
          onMouseMove={this.handleMouseMove}
          tabIndex={0}
          innerRef={this.setDocExplorerRef}
        >
          <DocsExplorerContainer>
            {emptySchema && <ColumnDoc>{emptySchema}</ColumnDoc>}
            {!emptySchema &&
              schema && (
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
          </DocsExplorerContainer>
        </DocsExplorer>
      </Docs>
    )
  }

  setRef = ref => {
    this.ref = ref
  }

  public showDocFromType = type => {
    this.props.setDocsVisible(this.props.sessionId, true)
    this.props.addStack(this.props.sessionId, type, 0, 0)
  }

  private setDocExplorerRef = ref => {
    this.refDocExplorer = ref
  }

  private handleSearch = (value: string) => {
    this.setState({ searchValue: value })
  }

  private handleToggleDocs = () => {
    if (!this.props.docs.docsOpen && this.refDocExplorer) {
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
      this.props.docs.navStack.length > 0 &&
      this.props.docs.navStack[this.props.docs.navStack.length - 1]
    const beforeLastNavStack =
      this.props.docs.navStack.length > 0 &&
      this.props.docs.navStack[this.props.docs.navStack.length - 2]
    const keyPressed = keycode(e)
    switch (keyPressed) {
      case 'esc':
        this.props.setDocsVisible(this.props.sessionId, false)
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
          const y = lastNavStack ? lastNavStack.y : 0
          const element = getElementRoot(
            obj,
            keyPressed === 'up' ? y - 1 : y + 1,
          )
          if (element) {
            this.props.addStack(
              this.props.sessionId,
              element,
              0,
              keyPressed === 'up' ? y - 1 : y + 1,
            )
          }
        }
        break
    }
  }

  private handleDocsResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.props.docs.docsWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = this.ref
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const newSize = app.clientWidth - cursorPos
      const maxSize = window.innerWidth - 50
      const docsSize = maxSize < newSize ? maxSize : newSize

      if (docsSize < 100) {
        this.props.setDocsVisible(this.props.sessionId, false)
      } else {
        this.props.setDocsVisible(this.props.sessionId, true)
        this.props.changeWidthDocs(this.props.sessionId, docsSize)
      }
    }

    let onMouseUp: any = () => {
      if (!this.props.docs.docsOpen) {
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
      this.props.docs.keyMove &&
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
      setDocsVisible,
    },
    dispatch,
  )

const mapStateToProps = createStructuredSelector({
  docs: getSessionDocs,
  sessionId: getSelectedSessionIdFromRoot,
})

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(GraphDocs)

const Docs = styled.div`
  background: white;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  position: absolute;
  right: -2px;
  z-index: 3;
  height: 100%;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  &.open {
    z-index: 2000;
  }

  .field-name {
    color: #1f61a0;
  }
  .type-name {
    color: rgb(245, 160, 0);
  }
  .arg-name {
    color: #1f61a9;
  }

  code {
    font-family: 'Source Code Pro', monospace;
    border-radius: 2px;
    padding: 1px 2px;
    background: rgba(0, 0, 0, 0.06);
  }
`

const DocsExplorer = styled.div`
  background: white;
  display: flex;
  position: relative;
  height: 100%;
  letter-spacing: 0.3px;
  outline: none;
  box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);

  &::before {
    top: 0;
    bottom: 0;
    background: ${props => props.theme.colours.green};
    position: absolute;
    z-index: 3;
    left: 0px;
    content: '';
    width: 6px;
  }
`

const DocsExplorerContainer = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
`

const DocsResizer = styled.div`
  cursor: col-resize;
  height: 100%;
  left: -5px;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  z-index: 10;
`

const ErrorContainer = styled.div`
  font-weight: bold;
  left: 0;
  letter-spacing: 1px;
  opacity: 0.5;
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: 50%;
  transform: translate(0, -50%);
`

const DocsButton = styled.div`
  position: absolute;
  z-index: 2;
  left: -50px;
  top: 129px;
  padding: 6px 10px;
  transform: rotate(-90deg);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${p => p.theme.colours.white};
  background: ${p => p.theme.colours.green};
  box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  line-height: 17px;
  letter-spacing: 0.45px;
  cursor: pointer;
`

const DocsGradient = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 20px;
  z-index: 1;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 1) 30%,
    rgba(255, 255, 255, 0)
  );
`
