import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as keycode from 'keycode'
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
import {
  serialize,
  getElementRoot,
  serializeRoot,
  getElement,
} from '../util/stack'
import { getSessionDocs } from '../../../state/docs/selectors'
import { getSelectedSessionIdFromRoot } from '../../../state/sessions/selectors'
import { createStructuredSelector } from 'reselect'
import { SideTabContentProps } from '../ExplorerTabs/SideTabs'
import { ErrorContainer } from './ErrorContainer'
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

export interface State {
  searchValue: string
  widthMap: any
}

class GraphDocs extends React.Component<
  SideTabContentProps & StateFromProps & DispatchFromProps,
  State
> {
  ref
  // private refDocExplorer: any;

  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      widthMap: {},
    }
    ;(window as any).d = this
  }

  componentWillReceiveProps(nextProps: SideTabContentProps & StateFromProps) {
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
    this.props.setWidth(props)
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
    const { navStack } = this.props.docs
    const { schema } = this.props
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
      <DocsExplorerContainer
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        ref={this.setRef}
      >
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
    )
  }

  setRef = ref => {
    this.ref = ref
  }

  public showDocFromType = type => {
    this.props.addStack(this.props.sessionId, type, 0, 0)
  }

  private handleSearch = (value: string) => {
    this.setState({ searchValue: value })
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

export default connect<StateFromProps, DispatchFromProps, SideTabContentProps>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(GraphDocs)

const DocsExplorerContainer = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  outline: none !important;
`
