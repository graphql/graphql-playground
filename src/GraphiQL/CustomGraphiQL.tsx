/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { buildClientSchema, parse, print } from 'graphql'
import * as cn from 'classnames'

import { GraphQLSchema } from 'graphql/type/schema'

import { ExecuteButton } from './ExecuteButton'
import { ToolbarButton } from 'graphiql/dist/components/ToolbarButton'
import { QueryEditor } from './QueryEditor'
import { VariableEditor } from 'graphiql/dist/components/VariableEditor'
import CodeMirrorSizer from 'graphiql/dist/utility/CodeMirrorSizer'
import getQueryFacts from 'graphiql/dist/utility/getQueryFacts'
import getSelectedOperationName from 'graphiql/dist/utility/getSelectedOperationName'
import debounce from 'graphiql/dist/utility/debounce'
import find from 'graphiql/dist/utility/find'
import { fillLeafs } from 'graphiql/dist/utility/fillLeafs'
import { getLeft, getTop } from 'graphiql/dist/utility/elementPosition'
import {
  introspectionQuery,
  introspectionQuerySansSubscriptions,
} from 'graphiql/dist/utility/introspectionQueries'
import { Viewer, OperationDefinition } from '../types'
import { download } from './util/index'
import QueryHeader from './QueryHeader'
import ResultHeader from './ResultHeader'
import { ResultViewer } from './ResultViewer'
import ageOfDate from './util/ageOfDate'
import { Response } from '../Playground'
import HttpHeaders, { Header } from './HttpHeaders'
import SchemaExplorer from './SchemaExplorer'

import GraphDocs from './DocExplorer/GraphDocs'

// tslint:disable-next-line
const CSSTransitionGroup = require('react-transition-group/CSSTransitionGroup')

/**
 * The top-level React component for CustomGraphiQL, intended to encompass the entire
 * browser viewport.
 *
 * @see https://github.com/graphql/graphiql#usage
 */

export interface Props {
  fetcher: (params: any) => Promise<any>
  isGraphcoolUrl?: boolean
  schema?: GraphQLSchema
  query?: string
  variables?: string
  operationName?: string
  responses?: Response[]

  storage?: any
  defaultQuery?: string
  onEditQuery?: (data: any) => void
  onEditVariables?: (variables: any) => any
  onEditOperationName?: (name: any) => any
  onToggleDocs?: (value: boolean) => any
  onClickCodeGeneration?: any
  onChangeHeaders?: (headers: Header[]) => any
  headers?: any[]
  getDefaultFieldNames?: () => any
  showViewAs?: boolean
  showSelectUser?: boolean
  showCodeGeneration?: boolean
  showEndpoints?: boolean
  showQueryTitle?: boolean
  showResponseTitle?: boolean
  showDownloadJsonButton?: boolean
  disableQueryHeader?: boolean
  selectedViewer?: Viewer
  onChangeViewer?: (data: any) => void
  queryOnly?: boolean
  showDocs?: boolean
  rerenderQuery?: boolean
  operations?: OperationDefinition[]
  showSchema?: boolean
  schemaIdl?: string
  schemaModelName?: string
  disableAutofocus?: boolean
  disableResize?: boolean

  onboardingStep?: any
  tether?: any
  nextStep?: () => void
  autofillMutation?: () => void
  disableAnimation?: boolean
  hideLineNumbers?: boolean
  hideGutters?: boolean
  readonly?: boolean
}

export interface State {
  schema: any
  query: any
  variables: any
  operationName: string
  responses: any[]
  editorFlex: number
  variableEditorOpen: boolean
  variableEditorHeight: number
  docExploreOpen: boolean
  docExplorerWidth: number
  isWaitingForReponse: boolean
  subscription: any
  variableToType: any
  operations: any[]
  docExplorerOpen: boolean
  schemaExplorerOpen: boolean
  schemaExplorerWidth: number
  isWaitingForResponse: boolean
}

export interface SimpleProps {
  children?: any
}

