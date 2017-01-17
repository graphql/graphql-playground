/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  buildClientSchema,
  GraphQLSchema,
  parse,
  print,
} from 'graphql'

import {ExecuteButton} from 'graphiql/dist/components/ExecuteButton'
import {ToolbarButton} from 'graphiql/dist/components/ToolbarButton'
import {QueryEditor} from 'graphiql/dist/components/QueryEditor'
import {VariableEditor} from 'graphiql/dist/components/VariableEditor'
import {ResultViewer} from 'graphiql/dist/components/ResultViewer'
import {DocExplorer} from './DocExplorer'
import CodeMirrorSizer from 'graphiql/dist/utility/CodeMirrorSizer'
import getQueryFacts from 'graphiql/dist/utility/getQueryFacts'
import getSelectedOperationName from 'graphiql/dist/utility/getSelectedOperationName'
import debounce from 'graphiql/dist/utility/debounce'
import find from 'graphiql/dist/utility/find'
import {fillLeafs} from 'graphiql/dist/utility/fillLeafs'
import {getLeft, getTop} from 'graphiql/dist/utility/elementPosition'
import {
  introspectionQuery,
  introspectionQuerySansSubscriptions,
} from 'graphiql/dist/utility/introspectionQueries'

/**
 * The top-level React component for CustomGraphiQL, intended to encompass the entire
 * browser viewport.
 *
 * @see https://github.com/graphql/graphiql#usage
 */

interface Props {
  fetcher: (params: any) => any
  schema?: GraphQLSchema
  query?: string
  variables?: string
  operationName?: string
  response?: string
  storage?: any
  defaultQuery?: string
  onEditQuery?: (params: any) => Promise<any>
  onEditVariables?: (variables: any) => any
  onEditOperationName?: (name: any) => any
  onToggleDocs?: (value: boolean) => any
  getDefaultFieldNames?: () => any
}

interface State {
  schema: any
  query: any
  variables: any
  operationName: string
  response: any
  editorFlex: number
  variableEditorOpen: boolean
  variableEditorHeight: number
  doxExploreOpen: boolean
  docExplorerWidth: number
  isWaitingForReponse: boolean
  subscription: any
  variableToType: any
  operations: any[]
  docExplorerOpen: boolean
  isWaitingForResponse: boolean
}

interface SimpleProps {
  children?: any
}

interface ToolbarButtonProps extends SimpleProps {
  onClick: (e: any) => void
  title: string
  label: string
}

export class CustomGraphiQL extends React.Component<Props, State> {

  private _storage: any
  private _editorQueryID: number
  private codeMirrorSizer
  private queryEditorComponent
  private variableEditorComponent
  private resultComponent
  private editorBarComponent
  private docExplorerComponent: any // later React.Component<...>

  static Logo: (props: SimpleProps) => JSX.Element
  static Toolbar: (props: SimpleProps) => JSX.Element
  static Footer: (props: SimpleProps) => JSX.Element
  static ToolbarButton: (props: ToolbarButtonProps) => JSX.Element


