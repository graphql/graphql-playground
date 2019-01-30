import * as React from 'react'
import { GraphQLSchema, printSchema } from 'graphql'
import EditorWrapper from '../EditorWrapper'
import { styled } from '../../../styled'
import { getSDL } from '../util/createSDL'
import { ISettings } from '../../../types'

export interface Props {
  schema?: GraphQLSchema | null
  isPollingSchema: boolean
  getRef?: (ref: SDLEditor) => void
  width?: number
  sessionId?: string
  settings: ISettings
}

class SDLEditor extends React.PureComponent<Props, { overflowY: boolean }> {
  cachedValue: string
  private editor: any
  private node: any

  constructor(props) {
    super(props)
    this.state = {
      overflowY: false,
    }
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
    require('codemirror/addon/fold/brace-fold')
    require('codemirror/addon/comment/comment')
    require('codemirror-graphql/mode')

    const gutters: any[] = []
    gutters.push('CodeMirror-linenumbers')

    this.editor = CodeMirror(this.node, {
      autofocus: false,
      value:
        getSDL(
          this.props.schema,
          this.props.settings['schema.disableComments'],
        ) || '',
      lineNumbers: false,
      showCursorWhenSelecting: false,
      tabSize: 1,
      mode: 'graphql',
      theme: 'graphiql',
      // lineWrapping: true,
      keyMap: 'sublime',
      readOnly: true,
      gutters,
    })
    ;(global as any).editor = this.editor
    this.editor.on('scroll', this.handleScroll)
    this.editor.refresh()
  }
  componentDidUpdate(prevProps: Props) {
    const CodeMirror = require('codemirror')
    const currentSchemaStr = this.props.schema && printSchema(this.props.schema)
    const prevSchemaStr = prevProps.schema && printSchema(prevProps.schema)
    if (currentSchemaStr !== prevSchemaStr) {
      const initialScroll = this.editor.getScrollInfo()
      this.cachedValue =
        getSDL(
          this.props.schema,
          this.props.settings['schema.disableComments'],
        ) || ''
      this.editor.setValue(
        getSDL(
          this.props.schema,
          this.props.settings['schema.disableComments'],
        ),
      )
      if (this.props.isPollingSchema) {
        this.editor.scrollTo(initialScroll.left, initialScroll.top)
      }
      CodeMirror.signal(this.editor, 'change', this.editor)
    }
    if (this.props.width !== prevProps.width) {
      this.editor.refresh()
    }
    if (
      this.props.settings['schema.disableComments'] !==
      prevProps.settings['schema.disableComments']
    ) {
      this.editor.refresh()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sessionId !== nextProps.sessionId) {
      this.editor.scrollTo(0, 0)
    }
  }

  componentWillUnmount() {
    this.editor.off('scroll')
    this.editor = null
  }

  handleScroll = e => {
    if (e.doc.scrollTop > 0) {
      return this.setState({
        overflowY: true,
      })
    }
    return this.setState({
      overflowY: false,
    })
  }

  render() {
    const { overflowY } = this.state
    return (
      <EditorWrapper>
        {overflowY && <OverflowShadow />}
        <Editor ref={this.setRef} />
      </EditorWrapper>
    )
  }

  setRef = ref => {
    this.node = ref
  }

  getCodeMirror() {
    return this.editor
  }
  getClientHeight() {
    return this.node && this.node.clientHeight
  }
}

export default SDLEditor

const Editor = styled.div`
  flex: 1;
  height: auto;
  overflow-x: hidden;
  overflow-y: scroll;
  .CodeMirror {
    background: ${p =>
      p.theme.mode === 'dark'
        ? p.theme.editorColours.editorBackground
        : 'white'};
    padding-left: 20px;
  }
`
const OverflowShadow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  box-shadow: 0px 1px 3px rgba(17, 17, 17, 0.1);
  z-index: 1000;
`