export interface ToolbarButtonProps extends SimpleProps {
  onClick: (e: any) => void
  title: string
  label: string
}

export class CustomGraphiQL extends React.Component<Props, State> {
  static Logo: (props: SimpleProps) => JSX.Element
  static Toolbar: (props: SimpleProps) => JSX.Element
  static Footer: (props: SimpleProps) => JSX.Element
  static ToolbarButton: (props: ToolbarButtonProps) => JSX.Element

  public codeMirrorSizer
  public queryEditorComponent
  public variableEditorComponent
  public resultComponent
  public editorBarComponent
  public docExplorerComponent: any // later React.Component<...>

  private storage: any
  private editorQueryID: number

  private updateQueryFacts = debounce(150, query => {
    const queryFacts = getQueryFacts(this.state.schema, query)
    if (queryFacts) {
      // Update operation name should any query names change.
      const operationName = getSelectedOperationName(
        this.state.operations,
        this.state.operationName,
        queryFacts.operations,
      )

      // Report changing of operationName if it changed.
      const onEditOperationName = this.props.onEditOperationName
      if (onEditOperationName && operationName !== this.state.operationName) {
        onEditOperationName(operationName)
      }

      this.setState({
        operationName,
        ...queryFacts,
      })
    }
  })

  constructor(props) {
    super(props)

    // Ensure props are correct
    if (typeof props.fetcher !== 'function') {
      throw new TypeError('CustomGraphiQL requires a fetcher function.')
    }

    // Cache the storage instance
    this.storage =
      props.storage || typeof window !== 'undefined'
        ? window.localStorage
        : {
            setItem: () => null,
            removeItem: () => null,
            getItem: () => null,
          }

    // Determine the initial query to display.
    const query =
      props.query !== undefined
        ? props.query
        : this._storageGet('query') !== null
          ? this._storageGet('query')
          : props.defaultQuery !== undefined ? props.defaultQuery : defaultQuery

    // Get the initial query facts.
    const queryFacts = getQueryFacts(props.schema, query)

    // Determine the initial variables to display.
    const variables =
      props.variables !== undefined
        ? props.variables
        : this._storageGet('variables')

    // Determine the initial operationName to use.
    const operationName =
      props.operationName !== undefined
        ? props.operationName
        : getSelectedOperationName(
            null,
            this._storageGet('operationName'),
            queryFacts && queryFacts.operations,
          )

    // Initialize state
    this.state = {
      schema: props.schema,
      query,
      variables,
      operationName,
      responses: props.responses || [],
      editorFlex: Number(this._storageGet('editorFlex')) || 1,
      variableEditorOpen: Boolean(variables),
      variableEditorHeight:
        Number(this._storageGet('variableEditorHeight')) || 200,
      docExplorerOpen: false,
      docExplorerWidth: Number(this._storageGet('docExplorerWidth')) || 350,
      schemaExplorerOpen: false,
      schemaExplorerWidth:
        Number(this._storageGet('schemaExplorerWidth')) || 350,
      isWaitingForResponse: false,
      subscription: null,
      ...queryFacts,
    }

    // Ensure only the last executed editor query is rendered.
    this.editorQueryID = 0

    // Subscribe to the browser window closing, treating it as an unmount.
    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => this.componentWillUnmount())
    }
  }

  componentDidMount() {
    // Ensure a form of a schema exists (including `null`) and
    // if not, fetch one using an introspection query.
    this._ensureOfSchema()

    // Utility for keeping CodeMirror correctly sized.
    this.codeMirrorSizer = new CodeMirrorSizer()
    ;(global as any).g = this
  }

  componentWillReceiveProps(nextProps) {
    let nextSchema = this.state.schema
    let nextQuery = this.state.query
    let nextVariables = this.state.variables
    let nextOperationName = this.state.operationName
    let nextResponses = this.state.responses

    if (nextProps.schema !== undefined) {
      nextSchema = nextProps.schema
    }
    if (
      nextProps.query !== undefined &&
      (this.props.rerenderQuery || nextProps.rerenderQuery)
    ) {
      nextQuery = nextProps.query
    }
    if (nextProps.variables !== undefined) {
      nextVariables = nextProps.variables
    }
    if (nextProps.operationName !== undefined) {
      nextOperationName = nextProps.operationName
    }
    if (nextProps.responses !== undefined) {
      nextResponses = nextProps.responses
    }
    if (
      nextSchema !== this.state.schema ||
      nextQuery !== this.state.query ||
      nextOperationName !== this.state.operationName
    ) {
      this.updateQueryFacts(nextQuery)
    }

    this.setState(
      {
        schema: nextSchema,
        query: nextQuery,
        variables: nextVariables,
        operationName: nextOperationName,
        responses: nextResponses,
      } as State,
    )
  }

  componentDidUpdate() {
    // If this update caused DOM nodes to have changed sizes, update the
    // corresponding CodeMirror instance sizes to match.
    const components = [
      this.queryEditorComponent,
      this.variableEditorComponent,
      // this.resultComponent,
    ]
    this.codeMirrorSizer.updateSizes(components)
    if (this.resultComponent && Boolean(this.state.subscription)) {
      this.resultComponent.scrollTop = this.resultComponent.scrollHeight
    }
  }

  // When the component is about to unmount, store any persistable state, such
  // that when the component is remounted, it will use the last used values.
  componentWillUnmount() {
    this._storageSet('query', this.state.query)
    this._storageSet('variables', this.state.variables)
    this._storageSet('operationName', this.state.operationName)
    this._storageSet('editorFlex', this.state.editorFlex)
    this._storageSet('variableEditorHeight', this.state.variableEditorHeight)
  }

  render() {
    const children = React.Children.toArray(this.props.children)

    // const logo =
    //   find(children, child => child.type === CustomGraphiQL.Logo) ||
    {
      /*<CustomGraphiQL.Logo />*/
    }

    {
      /*const toolbar =*/
    }
    {
      /*find(children, child => child.type === CustomGraphiQL.Toolbar) ||*/
    }
    {
      /*<CustomGraphiQL.Toolbar />*/
    }

    const footer = find(children, child => child.type === CustomGraphiQL.Footer)

    const queryWrapStyle = {
      WebkitFlex: this.state.editorFlex,
      flex: this.state.editorFlex,
    }

    const schemaWrapStyle = {
      height: '100%',
      // display: this.state.docExplorerOpen ? 'block':'none',
      width: this.state.schemaExplorerOpen ? this.state.schemaExplorerWidth : 0,
    }
    const docExplorerWrapClasses =
      'docExplorerWrap' +
      (this.state.docExplorerWidth < 200 ? ' doc-explorer-narrow' : '')

    const variableOpen = this.state.variableEditorOpen
    const variableStyle = {
      height: variableOpen ? this.state.variableEditorHeight : null,
    }

    const subscriptionResponse = this.state.responses.length > 1

    const Tether = this.props.tether

    return (
      <div className="graphiql-container">
        <style jsx={true}>{`
          .graphiql-container {
            font-family: Open Sans, sans-serif;
          }

          .docs-button,
          .schema-button {
            @inherit: .absolute, .white, .bgGreen, .pa6, .br2, .z2, .ttu, .fw6,
              .f14, .ph10, .pointer;
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

          .graphiql-button {
            @inherit: .white50, .bgDarkBlue, .ttu, .f14, .fw6, .br2, .pointer;
            padding: 5px 9px 6px 9px;
            letter-spacing: 0.53px;
          }
          .graphiql-button.generate-code {
            @inherit: .absolute;
            top: -57px;
            right: 25px;
            z-index: 2;
          }

          .download-button {
            @inherit: .white50, .bgDarkBlue, .ttu, .f14, .fw6, .br2, .pointer,
              .absolute;
            right: 25px;
            padding: 5px 9px 6px 9px;
            letter-spacing: 0.53px;
            z-index: 2;
            background-color: $darkerBlue !important;
            top: initial !important;
            bottom: 21px !important;
          }

          .intro {
            @inherit: .absolute, .tlCenter, .top50, .left50, .white20, .f16, .tc;
            font-family: 'Source Code Pro', 'Consolas', 'Inconsolata',
              'Droid Sans Mono', 'Monaco', monospace;
            letter-spacing: 0.6px;
            width: 235px;
          }
          .result-window {
            @inherit: .bgDarkBlue, .nosb;
          }

          .result-window.disableResize :global(.CodeMirror-gutters) {
            cursor: default !important;
          }

          .subscription-time {
            @inherit: .relative;
            height: 17px;
            margin-top: 12px;
            margin-bottom: 4px;
            &:before {
              @inherit: .absolute, .w100;
              content: "";
              top: 9px;
              left: 95px;
              border-top: 1px solid $white20;
            }
          }

          .subscription-time-text {
            @inherit: .bgDarkBlue, .white50, .f12;
            padding-left: 15px;
          }

          .listening {
            @inherit: .f16, .white40, .absolute, .bottom0;
            font-family: 'Source Code Pro', 'Consolas', 'Inconsolata',
              'Droid Sans Mono', 'Monaco', monospace;
            letter-spacing: 0.6px;
            padding-left: 24px;
            padding-bottom: 30px;
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
          <div
            ref={n => {
              this.editorBarComponent = n
            }}
            className="editorBar"
            onMouseDown={this.handleResizeStart}
          >
            <div className="queryWrap" style={queryWrapStyle}>
              {this.props.disableAnimation
                ? <QueryHeader
                    onPrettify={this.handlePrettifyQuery}
                    showEndpoints={this.props.showEndpoints}
                    showQueryTitle={this.props.showQueryTitle}
                  />
                : <CSSTransitionGroup
                    transitionName="query-header"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}
                  >
                    {!this.props.disableQueryHeader &&
                      <QueryHeader
                        onPrettify={this.handlePrettifyQuery}
                        showEndpoints={this.props.showEndpoints}
                        showQueryTitle={this.props.showQueryTitle}
                      />}
                  </CSSTransitionGroup>}
              <QueryEditor
                ref={n => {
                  this.queryEditorComponent = n
                }}
                schema={this.state.schema}
                value={this.state.query}
                onEdit={this.handleEditQuery}
                onHintInformationRender={this.handleHintInformationRender}
                onRunQuery={this.handleEditorRunQuery}
                disableAutofocus={this.props.disableAutofocus}
                hideLineNumbers={this.props.hideLineNumbers}
                hideGutters={this.props.hideGutters}
                readOnly={this.props.readonly}
              />
              <div className="variable-editor" style={variableStyle}>
                <HttpHeaders
                  headers={this.props.headers}
                  onChange={this.props.onChangeHeaders}
                />
                {this.props.showCodeGeneration &&
                  <div
                    className="graphiql-button generate-code"
                    onClick={this.props.onClickCodeGeneration}
                  >
                    Generate Code
                  </div>}
                <div
                  className="variable-editor-title"
                  style={{ cursor: variableOpen ? 'row-resize' : 'n-resize' }}
                  onMouseDown={this.handleVariableResizeStart}
                >
                  {'Query Variables'}
                </div>
                <VariableEditor
                  ref={n => {
                    this.variableEditorComponent = n
                  }}
                  value={this.state.variables}
                  variableToType={this.state.variableToType}
                  onEdit={this.handleEditVariables}
                  onHintInformationRender={this.handleHintInformationRender}
                  onRunQuery={this.handleEditorRunQuery}
                />
              </div>
              {[
                'STEP3_UNCOMMENT_DESCRIPTION',
                'STEP3_ENTER_MUTATION1_VALUES',
                'STEP3_ENTER_MUTATION2_VALUE',
              ].indexOf(this.props.onboardingStep || '') > -1 &&
                <Tether
                  steps={[
                    {
                      step: 'STEP3_UNCOMMENT_DESCRIPTION',
                      title: 'Uncomment the description',
                      description:
                        'To add the description to the query, just remove the #',
                    },
                    {
                      step: 'STEP3_ENTER_MUTATION1_VALUES',
                      title: 'This is a mutation',
                      description:
                        'Enter data for the imageUrl and the description',
                      buttonText: 'Autofill Data',
                    },
                    {
                      step: 'STEP3_ENTER_MUTATION2_VALUE',
                      title: 'Lets add some more data',
                      description:
                        'Enter data for the imageUrl and the description',
                      buttonText: 'Autofill Data',
                    },
                  ]}
                  onClick={() => {
                    if (
                      this.props.onboardingStep.startsWith(
                        'STEP3_ENTER_MUTATION',
                      ) &&
                      typeof this.props.autofillMutation === 'function'
                    ) {
                      this.props.autofillMutation()
                    }
                  }}
                >
                  <div
                    className={cn('onboarding-hint', {
                      step1:
                        this.props.onboardingStep ===
                        'STEP3_UNCOMMENT_DESCRIPTION',
                      step2:
                        this.props.onboardingStep ===
                          'STEP3_ENTER_MUTATION1_VALUES' ||
                        this.props.onboardingStep ===
                          'STEP3_ENTER_MUTATION2_VALUE',
                    })}
                  />
                </Tether>}
            </div>
            {!this.props.queryOnly &&
              <div className="resultWrap">
                {this.props.isGraphcoolUrl &&
                  this.props.showSelectUser &&
                  this.props.showViewAs &&
                  <ResultHeader
                    showViewAs={this.props.showViewAs}
                    showSelectUser={this.props.showSelectUser}
                    selectedViewer={this.props.selectedViewer}
                    onChangeViewer={this.props.onChangeViewer}
                    showResponseTitle={this.props.showResponseTitle}
                  />}
                {this.props.tether
                  ? <Tether
                      offsetX={18}
                      offsetY={25}
                      steps={[
                        {
                          step: 'STEP3_RUN_QUERY1',
                          title: 'Execute your first query',
                          description:
                            'You just wrote your first GraphQL Query! Click here to execute it.',
                        },
                        {
                          step: 'STEP3_RUN_MUTATION1',
                          title: 'Run your first mutation',
                          description:
                            'Awesome! You just wrote your first GraphQL Mutation. Click here to execute it',
                        },
                        {
                          step: 'STEP3_RUN_MUTATION2',
                          title: 'Lets add more data',
                        },
                        {
                          step: 'STEP3_RUN_QUERY2',
                          title: "Let's see how the data changed",
                          description:
                            'After adding data with the mutations, lets' +
                            ' see how the result of the query changes',
                        },
                      ]}
                    >
                      <ExecuteButton
                        isRunning={Boolean(this.state.subscription)}
                        onRun={this.handleRunQuery}
                        onStop={this.handleStopQuery}
                        operations={this.state.operations}
                      />
                    </Tether>
                  : <ExecuteButton
                      isRunning={Boolean(this.state.subscription)}
                      onRun={this.handleRunQuery}
                      onStop={this.handleStopQuery}
                      operations={this.state.operations}
                    />}
                {this.state.isWaitingForResponse &&
                  <div className="spinner-container">
                    <div className="spinner" />
                  </div>}

                <div
                  className={
                    'result-window' +
                    (this.props.disableResize ? ' disableResize' : '')
                  }
                  ref={c => {
                    this.resultComponent = c
                  }}
                >
                  {this.state.responses
                    .filter(res => res && res.date)
                    .map(response =>
                      <div key={response.time}>
                        {subscriptionResponse &&
                          response.time &&
                          <div className="subscription-time">
                            <div className="subscription-time-text">
                              {ageOfDate(response.time)}
                            </div>
                          </div>}
                        <ResultViewer
                          value={response.date}
                          hideGutters={this.props.hideGutters}
                        />
                      </div>,
                    )}
                </div>
                {footer}
                {!this.state.responses ||
                  (this.state.responses.length === 0 &&
                    <div className="intro">
                      Hit the Play Button to get a response here
                    </div>)}
                {Boolean(this.state.subscription) &&
                  <div className="listening">Listening &hellip;</div>}
                {this.state.responses &&
                  this.state.responses.length > 0 &&
                  this.props.showDownloadJsonButton &&
                  <div
                    className="download-button"
                    onClick={this.handleDownloadJSON}
                  >
                    Download JSON
                  </div>}
              </div>}
          </div>
        </div>
        <GraphDocs schema={this.state.schema} />
        {/*(this.props.queryOnly ? this.props.showDocs : true) &&
          <div className={docExplorerWrapClasses} style={docWrapStyle}>
            <div
              className={`docs-button ${!this.state.docExplorerOpen &&
                'inactive'}`}
              onClick={this.handleToggleDocs}
            >
              Docs
            </div>
            <div
              className="docExplorerResizer"
              onMouseDown={this.handleDocsResizeStart}
            />
            {this.state.docExplorerOpen &&
              <DocExplorer
                ref={c => {
                  this.docExplorerComponent = c
                }}
                schema={this.state.schema}
                open={this.state.docExploreOpen}
              />}
          </div>*/}
        {this.props.showSchema &&
          <div className={docExplorerWrapClasses} style={schemaWrapStyle}>
            <div
              className={`schema-button ${!this.state.schemaExplorerOpen &&
                'inactive'}`}
              onClick={this.handleToggleSchema}
            >
              Schema
            </div>
            <div
              className="docExplorerResizer"
              onMouseDown={this.handleSchemaResizeStart}
            />
            {this.state.schemaExplorerOpen &&
              <SchemaExplorer
                ref={c => {
                  this.docExplorerComponent = c
                }}
                idl={this.props.schemaIdl}
                modelName={this.props.schemaModelName}
              />}
          </div>}
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
    const { insertions, result } = fillLeafs(
      this.state.schema,
      this.state.query,
      this.props.getDefaultFieldNames,
    )
    if (insertions && insertions.length > 0) {
      const editor = this.queryEditorComponent.getCodeMirror()
      editor.operation(() => {
        const cursor = editor.getCursor()
        const cursorIndex = editor.indexFromPos(cursor)
        editor.setValue(result)
        let added = 0
        const markers = insertions.map(({ index, str }) =>
          editor.markText(
            editor.posFromIndex(index + added),
            editor.posFromIndex(index + (added += str.length)),
            {
              className: 'autoInsertedLeaf',
              clearOnEnter: true,
              title: 'Automatically added leaf fields',
            },
          ),
        )
        setTimeout(() => markers.forEach(marker => marker.clear()), 7000)
        let newCursorIndex = cursorIndex
        insertions.forEach(({ index, str }) => {
          if (index < cursorIndex) {
            newCursorIndex += str.length
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

    const fetch = observableToPromise(fetcher({ query: introspectionQuery }))
    if (!isPromise(fetch)) {
      this.setState(
        {
          responses: [
            {
              date: 'Fetcher did not return a Promise for introspection.',
              time: new Date(),
            },
          ],
        } as State,
      )
      return
    }

    fetch
      .then(result => {
        if (result.data) {
          return result
        }

        // Try the stock introspection query first, falling back on the
        // sans-subscriptions query for services which do not yet support it.
        const fetch2 = observableToPromise(
          fetcher({
            query: introspectionQuerySansSubscriptions,
          }),
        )
        if (!isPromise(fetch)) {
          throw new Error('Fetcher did not return a Promise for introspection.')
        }
        return fetch2
      })
      .then(result => {
        // If a schema was provided while this fetch was underway, then
        // satisfy the race condition by respecting the already
        // provided schema.
        if (this.state.schema !== undefined) {
          return
        }

        if (result && result.data) {
          const schema = buildClientSchema(result.data)
          const queryFacts = getQueryFacts(schema, this.state.query)
          this.setState({ schema, ...queryFacts })
        } else {
          const responseString =
            typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2)
          this.setState(
            {
              // Set schema to `null` to explicitly indicate that no schema exists.
              schema: null,
              responses: [{ date: responseString, time: new Date() }],
            } as State,
          )
        }
      })
      .catch(error => {
        this.setState(
          {
            schema: null,
            responses: [
              { date: error && String(error.stack || error), time: new Date() },
            ],
          } as State,
        )
      })
  }

  // tslint:disable-next-line
  _storageGet = (name: string): any => {
    if (this.storage) {
      const value = this.storage.getItem('graphiql:' + name)
      // Clean up any inadvertently saved null/undefined values.
      if (value === 'null' || value === 'undefined') {
        this.storage.removeItem('graphiql:' + name)
      } else {
        return value
      }
    }
  }

  // tslint:disable-next-line
  _storageSet = (name: string, value: any): void => {
    if (this.storage) {
      if (value !== undefined) {
        this.storage.setItem('graphiql:' + name, value)
      } else {
        this.storage.removeItem('graphiql:' + name)
      }
    }
  }

  _fetchQuery(query, variables, operationName, cb) {
    const fetcher: any = this.props.fetcher
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
      operationName,
    })

    if (isPromise(fetch)) {
      // If fetcher returned a Promise, then call the callback when the promise
      // resolves, otherwise handle the error.
      fetch.then(cb).catch(error => {
        this.setState(
          {
            isWaitingForResponse: false,
            responses: [
              { date: error && String(error.stack || error), time: new Date() },
            ],
          } as State,
        )
      })
    } else if (isObservable(fetch)) {
      // If the fetcher returned an Observable, then subscribe to it, calling
      // the callback on each next value, and handling both errors and the
      // completion of the Observable. Returns a Subscription object.
      const subscription = fetch.subscribe({
        next: cb,
        error: error => {
          this.setState(
            {
              isWaitingForResponse: false,
              responses: [
                {
                  date: error && String(error.stack || error),
                  time: new Date(),
                },
              ],
              subscription: null,
            } as State,
          )
        },
        complete: () => {
          this.setState(
            {
              isWaitingForResponse: false,
              subscription: null,
            } as State,
          )
        },
      })

      return subscription
    } else {
      throw new Error('Fetcher did not return Promise or Observable.')
    }
  }

  handleRunQuery = selectedOperationName => {
    this.editorQueryID++
    const queryID = this.editorQueryID

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
      this.setState(
        {
          isWaitingForResponse: true,
          responses: [{ date: null, time: new Date() }],
          operationName,
        } as State,
      )

      // _fetchQuery may return a subscription.
      const subscription = this._fetchQuery(
        editedQuery,
        variables,
        operationName,
        result => {
          if (queryID === this.editorQueryID) {
            let isSubscription = false
            if (result.isSubscription) {
              isSubscription = true
              delete result.isSubscription
            }
            let responses
            const response = JSON.stringify(result, null, 2)

            if (isSubscription) {
              responses = this.state.responses
                .filter(res => res && res.date)
                .concat({ date: response, time: new Date() })
            } else {
              responses = [{ date: response, time: new Date() }]
            }
            this.setState(
              {
                isWaitingForResponse: false,
                responses,
              } as State,
            )
          }
        },
      )

      this.setState({ subscription } as State)
    } catch (error) {
      this.setState(
        {
          isWaitingForResponse: false,
          responses: [{ date: error.message, time: new Date() }],
        } as State,
      )
    }
  }

  handleStopQuery = () => {
    const subscription = this.state.subscription
    this.setState(
      {
        isWaitingForResponse: false,
        subscription: null,
      } as State,
    )
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
        for (const operation of operations) {
          if (
            operation.loc.start <= cursorIndex &&
            operation.loc.end >= cursorIndex
          ) {
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
      this.updateQueryFacts(value)
    }
    this.setState({ query: value } as State)
    if (this.props.onEditQuery) {
      return this.props.onEditQuery(value)
    }
    return null
  }

  handleEditVariables = value => {
    this.setState({ variables: value } as State)
    if (this.props.onEditVariables) {
      this.props.onEditVariables(value)
    }
  }

  handleHintInformationRender = elem => {
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

  handleEditorRunQuery = () => {
    this._runQueryAtCursor()
  }

  handleToggleDocs = () => {
    if (typeof this.props.onToggleDocs === 'function') {
      this.props.onToggleDocs(!this.state.docExplorerOpen)
    }
    this.setState({ docExplorerOpen: !this.state.docExplorerOpen } as State)
  }

  handleToggleSchema = () => {
    this.setState(
      { schemaExplorerOpen: !this.state.schemaExplorerOpen } as State,
    )
  }

  handleResizeStart = downEvent => {
    if (this.props.disableResize) {
      return
    }
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
      this.setState({ editorFlex: leftSize / rightSize } as State)
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
    if (
      target.className.indexOf &&
      target.className.indexOf('CodeMirror-gutter') !== 0
    ) {
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
        this.setState({ docExplorerOpen: false } as State)
      } else {
        this.setState(
          {
            docExplorerOpen: true,
            docExplorerWidth: Math.min(docsSize, 850),
          } as State,
        )
      }
    }

    let onMouseUp: any = () => {
      if (!this.state.docExplorerOpen) {
        this.setState({ docExplorerWidth: hadWidth } as State)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  handleSchemaResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.state.schemaExplorerWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = ReactDOM.findDOMNode(this)
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const schemaSize = app.clientWidth - cursorPos

      if (schemaSize < 100) {
        this.setState({ schemaExplorerOpen: false } as State)
      } else {
        this.setState(
          {
            schemaExplorerOpen: true,
            schemaExplorerWidth: Math.min(schemaSize, 850),
          } as State,
        )
      }
    }

    let onMouseUp: any = () => {
      if (!this.state.schemaExplorerOpen) {
        this.setState({ schemaExplorerWidth: hadWidth } as State)
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
        this.setState(
          {
            variableEditorOpen: false,
            variableEditorHeight: hadHeight,
          } as State,
        )
      } else {
        this.setState(
          {
            variableEditorOpen: true,
            variableEditorHeight: bottomSize,
          } as State,
        )
      }
    }

    let onMouseUp: any = () => {
      if (!didMove) {
        this.setState({ variableEditorOpen: !wasOpen } as State)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  handleDownloadJSON = () => {
    download(this.state.responses[0].date, 'result.json', 'application/json')
  }

  private onClickHintInformation = event => {
    if (event.target.className === 'typeName') {
      const typeName = event.target.innerHTML
      const schema = this.state.schema
      if (schema) {
        const type = schema.getType(typeName)
        if (type) {
          this.setState({ docExplorerOpen: true } as State, () => {
            this.docExplorerComponent.showDoc(type)
          })
        }
      }
    }
  }
}

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Logo = function GraphiQLLogo(props) {
  return (
    <div className="title">
      {props.children ||
        <span>
          {'Graph'}
          <em>
            {'i'}
          </em>
          {'QL'}
        </span>}
    </div>
  )
}

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Toolbar = function GraphiQLToolbar(props) {
  return (
    <div className="toolbar">
      {props.children}
    </div>
  )
}

// Add a button to the Toolbar.
CustomGraphiQL.ToolbarButton = ToolbarButton

// Configure the UI by providing this Component as a child of CustomGraphiQL.
CustomGraphiQL.Footer = function GraphiQLFooter(props) {
  return (
    <div className="footer">
      {props.children}
    </div>
  )
}

const defaultQuery = '# Try to write your query here'

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
      },
    )
  })
}

// Duck-type observable detection.
function isObservable(value) {
  return typeof value === 'object' && typeof value.subscribe === 'function'
}
