import * as React from 'react'
import { GraphQLSchema } from 'graphql'
import EditorWrapper from '../EditorWrapper'
import { styled } from '../../../styled'
import { getSDL } from '../util/createSDL'

export interface Props {
	schema?: GraphQLSchema | null
	getRef?: (ref: SDLEditor) => void
	width?: number
	sessionId?: string
}

class SDLEditor extends React.PureComponent<Props, {}> {
	cachedValue: string
	private editor: any
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
		require('codemirror/addon/fold/brace-fold')
		require('codemirror/addon/comment/comment')
		require('codemirror-graphql/mode')

		const gutters: any[] = []
		gutters.push('CodeMirror-linenumbers')

		this.editor = CodeMirror(this.node, {
			autofocus: false,
			value: getSDL(this.props.schema) || '',
			lineNumbers: false,
			showCursorWhenSelecting: false,
			tabSize: 1,
			mode: 'graphql',
			theme: 'graphiql',
			lineWrapping: true,
			keyMap: 'sublime',
			readOnly: true,
			gutters,
		})
		;(global as any).editor = this.editor
		this.editor.refresh()
	}

	componentDidUpdate(prevProps: Props) {
		const CodeMirror = require('codemirror')
		if (this.props.schema !== prevProps.schema) {
			this.cachedValue = getSDL(this.props.schema) || ''
			this.editor.setValue(getSDL(this.props.schema))
			CodeMirror.signal(this.editor, 'change', this.editor)
		}
		if (this.props.width !== prevProps.width) {
			this.editor.refresh()
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.sessionId !== nextProps.sessionId) {
			this.editor.scrollTo(0, 0)
		}
	}

	componentWillUnmount() {
		this.editor = null
	}

	render() {
		return (
			<EditorWrapper>
				<Editor ref={this.setRef} />
			</EditorWrapper>
		)
	}

	setRef = (ref) => {
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
		background: ${(p) => p.theme.editorColours.editorBackground};
	}
`
