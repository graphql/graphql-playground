/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { GraphQLSchema } from 'graphql'
import * as MD from 'markdown-it'
import { connect } from 'react-redux'
import onHasCompletion from './onHasCompletion'
import { editQuery, setScrollTop } from '../../state/sessions/actions'
import { createStructuredSelector } from 'reselect'
import {
  getQuery,
  getSelectedSessionIdFromRoot,
  getScrollTop,
  getTabWidth,
  getUseTabs,
} from '../../state/sessions/selectors'
import EditorWrapper from './EditorWrapper'
import { styled } from '../../styled'
import { isIframe } from '../../utils'
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
  schema?: GraphQLSchema | null
  onHintInformationRender?: (elem: any) => void
  onRunQuery?: () => void
  onClickReference?: (reference: any) => void
  getRef?: (ref: QueryEditor) => void
}

export interface ReduxProps {
  showDocForReference?: (reference: any) => void
  onChange?: (query: string) => void
  setScrollTop?: (sessionId: string, value: number) => void
  value: string
  sessionId?: string
  scrollTop?: number
  tabWidth?: number
  useTabs?: boolean
}

const md = new MD()
// const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z0-9_@(]$/

export class QueryEditor extends React.PureComponent<Props & ReduxProps, {}> {
  private cachedValue: string
  private editor: any
  private ignoreChangeEvent: boolean
  private node: any

  constructor(props) {
    super(props)

    // Keep a cached version of the value, this cache will be updated when the
    // editor is updated, which can later be used to protect the editor from
    // unnecessary updates during the update lifecycle.
    this.cachedValue = props.value || ''
    if (this.props.getRef) {
      this.props.getRef(this)
    }
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
    require('codemirror/addon/search/search')
    require('codemirror/addon/search/searchcursor')
    require('codemirror/addon/search/jump-to-line')
    require('codemirror/addon/dialog/dialog')
    require('codemirror/addon/lint/lint')
    require('codemirror/keymap/sublime')
    require('codemirror/keymap/vim')
    require('codemirror-graphql/hint')
    require('codemirror-graphql/lint')
    require('codemirror-graphql/info')
    require('codemirror-graphql/jump')
    require('codemirror-graphql/mode')

    const gutters: any[] = []
    gutters.push('CodeMirror-linenumbers')
    gutters.push('CodeMirror-foldgutter')

    this.editor = CodeMirror(this.node, {
      autofocus: !isIframe() ? true : false,
      value: this.props.value || '',
      lineNumbers: true,
      tabSize: this.props.tabWidth || 2,
      indentWithTabs: this.props.useTabs || false,
      mode: 'graphql',
      theme: 'graphiql',
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      readOnly: false,
      foldGutter: {
        minFoldSize: 4,
      },
      lint: {
        schema: this.props.schema,
      },
      hintOptions: {
        schema: this.props.schema,
        closeOnUnfocus: true,
        completeSingle: false,
      },
      info: {
        schema: this.props.schema,
        renderDescription: text => md.render(text),
        onClick: this.props.onClickReference,
      },
      jump: {
        schema: this.props.schema,
        onClick: this.props.onClickReference,
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

        'Cmd-F': 'findPersistent',
        'Ctrl-F': 'findPersistent',
      },
    })

    this.editor.on('change', this.onEdit)
    this.editor.on('keyup', this.onKeyUp)
    this.editor.on('hasCompletion', this.onHasCompletion)
    ;(global as any).editor = this.editor

    if (this.props.scrollTop) {
      this.scrollTo(this.props.scrollTop)
    }
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
      this.editor.options.info.schema = this.props.schema
      this.editor.options.jump.schema = this.props.schema
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

    setTimeout(() => {
      if (this.props.sessionId !== prevProps.sessionId) {
        if (this.props.scrollTop) {
          this.scrollTo(this.props.scrollTop)
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sessionId !== nextProps.sessionId) {
      this.closeCompletion()
      this.updateSessionScrollTop()
      if (!isIframe()) {
        this.editor.focus()
      }
    }
  }

  scrollTo(y) {
    this.node.querySelector('.CodeMirror-scroll').scrollTop = y
  }

  updateSessionScrollTop() {
    if (this.props.setScrollTop && this.props.sessionId) {
      this.props.setScrollTop(
        this.props.sessionId!,
        this.node.querySelector('.CodeMirror-scroll').scrollTop,
      )
    }
  }

  componentWillUnmount() {
    this.updateSessionScrollTop()
    this.editor.off('change', this.onEdit)
    this.editor.off('keyup', this.onKeyUp)
    this.editor.off('hasCompletion', this.onHasCompletion)
    this.editor = null
  }

  render() {
    return (
      <EditorWrapper>
        <Editor ref={this.setRef} />
      </EditorWrapper>
    )
  }

  setRef = ref => {
    this.node = ref
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
    if (code === 86) {
      return
    }
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
    if (!this.ignoreChangeEvent && this.props.onChange) {
      this.cachedValue = this.editor.getValue()
      this.props.onChange(this.cachedValue)
    }
  }

  /**
   * Render a custom UI for CodeMirror's hint which includes additional info
   * about the type and description for the selected context.
   */
  private onHasCompletion = (cm, data) => {
    onHasCompletion(cm, data, this.props.onHintInformationRender)
  }

  private closeCompletion = () => {
    if (
      this.editor.state.completionActive &&
      typeof this.editor.state.completionActive.close === 'function'
    ) {
      this.editor.state.completionActive.close()
    }
  }
}

const mapStateToProps = createStructuredSelector({
  value: getQuery,
  sessionId: getSelectedSessionIdFromRoot,
  scrollTop: getScrollTop,
  tabWidth: getTabWidth,
  useTabs: getUseTabs,
})

export default connect(
  mapStateToProps,
  { onChange: editQuery, setScrollTop },
)(QueryEditor)

const Editor = styled.div`
  flex: 1 1 0%;
  position: relative;

  .CodeMirror {
    width: 100%;
    background: ${p => p.theme.editorColours.editorBackground};
  }
`
