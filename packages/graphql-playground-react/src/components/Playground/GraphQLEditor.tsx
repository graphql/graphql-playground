import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { isNamedType, GraphQLSchema } from 'graphql'
import * as cn from 'classnames'
import ExecuteButton from './ExecuteButton'
import QueryEditor from './QueryEditor'
import CodeMirrorSizer from 'graphiql/dist/utility/CodeMirrorSizer'
import { fillLeafs } from 'graphiql/dist/utility/fillLeafs'
import { getLeft, getTop } from 'graphiql/dist/utility/elementPosition'
import { connect } from 'react-redux'

import Spinner from '../Spinner'
import Results from './Results'
import ReponseTracing from './ResponseTracing'
import withTheme from '../Theme/withTheme'
import { LocalThemeInterface } from '../Theme'
import GraphDocs from './DocExplorer/GraphDocs'
import { styled } from '../../styled/index'
import TopBar from './TopBar/TopBar'
import {
  VariableEditorComponent,
  HeadersEditorComponent,
} from './VariableEditor'
import { createStructuredSelector } from 'reselect'
import {
  getQueryRunning,
  getResponses,
  getSubscriptionActive,
  getVariableEditorOpen,
  getVariableEditorHeight,
  getResponseTracingOpen,
  getResponseTracingHeight,
  getResponseExtensions,
  getCurrentQueryStartTime,
  getCurrentQueryEndTime,
  getTracingSupported,
  getEditorFlex,
  getQueryVariablesActive,
  getHeaders,
  getOperations,
  getOperationName,
  getHeadersCount,
  getSelectedSessionIdFromRoot,
} from '../../state/sessions/selectors'
import {
  updateQueryFacts,
  stopQuery,
  runQueryAtPosition,
  closeQueryVariables,
  openQueryVariables,
  openVariables,
  closeVariables,
  openTracing,
  closeTracing,
  toggleTracing,
  setEditorFlex,
  toggleVariables,
  fetchSchema,
} from '../../state/sessions/actions'
import { List } from 'immutable'
import { ResponseRecord } from '../../state/sessions/reducers'

/**
 * The top-level React component for GraphQLEditor, intended to encompass the entire
 * browser viewport.
 */

export interface Props {
  onRef?: any
  shareEnabled?: boolean
  schema?: GraphQLSchema
}

export interface ReduxProps {
  setStacks: (sessionId: string, stack: any[]) => void
  updateQueryFacts: () => void
  runQueryAtPosition: (position: number) => void
  fetchSchema: () => void
  openQueryVariables: () => void
  closeQueryVariables: () => void
  openVariables: (height: number) => void
  closeVariables: (height: number) => void
  openTracing: (height: number) => void
  closeTracing: (height: number) => void
  toggleTracing: () => void
  toggleVariables: () => void
  setEditorFlex: (flex: number) => void
  stopQuery: (sessionId: string) => void
  navStack: any[]
  // sesion props
  queryRunning: boolean
  responses: List<ResponseRecord>
  subscriptionActive: boolean
  variableEditorOpen: boolean
  variableEditorHeight: number
  currentQueryStartTime?: Date
  currentQueryEndTime?: Date
  responseTracingOpen: boolean
  responseTracingHeight: number
  responseExtensions: any
  tracingSupported?: boolean
  editorFlex: number
  headers: string
  headersCount: number
  queryVariablesActive: boolean
  operationName: string
  query: string
  sessionId: string
}

export interface SimpleProps {
  children?: any
}

export interface ToolbarButtonProps extends SimpleProps {
  onClick: (e: any) => void
  title: string
  label: string
}

class GraphQLEditor extends React.PureComponent<
  Props & LocalThemeInterface & ReduxProps