  constructor(props) {
    super(props)

    // Ensure props are correct
    if (typeof props.fetcher !== 'function') {
      throw new TypeError('CustomGraphiQL requires a fetcher function.')
    }

    // Cache the storage instance
    this._storage = props.storage || window.localStorage

    // Determine the initial query to display.
    const query =
      props.query !== undefined ? props.query :
        this._storageGet('query') !== null ? this._storageGet('query') :
          props.defaultQuery !== undefined ? props.defaultQuery :
            defaultQuery

    // Get the initial query facts.
    const queryFacts = getQueryFacts(props.schema, query)

    // Determine the initial variables to display.
    const variables =
      props.variables !== undefined ? props.variables :
        this._storageGet('variables')

    // Determine the initial operationName to use.
    const operationName =
      props.operationName !== undefined ? props.operationName :
        getSelectedOperationName(
          null,
          this._storageGet('operationName'),
          queryFacts && queryFacts.operations
        )

    // Initialize state
    this.state = {
      schema: props.schema,
      query,
      variables,
      operationName,
      response: props.response,
      editorFlex: Number(this._storageGet('editorFlex')) || 1,
      variableEditorOpen: Boolean(variables),
      variableEditorHeight: Number(this._storageGet('variableEditorHeight')) || 200,
      docExplorerOpen: (this._storageGet('docExplorerOpen') === 'true') || false,
      docExplorerWidth: Number(this._storageGet('docExplorerWidth')) || 350,
      isWaitingForResponse: false,
      subscription: null,
      ...queryFacts
    }

    // Ensure only the last executed editor query is rendered.
    this._editorQueryID = 0

    // Subscribe to the browser window closing, treating it as an unmount.
    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () =>
        this.componentWillUnmount()
      )
    }
  }

  componentDidMount() {
    // Ensure a form of a schema exists (including `null`) and
    // if not, fetch one using an introspection query.
    this._ensureOfSchema()

    // Utility for keeping CodeMirror correctly sized.
    this.codeMirrorSizer = new CodeMirrorSizer()

    global['g'] = this
  }

  componentWillReceiveProps(nextProps) {
    let nextSchema = this.state.schema
    let nextQuery = this.state.query
    let nextVariables = this.state.variables
    let nextOperationName = this.state.operationName
    let nextResponse = this.state.response

    if (nextProps.schema !== undefined) {
      nextSchema = nextProps.schema
    }
    if (nextProps.query !== undefined) {
      nextQuery = nextProps.query
    }
    if (nextProps.variables !== undefined) {
      nextVariables = nextProps.variables
    }
    if (nextProps.operationName !== undefined) {
      nextOperationName = nextProps.operationName
    }
    if (nextProps.response !== undefined) {
      nextResponse = nextProps.response
    }
    if (nextSchema !== this.state.schema ||
      nextQuery !== this.state.query ||
      nextOperationName !== this.state.operationName) {
      this._updateQueryFacts(nextQuery)
    }

    this.setState({
      schema: nextSchema,
      query: nextQuery,
      variables: nextVariables,
      operationName: nextOperationName,
      response: nextResponse,
    } as State)
  }

  componentDidUpdate() {
    // If this update caused DOM nodes to have changed sizes, update the
    // corresponding CodeMirror instance sizes to match.
    this.codeMirrorSizer.updateSizes([
      this.queryEditorComponent,
      this.variableEditorComponent,
      this.resultComponent,
    ])
  }

  // When the component is about to unmount, store any persistable state, such
  // that when the component is remounted, it will use the last used values.
  componentWillUnmount() {
    this._storageSet('query', this.state.query)
    this._storageSet('variables', this.state.variables)
    this._storageSet('operationName', this.state.operationName)
    this._storageSet('editorFlex', this.state.editorFlex)
    this._storageSet('variableEditorHeight', this.state.variableEditorHeight)
    this._storageSet('docExplorerWidth', this.state.docExplorerWidth)
    this._storageSet('docExplorerOpen', this.state.docExplorerOpen)
  }

  render() {
    const children = React.Children.toArray(this.props.children)

    const logo =
      find(children, child => child.type === CustomGraphiQL.Logo) ||
      <CustomGraphiQL.Logo />

    const toolbar =
      find(children, child => child.type === CustomGraphiQL.Toolbar) ||
      <CustomGraphiQL.Toolbar />

    const footer = find(children, child => child.type === CustomGraphiQL.Footer)

    const queryWrapStyle = {
      WebkitFlex: this.state.editorFlex,
      flex: this.state.editorFlex,
    }

    const docWrapStyle = {
      display: this.state.docExplorerOpen ? 'block' : 'none',
      width: this.state.docExplorerWidth,
    }
    const docExplorerWrapClasses = 'docExplorerWrap' +
      (this.state.docExplorerWidth < 200 ? ' doc-explorer-narrow' : '')

    const variableOpen = this.state.variableEditorOpen
    const variableStyle = {
      height: variableOpen ? this.state.variableEditorHeight : null
    }

    return (
      <div className='graphiql-container'>
        <style jsx={true}>{`
          .graphiql-container {
            font-family: Open Sans,sans-serif;
          }
        `}</style>
        <div className='editorWrap'>
          <div className='topBarWrap'>
            <div className='topBar'>
              {logo}
              <ExecuteButton
                isRunning={Boolean(this.state.subscription)}
                onRun={this.handleRunQuery}
                onStop={this.handleStopQuery}
                operations={this.state.operations}
              />
              <CustomGraphiQL.ToolbarButton
                onClick={this.handlePrettifyQuery}
                title='Prettify Query'
                label='Prettify'
              />
              {toolbar}
            </div>
            {
              !this.state.docExplorerOpen &&
              <button
                className='docExplorerShow'
                onClick={this.handleToggleDocs}>
                {'Docs'}
              </button>
            }
          </div>
          <div
            ref={n => { this.editorBarComponent = n }}
            className='editorBar'
            onMouseDown={this.handleResizeStart}>
            <div className='queryWrap' style={queryWrapStyle}>
              <QueryEditor
                ref={n => { this.queryEditorComponent = n }}
                schema={this.state.schema}
                value={this.state.query}
                onEdit={this.handleEditQuery}
                onHintInformationRender={this.handleHintInformationRender}
                onRunQuery={this.handleEditorRunQuery}
              />
              <div className='variable-editor' style={variableStyle}>
                <div
                  className='variable-editor-title'
                  style={{ cursor: variableOpen ? 'row-resize' : 'n-resize' }}
                  onMouseDown={this.handleVariableResizeStart}>
                  {'Query Variables'}
                </div>
                <VariableEditor
                  ref={n => { this.variableEditorComponent = n }}
                  value={this.state.variables}
                  variableToType={this.state.variableToType}
                  onEdit={this.handleEditVariables}
                  onHintInformationRender={this.handleHintInformationRender}
                  onRunQuery={this.handleEditorRunQuery}
                />
              </div>
            </div>
            <div className='resultWrap'>
              {
                this.state.isWaitingForResponse &&
                <div className='spinner-container'>
                  <div className='spinner'/>
                </div>
              }
              <ResultViewer
                ref={c => { this.resultComponent = c }}
                value={this.state.response}
              />
              {footer}
            </div>
          </div>
        </div>
        <div className={docExplorerWrapClasses} style={docWrapStyle}>
          <div
            className='docExplorerResizer'
            onMouseDown={this.handleDocsResizeStart}
          />
          <DocExplorer
            ref={c => { this.docExplorerComponent = c }}
            schema={this.state.schema}>
            <div className='docExplorerHide' onClick={this.handleToggleDocs}>
              {'\u2715'}
            </div>
          </DocExplorer>
        </div>
      </div>
    )
  }

  /**
   * Inspect the query, automatically filling in selection sets for non-leaf
   * fields which do not yet have them.
   *
   * @public
   */
  autoCompleteLeafs() {
    const {insertions, result} = fillLeafs(
      this.state.schema,
      this.state.query,
      this.props.getDefaultFieldNames
    )
    if (insertions && insertions.length > 0) {
      const editor = this.queryEditorComponent.getCodeMirror()
      editor.operation(() => {
        const cursor = editor.getCursor()
        const cursorIndex = editor.indexFromPos(cursor)
        editor.setValue(result)
        let added = 0
        const markers = insertions.map(({index, string}) => editor.markText(
          editor.posFromIndex(index + added),
          editor.posFromIndex(index + (added += string.length)),
          {
            className: 'autoInsertedLeaf',
            clearOnEnter: true,
            title: 'Automatically added leaf fields'
          }
        ))
        setTimeout(() => markers.forEach(marker => marker.clear()), 7000)
        let newCursorIndex = cursorIndex
        insertions.forEach(({index, string}) => {
          if (index < cursorIndex) {
            newCursorIndex += string.length
          }
        })
        editor.setCursor(editor.posFromIndex(newCursorIndex))
      })
    }

    return result
  }

  // Private methods

  _ensureOfSchema() {
    // Only perform introspection if a schema is not provided (undefined)
    if (this.state.schema !== undefined) {
      return
    }

    const fetcher = this.props.fetcher

    const fetch = observableToPromise(fetcher({query: introspectionQuery}))
    if (!isPromise(fetch)) {
      this.setState({
        response: 'Fetcher did not return a Promise for introspection.'
      } as State)
      return
    }

    fetch.then(result => {
      if (result.data) {
        return result
      }

      // Try the stock introspection query first, falling back on the
      // sans-subscriptions query for services which do not yet support it.
      const fetch2 = observableToPromise(fetcher({
        query: introspectionQuerySansSubscriptions
      }))
      if (!isPromise(fetch)) {
        throw new Error('Fetcher did not return a Promise for introspection.')
      }
      return fetch2
    }).then(result => {
      // If a schema was provided while this fetch was underway, then
      // satisfy the race condition by respecting the already
      // provided schema.
      if (this.state.schema !== undefined) {
        return
      }

      if (result && result.data) {
        const schema = buildClientSchema(result.data)
        const queryFacts = getQueryFacts(schema, this.state.query)
        this.setState({schema, ...queryFacts})
      } else {
        const responseString = typeof result === 'string' ?
          result :
          JSON.stringify(result, null, 2)
        this.setState({
          // Set schema to `null` to explicitly indicate that no schema exists.
          schema: null,
          response: responseString
        } as State)
      }
    }).catch(error => {
      this.setState({
        schema: null,
        response: error && String(error.stack || error)
      } as State)
    })
  }

  _storageGet(name) {
    if (this._storage) {
      const value = this._storage.getItem('graphiql:' + name)
      // Clean up any inadvertently saved null/undefined values.
      if (value === 'null' || value === 'undefined') {
        this._storage.removeItem('graphiql:' + name)
      } else {
        return value
      }
    }
  }

  _storageSet(name, value) {
    if (this._storage) {
      if (value) {
        this._storage.setItem('graphiql:' + name, value)
      } else {
        this._storage.removeItem('graphiql:' + name)
      }
    }
  }

  _fetchQuery(query, variables, operationName, cb) {
    const fetcher = this.props.fetcher
    let jsonVariables = null

    try {
      jsonVariables =
        variables && variables.trim() !== '' ? JSON.parse(variables) : null
    } catch (error) {
      throw new Error(`Variables are invalid JSON: ${error.message}.`)
    }

    if (typeof jsonVariables !== 'object') {
      throw new Error('Variables are not a JSON object.')
    }

    const fetch = fetcher({
      query,
      variables: jsonVariables,
      operationName
    })

    if (isPromise(fetch)) {
      // If fetcher returned a Promise, then call the callback when the promise
      // resolves, otherwise handle the error.
      fetch.then(cb).catch(error => {
        this.setState({
          isWaitingForResponse: false,
          response: error && String(error.stack || error)
        } as State)
      })
    } else if (isObservable(fetch)) {
      // If the fetcher returned an Observable, then subscribe to it, calling
      // the callback on each next value, and handling both errors and the
      // completion of the Observable. Returns a Subscription object.
      const subscription = fetch.subscribe({
        next: cb,
        error: error => {
          this.setState({
            isWaitingForResponse: false,
            response: error && String(error.stack || error),
            subscription: null
          } as State)
        },
        complete: () => {
          this.setState({
            isWaitingForResponse: false,
            subscription: null
          } as State)
        }
      })

      return subscription
    } else {
      throw new Error('Fetcher did not return Promise or Observable.')
    }
  }

  handleRunQuery = selectedOperationName => {
    this._editorQueryID++
    const queryID = this._editorQueryID

    // Use the edited query after autoCompleteLeafs() runs or,
    // in case autoCompletion fails (the function returns undefined),
    // the current query from the editor.
    const editedQuery = this.autoCompleteLeafs() || this.state.query
    const variables = this.state.variables
    let operationName = this.state.operationName

    // If an operation was explicitly provided, different from the current
    // operation name, then report that it changed.
    if (selectedOperationName && selectedOperationName !== operationName) {
      operationName = selectedOperationName
      const onEditOperationName = this.props.onEditOperationName
      if (onEditOperationName) {
        onEditOperationName(operationName)
      }
    }

    try {
      this.setState({
        isWaitingForResponse: true,
        response: null,
        operationName,
      } as State)

      // _fetchQuery may return a subscription.
      const subscription = this._fetchQuery(
        editedQuery,
        variables,
        operationName,
        result => {
          if (queryID === this._editorQueryID) {
            this.setState({
              isWaitingForResponse: false,
              response: JSON.stringify(result, null, 2),
            } as State)
          }
        }
      )

      this.setState({subscription} as State)
    } catch (error) {
      this.setState({
        isWaitingForResponse: false,
        response: error.message
      } as State)
    }
  }

  handleStopQuery = () => {
    const subscription = this.state.subscription
    this.setState({
      isWaitingForResponse: false,
      subscription: null
    } as State)
    if (subscription) {
      subscription.unsubscribe()
    }
  }

  _runQueryAtCursor() {
    if (this.state.subscription) {
      this.handleStopQuery()
      return
    }

    let operationName
    const operations = this.state.operations
    if (operations) {
      const editor = this.queryEditorComponent.getCodeMirror()
      if (editor.hasFocus()) {
        const cursor = editor.getCursor()
        const cursorIndex = editor.indexFromPos(cursor)

        // Loop through all operations to see if one contains the cursor.
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i]
          if (operation.loc.start <= cursorIndex &&
            operation.loc.end >= cursorIndex) {
            operationName = operation.name && operation.name.value
            break
          }
        }
      }
    }

    this.handleRunQuery(operationName)
  }

  handlePrettifyQuery = () => {
    const query = print(parse(this.state.query))
    const editor = this.queryEditorComponent.getCodeMirror()
    editor.setValue(query)
  }

  handleEditQuery = value => {
    if (this.state.schema) {
      this._updateQueryFacts(value)
    }
    this.setState({query: value} as State)
    if (this.props.onEditQuery) {
      return this.props.onEditQuery(value)
    }
    return null
  }

  _updateQueryFacts = debounce(150, query => {
    const queryFacts = getQueryFacts(this.state.schema, query)
    if (queryFacts) {
      // Update operation name should any query names change.
      const operationName = getSelectedOperationName(
        this.state.operations,
        this.state.operationName,
        queryFacts.operations
      )

      // Report changing of operationName if it changed.
      const onEditOperationName = this.props.onEditOperationName
      if (onEditOperationName && operationName !== this.state.operationName) {
        onEditOperationName(operationName)
      }

      this.setState({
        operationName,
        ...queryFacts
      })
    }
  })

  handleEditVariables = value => {
    this.setState({variables: value} as State)
    if (this.props.onEditVariables) {
      this.props.onEditVariables(value)
    }
  }

  handleHintInformationRender = elem => {
    elem.addEventListener('click', this._onClickHintInformation)

    let onRemoveFn
    elem.addEventListener('DOMNodeRemoved', onRemoveFn = () => {
      elem.removeEventListener('DOMNodeRemoved', onRemoveFn)
      elem.removeEventListener('click', this._onClickHintInformation)
    })
  }

  handleEditorRunQuery = () => {
    this._runQueryAtCursor()
  }

  _onClickHintInformation = event => {
    if (event.target.className === 'typeName') {
      const typeName = event.target.innerHTML
      const schema = this.state.schema
      if (schema) {
        const type = schema.getType(typeName)
        if (type) {
          this.setState({docExplorerOpen: true} as State, () => {
            this.docExplorerComponent.showDoc(type)
          })
        }
      }
    }
  }

  handleToggleDocs = () => {
    if (typeof this.props.onToggleDocs === 'function') {
      this.props.onToggleDocs(!this.state.docExplorerOpen)
    }
    this.setState({docExplorerOpen: !this.state.docExplorerOpen} as State)
  }

  handleResizeStart = downEvent => {
    if (!this._didClickDragBar(downEvent)) {
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
      this.setState({editorFlex: leftSize / rightSize} as State)
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

  _didClickDragBar(event) {
    // Only for primary unmodified clicks
    if (event.button !== 0 || event.ctrlKey) {
      return false
    }
    let target = event.target
    // We use codemirror's gutter as the drag bar.
    if (target.className.indexOf('CodeMirror-gutter') !== 0) {
      return false
    }
    // Specifically the result window's drag bar.
    const resultWindow = ReactDOM.findDOMNode(this.resultComponent)
    while (target) {
      if (target === resultWindow) {
        return true
      }
      target = target.parentNode
    }
    return false
  }

  handleDocsResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.state.docExplorerWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = ReactDOM.findDOMNode(this)
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const docsSize = app.clientWidth - cursorPos

      if (docsSize < 100) {
        this.setState({docExplorerOpen: false} as State)
      } else {
        this.setState({
          docExplorerOpen: true,
          docExplorerWidth: Math.min(docsSize, 650)
        } as State)
      }
    }

    let onMouseUp: any = () => {
      if (!this.state.docExplorerOpen) {
        this.setState({docExplorerWidth: hadWidth} as State)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  handleVariableResizeStart = downEvent => {
    downEvent.preventDefault()

    let didMove = false
    const wasOpen = this.state.variableEditorOpen
    const hadHeight = this.state.variableEditorHeight
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
        this.setState({
          variableEditorOpen: false,
          variableEditorHeight: hadHeight
        } as State)
      } else {
        this.setState({
          variableEditorOpen: true,
          variableEditorHeight: bottomSize
        } as State)
      }
    }

    let onMouseUp: any = () => {
      if (!didMove) {
        this.setState({variableEditorOpen: !wasOpen} as State)
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

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Logo = function GraphiQLLogo(props) {
  return (
    <div className='title'>
      {props.children || <span>{'Graph'}<em>{'i'}</em>{'QL'}</span>}
    </div>
  )
}

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Toolbar = function GraphiQLToolbar(props) {
  return (
    <div className='toolbar'>
      {props.children}
    </div>
  )
}

// Add a button to the Toolbar.
CustomGraphiQL.ToolbarButton = ToolbarButton

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Footer = function GraphiQLFooter(props) {
  return (
    <div className='footer'>
      {props.children}
    </div>
  )
}

const defaultQuery =
  `# Welcome to CustomGraphiQL
#
# CustomGraphiQL is an in-browser IDE for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will
# see intelligent typeaheads aware of the current GraphQL type schema and
# live syntax and validation errors highlighted within the text.
#
# To bring up the auto-complete at any point, just press Ctrl-Space.
#
# Press the run button above, or Cmd-Enter to execute the query, and the result
# will appear in the pane to the right.

`

// Duck-type promise detection.
function isPromise(value) {
  return typeof value === 'object' && typeof value.then === 'function'
}

// Duck-type Observable.take(1).toPromise()
function observableToPromise(observable) {
  if (!isObservable(observable)) {
    return observable
  }
  return new Promise((resolve, reject) => {
    const subscription = observable.subscribe(
      v => {
        resolve(v)
        subscription.unsubscribe()
      },
      reject,
      () => {
        reject(new Error('no value resolved'))
      }
    )
  })
}

// Duck-type observable detection.
function isObservable(value) {
  return typeof value === 'object' && typeof value.subscribe === 'function'
}
