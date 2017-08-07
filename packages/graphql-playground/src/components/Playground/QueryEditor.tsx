/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { GraphQLSchema } from 'graphql'

import onHasCompletion from 'graphiql/dist/utility/onHasCompletion'
/**
 * QueryEditor
 *
 * Maintains an instance of CodeMirror responsible for editing a GraphQL query.
 *
 * Props:
 *
 *   - schema: A GraphQLSchema instance enabling editor linting and hinting.
 *   - value: The text of the editor.
 *   - onEdit: A function called when the editor changes, given the edited text.
 *
 */
export interface Props {
  schema: GraphQLSchema | null
  value: string
  onEdit?: (value: string) => void
  onHintInformationRender?: (elem: any) => void
  onRunQuery?: () => void
  placeholder?: string
  readOnly?: boolean
  hideLineNumbers?: boolean
  disableAutofocus?: boolean
  hideGutters?: boolean
}

export class QueryEditor extends React.Component<Props, {}> {
  private cachedValue: string
  private editor: any
  private ignoreChangeEvent: boolean
  private node: any

  constructor(props) {
    super()

    // Keep a cached version of the value, this cache will be updated when the
    // editor is updated, which can later be used to protect the editor from
    // unnecessary updates during the update lifecycle.
    this.cachedValue = props.value || ''
  }

  componentDidMount() {
    // Lazily require to ensure requiring GraphiQL outside of a Browser context
    // does not produce an error.
    const CodeMirror = require('codemirror')
    require('codemirror/addon/hint/show-hint')
    require('codemirror/addon/comment/comment')
    require('codemirror/addon/edit/matchbrackets')
    require('codemirror/addon/edit/closebrackets')
    require('codemirror/addon/fold/foldgutter')
    require('codemirror/addon/fold/brace-fold')
    require('codemirror/addon/lint/lint')
    require('codemirror/addon/display/placeholder')
    require('codemirror/keymap/sublime')
    require('codemirror-graphql/hint')
    require('codemirror-graphql/lint')
    require('codemirror-graphql/mode')

    const gutters: any[] = []
    if (!this.props.hideLineNumbers) {
      gutters.push('CodeMirror-linenumbers')
    }
    if (!this.props.hideGutters) {
      gutters.push('CodeMirror-foldgutter')
    }
    let foldGutter: any = {}
    if (!this.props.hideGutters) {
      foldGutter = {
        minFoldSize: 4,
      }
    }

    this.editor = CodeMirror(this.node, {
      autofocus: !this.props.disableAutofocus,
      placeholder: this.props.placeholder,
      value: this.props.value || '',
      lineNumbers: !this.props.hideLineNumbers,
      tabSize: 2,
      mode: 'graphql',
      theme: 'graphiql',
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      readOnly: Boolean(this.props.readOnly),
      foldGutter,
      lint: {
        schema: this.props.schema,
      },
      hintOptions: {
        schema: this.props.schema,
        closeOnUnfocus: true,
        completeSingle: false,
      },
      gutters,
      extraKeys: {
        'Cmd-Space': () => this.editor.showHint({ completeSingle: true }),
        'Ctrl-Space': () => this.editor.showHint({ completeSingle: true }),
        'Alt-Space': () => this.editor.showHint({ completeSingle: true }),
        'Shift-Space': () => this.editor.showHint({ completeSingle: true }),

        'Cmd-Enter': () => {
          if (this.props.onRunQuery) {
            this.props.onRunQuery()
          }
        },
        'Ctrl-Enter': () => {
          if (this.props.onRunQuery) {
            this.props.onRunQuery()
          }
        },

        // Editor improvements
        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight',
      },
    })

    this.editor.on('change', this.onEdit)
    this.editor.on('keyup', this.onKeyUp)
    this.editor.on('hasCompletion', this.onHasCompletion)
    ;(global as any).editor = this.editor
  }

  componentDidUpdate(prevProps) {
    const CodeMirror = require('codemirror')

    // Ensure the changes caused by this update are not interpretted as
    // user-input changes which could otherwise result in an infinite
    // event loop.
    this.ignoreChangeEvent = true
    if (this.props.schema !== prevProps.schema) {
      this.editor.options.lint.schema = this.props.schema
      this.editor.options.hintOptions.schema = this.props.schema
      CodeMirror.signal(this.editor, 'change', this.editor)
    }
    if (
      this.props.value !== prevProps.value &&
      this.props.value !== this.cachedValue
    ) {
      this.cachedValue = this.props.value
      this.editor.setValue(this.props.value)
    }
    this.ignoreChangeEvent = false
  }

  componentWillUnmount() {
    this.editor.off('change', this.onEdit)
    this.editor.off('keyup', this.onKeyUp)
    this.editor.off('hasCompletion', this.onHasCompletion)
    this.editor = null
  }

  render() {
    return (
      <div
        className="query-editor"
        ref={node => {
          this.node = node
        }}
      />
    )
  }

  /**
   * Public API for retrieving the CodeMirror instance from this
   * React component.
   */
  getCodeMirror() {
    return this.editor
  }

  /**
   * Public API for retrieving the DOM client height for this component.
   */
  getClientHeight() {
    return this.node && this.node.clientHeight
  }

  private onKeyUp = (_, event) => {
    const code = event.keyCode
    if (
      (code >= 65 && code <= 90) || // letters
      (!event.shiftKey && code >= 48 && code <= 57) || // numbers
      (event.shiftKey && code === 189) || // underscore
      (event.shiftKey && code === 50) || // @
      (event.shiftKey && code === 57) // (
    ) {
      this.editor.execCommand('autocomplete')
    }
  }

  private onEdit = () => {
    if (!this.ignoreChangeEvent) {
      this.cachedValue = this.editor.getValue()
      if (this.props.onEdit) {
        this.props.onEdit(this.cachedValue)
      }
    }
  }

  /**
   * Render a custom UI for CodeMirror's hint which includes additional info
   * about the type and description for the selected context.
   */
  private onHasCompletion = (cm, data) => {
    onHasCompletion(cm, data, this.props.onHintInformationRender)
  }
}