> {
  public codeMirrorSizer
  public queryEditorComponent
  public variableEditorComponent
  public resultComponent
  public editorBarComponent
  public docExplorerComponent: any // later React.Component<...>

  private queryResizer: any
  private responseResizer: any
  private queryVariablesRef
  private httpHeadersRef

  componentDidMount() {
    // Ensure a form of a schema exists (including `null`) and
    // if not, fetch one using an introspection query.
    this.props.fetchSchema()

    // Utility for keeping CodeMirror correctly sized.
    this.codeMirrorSizer = new CodeMirrorSizer()
    ;(global as any).g = this
  }

  componentDidUpdate() {
    // If this update caused DOM nodes to have changed sizes, update the
    // corresponding CodeMirror instance sizes to match.
    // const components = [
    // this.queryEditorComponent,
    // this.variableEditorComponent,
    // this.resultComponent,
    // ]
    // this.codeMirrorSizer.updateSizes(components)
    if (this.resultComponent && Boolean(this.props.subscriptionActive)) {
      this.resultComponent.scrollTop = this.resultComponent.scrollHeight
    }
  }

  render() {
    return (
      <div className={cn('graphiql-container')}>
        <style jsx={true}>{`
          .graphiql-container {
            font-family: Open Sans, sans-serif;
          }

          .docs-button,
          .schema-button {
            @p: .absolute, .white, .bgGreen, .pa6, .br2, .z2, .ttu, .fw6, .f14,
              .ph10, .pointer;
            padding-bottom: 8px;
            transform: rotate(-90deg);
            left: -44px;
            top: 195px;
          }

          div.schema-button {
            @p: .bgLightOrange;
            left: -53px;
            top: 120px;
          }

          .queryWrap {
            @p: .relative;
            border-top: 8px solid $darkBlue;
          }
          .queryWrap.light {
            border-top: 8px solid #eeeff0;
          }

          .graphiql-button {
            @p: .white50, .bgDarkBlue, .ttu, .f14, .fw6, .br2, .pointer;
            padding: 5px 9px 6px 9px;
            letter-spacing: 0.53px;
          }
          .graphiql-button.prettify {
            @p: .absolute;
            top: -57px;
            right: 38px;
            z-index: 2;
          }
          .intro {
            @p: .absolute, .tlCenter, .top50, .left50, .white20, .f16, .tc;
            font-family: 'Source Code Pro', 'Consolas', 'Inconsolata',
              'Droid Sans Mono', 'Monaco', monospace;
            letter-spacing: 0.6px;
            width: 235px;
          }

          .listening {
            @p: .f16, .white40, .absolute, .bottom0, .bgDarkBlue;
            font-family: 'Source Code Pro', 'Consolas', 'Inconsolata',
              'Droid Sans Mono', 'Monaco', monospace;
            letter-spacing: 0.6px;
            padding-left: 24px;
            padding-bottom: 60px;
          }

          .onboarding-hint {
            @p: .absolute, .br2, .z999;
          }
          .onboarding-hint.step1 {
            top: 207px;
            left: 90px;
          }
          .onboarding-hint.step2 {
            top: 207px;
            left: 90px;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .query-header-enter {
            opacity: 0.01;
          }

          .query-header-enter.query-header-enter-active {
            opacity: 1;
            transition: opacity 500ms ease-in;
          }

          .query-header-leave {
            opacity: 1;
          }

          .query-header-leave.query-header-leave-active {
            opacity: 0.01;
            transition: opacity 300ms ease-in;
          }
        `}</style>
        <div className="editorWrap">
          <TopBar shareEnabled={this.props.shareEnabled} />
          <div
            ref={this.setEditorBarComponent}
            className="editorBar"
            onMouseDown={this.handleResizeStart}
          >
            <div
              className={cn('queryWrap', this.props.localTheme)}
              style={{
                WebkitFlex: this.props.editorFlex,
                flex: this.props.editorFlex,
              }}
            >
              <QueryEditor
                getRef={this.setQueryEditorComponent}
                schema={this.props.schema}
                onHintInformationRender={this.handleHintInformationRender}
                onRunQuery={this.runQueryAtCursor}
                onClickReference={this.handleClickReference}
              />
              <div
                className="variable-editor"
                style={{
                  height: this.props.variableEditorOpen
                    ? this.props.variableEditorHeight
                    : null,
                }}
              >
                <div
                  className="variable-editor-title"
                  style={{
                    cursor: this.props.variableEditorOpen
                      ? 'row-resize'
                      : 'n-resize',
                  }}
                  onMouseDown={this.handleVariableResizeStart}
                >
                  <span
                    className={cn('subtitle', {
                      active: this.props.queryVariablesActive,
                    })}
                    ref={this.setQueryVariablesRef}
                    onClick={this.props.openQueryVariables}
                  >
                    {'Query Variables'}
                  </span>
                  <span
                    className={cn('subtitle', {
                      active: !this.props.queryVariablesActive,
                    })}
                    ref={this.setHttpHeadersRef}
                    onClick={this.props.closeQueryVariables}
                  >
                    {'HTTP Headers ' +
                      (this.props.headersCount && this.props.headersCount > 0
                        ? `(${this.props.headersCount})`
                        : '')}
                  </span>
                </div>
                {this.props.queryVariablesActive ? (
                  <VariableEditorComponent
                    getRef={this.setVariableEditorComponent}
                    onHintInformationRender={
                      this.props.queryVariablesActive
                        ? this.handleHintInformationRender
                        : undefined
                    }
                    onRunQuery={this.runQueryAtCursor}
                  />
                ) : (
                  <HeadersEditorComponent
                    getRef={this.setVariableEditorComponent}
                    onHintInformationRender={
                      this.props.queryVariablesActive
                        ? this.handleHintInformationRender
                        : undefined
                    }
                    onRunQuery={this.runQueryAtCursor}
                  />
                )}
              </div>
              <QueryDragBar ref={this.setQueryResizer} />
            </div>
            <div className="resultWrap">
              <ResultDragBar ref={this.setResponseResizer} />
              <ExecuteButton />
              {this.props.queryRunning &&
                this.props.responses.size === 0 && <Spinner />}
              <Results setRef={this.setResultComponent} />
              {!this.props.queryRunning &&
                (!this.props.responses || this.props.responses.size === 0) && (
                  <div className="intro">
                    Hit the Play Button to get a response here
                  </div>
                )}
              {this.props.subscriptionActive && (
                <div className="listening">Listening &hellip;</div>
              )}
              <div
                className="response-tracing"
                style={{
                  height: this.props.responseTracingOpen
                    ? this.props.responseTracingHeight
                    : null,
                }}
              >
                <div
                  className="response-tracing-title"
                  style={{
                    cursor: this.props.responseTracingOpen
                      ? 'row-resize'
                      : 'n-resize',
                  }}
                  onMouseDown={this.handleTracingResizeStart}
                >
                  Tracing
                </div>
                <ReponseTracing open={this.props.responseTracingOpen} />
              </div>
            </div>
          </div>
        </div>
        <GraphDocs ref={this.setDocExplorerRef} schema={this.props.schema} />
      </div>
    )
  }

  setQueryVariablesRef = ref => {
    this.queryVariablesRef = ref
  }

  setHttpHeadersRef = ref => {
    this.httpHeadersRef = ref
  }

  setQueryResizer = ref => {
    this.queryResizer = ReactDOM.findDOMNode(ref)
  }

  setResponseResizer = ref => {
    this.responseResizer = ReactDOM.findDOMNode(ref)
  }

  setEditorBarComponent = ref => {
    this.editorBarComponent = ref
  }

  setQueryEditorComponent = ref => {
    this.queryEditorComponent = ref
  }

  setVariableEditorComponent = ref => {
    this.variableEditorComponent = ref
  }

  setResultComponent = ref => {
    this.resultComponent = ref
  }

  setDocExplorerRef = ref => {
    if (ref) {
      this.docExplorerComponent = ref.getWrappedInstance()
    }
  }

  handleClickReference = reference => {
    this.docExplorerComponent.showDocFromType(reference.field)
  }

  /**
   * Inspect the query, automatically filling in selection sets for non-leaf
   * fields which do not yet have them.
   *
   * @public
   */
  autoCompleteLeafs() {
    const { insertions, result } = fillLeafs(
      this.props.schema,
      this.props.query,
    ) as {
      insertions: Array<{ index: number; string: string }>
      result: string
    }
    if (insertions && insertions.length > 0) {
      const editor = this.queryEditorComponent.getCodeMirror()
      editor.operation(() => {
        const cursor = editor.getCursor()
        const cursorIndex = editor.indexFromPos(cursor)
        editor.setValue(result)
        let added = 0
        try {
          /* tslint:disable-next-line */
          const markers = insertions.map(({ index, string }) =>
            editor.markText(
              editor.posFromIndex(index + added),
              editor.posFromIndex(index + (added += string.length)),
              {
                className: 'autoInsertedLeaf',
                clearOnEnter: true,
                title: 'Automatically added leaf fields',
              },
            ),
          )
          setTimeout(() => markers.forEach(marker => marker.clear()), 7000)
        } catch (e) {
          //
        }
        let newCursorIndex = cursorIndex
        /* tslint:disable-next-line */
        insertions.forEach(({ index, string }) => {
          if (index < cursorIndex && string) {
            newCursorIndex += string.length
          }
        })
        editor.setCursor(editor.posFromIndex(newCursorIndex))
      })
    }

    return result
  }

  private runQueryAtCursor = () => {
    if (this.props.queryRunning) {
      this.props.stopQuery(this.props.sessionId)
      return
    }

    const editor = this.queryEditorComponent.getCodeMirror()
    if (editor.hasFocus()) {
      const cursor = editor.getCursor()
      const cursorIndex = editor.indexFromPos(cursor)
      this.props.runQueryAtPosition(cursorIndex)
    }
  }

  private handleHintInformationRender = elem => {
    elem.addEventListener('click', this.onClickHintInformation)

    let onRemoveFn
    elem.addEventListener(
      'DOMNodeRemoved',
      (onRemoveFn = () => {
        elem.removeEventListener('DOMNodeRemoved', onRemoveFn)
        elem.removeEventListener('click', this.onClickHintInformation)
      }),
    )
  }

  private handleResizeStart = downEvent => {
    if (!this.didClickDragBar(downEvent)) {
      return
    }

    downEvent.preventDefault()

    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const editorBar = ReactDOM.findDOMNode(this.editorBarComponent)
      const leftSize = moveEvent.clientX - getLeft(editorBar) - offset
      const rightSize = editorBar.clientWidth - leftSize
      this.props.setEditorFlex(leftSize / rightSize)
    }

    let onMouseUp: any = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private didClickDragBar(event) {
    // Only for primary unmodified clicks
    return (
      event.target === this.queryResizer ||
      event.target === this.responseResizer
    )
  }

  private handleTracingResizeStart = downEvent => {
    downEvent.preventDefault()

    let didMove = false
    const hadHeight = this.props.responseTracingHeight
    const offset = downEvent.clientY - getTop(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      didMove = true

      const editorBar = ReactDOM.findDOMNode(this.editorBarComponent)
      const topSize = moveEvent.clientY - getTop(editorBar) - offset
      const bottomSize = editorBar.clientHeight - topSize
      if (bottomSize < 60) {
        this.props.closeTracing(hadHeight)
      } else {
        this.props.openTracing(hadHeight)
      }
    }

    let onMouseUp: any = () => {
      if (!didMove) {
        this.props.toggleTracing()
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private handleVariableResizeStart = downEvent => {
    downEvent.preventDefault()

    let didMove = false
    const wasOpen = this.props.variableEditorOpen
    const hadHeight = this.props.variableEditorHeight
    const offset = downEvent.clientY - getTop(downEvent.target)

    if (
      wasOpen &&
      (downEvent.target === this.queryVariablesRef ||
        downEvent.target === this.httpHeadersRef)
    ) {
      return
    }

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      didMove = true

      const editorBar = ReactDOM.findDOMNode(this.editorBarComponent)
      const topSize = moveEvent.clientY - getTop(editorBar) - offset
      const bottomSize = editorBar.clientHeight - topSize
      if (bottomSize < 60) {
        this.props.closeVariables(hadHeight)
      } else {
        this.props.openVariables(bottomSize)
      }
    }

    let onMouseUp: any = () => {
      if (!didMove) {
        this.props.toggleVariables()
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private onClickHintInformation = event => {
    if (event.target.className === 'typeName') {
      const typeName = event.target.innerHTML
      const schema = this.props.schema
      if (schema) {
        // TODO: There is no way as of now to retrieve the NAMED_TYPE of a GraphQLList(Type).
        // We're therefore removing any '[' or '!' characters, to properly find its NAMED_TYPE. (eg. [Type!]! => Type)
        // This should be removed as soon as there's a safer way to do that.
        const namedTypeName = typeName.replace(/[\]\[!]/g, '')
        const type = schema.getType(namedTypeName)

        if (isNamedType(type)) {
          this.docExplorerComponent.showDocFromType(type)
        }
      }
    }
  }
}

const mapStateToProps = createStructuredSelector({
  queryRunning: getQueryRunning,
  responses: getResponses,
  subscriptionActive: getSubscriptionActive,
  variableEditorOpen: getVariableEditorOpen,
  variableEditorHeight: getVariableEditorHeight,
  responseTracingOpen: getResponseTracingOpen,
  responseTracingHeight: getResponseTracingHeight,
  responseExtensions: getResponseExtensions,
  currentQueryStartTime: getCurrentQueryStartTime,
  currentQueryEndTime: getCurrentQueryEndTime,
  tracingSupported: getTracingSupported,
  editorFlex: getEditorFlex,
  queryVariablesActive: getQueryVariablesActive,
  headers: getHeaders,
  operations: getOperations,
  operationName: getOperationName,
  headersCount: getHeadersCount,
  sessionId: getSelectedSessionIdFromRoot,
})

export default withTheme<Props>(
  // TODO fix redux types
  connect<any, any, any>(
    mapStateToProps,
    {
      updateQueryFacts,
      stopQuery,
      runQueryAtPosition,
      openQueryVariables,
      closeQueryVariables,
      openVariables,
      closeVariables,
      openTracing,
      closeTracing,
      toggleTracing,
      setEditorFlex,
      toggleVariables,
      fetchSchema,
    },
    null,
    {
      withRef: true,
    },
  )(GraphQLEditor),
)

const DragBar = styled.div`
  width: 15px;
  position: absolute;
  top: 0;
  bottom: 0;
  cursor: col-resize;
`

const QueryDragBar = styled(DragBar)`
  right: 0px;
`

const ResultDragBar = styled(DragBar)`
  left: 0px;
  z-index: 1;
`
