import * as React from 'react'
import CodeGenerationPopupCode from './CodeGenerationPopupCode'
import CodeGenerationPopupHeader from './CodeGenerationPopupHeader'
import CodeGenerationPopupEnvironmentChooser from './CodeGenerationPopupEnvironmentChooser'
import CodeGenerationPopupClientChooser from './CodeGenerationPopupClientChooser'
import { modalStyle } from '../constants'
import * as Modal from 'react-modal'
import { Environment, GraphQLClient } from '../types'

export interface Props {
  query: string
  isOpen: boolean
  onRequestClose: () => void
  endpointUrl: string
}

export interface State {
  selectedClient: GraphQLClient
  selectedEnv: Environment
}

export class CodeGenerationPopup extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedEnv: 'Browser',
      selectedClient: 'graphql-request',
    }
  }

  render() {
    const { query, endpointUrl } = this.props
    const queryActive = Boolean(query) && query.length > 0
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Code Generation"
        style={modalStyle}
      >
        <style jsx={true}>{`
          .code-generation-popup-wrapper {
            @inherit: .overflowScroll, .buttonShadow;
            max-height: calc(100vh - 50px);
          }
          .code-generation-popup {
            @inherit: .bgWhite, .br2, .flex, .flexColumn, .overflowXHidden;
          }
          .choosers {
            @inherit: .flex, .w100;
          }
        `}</style>
        <div className="code-generation-popup-wrapper">
          <div className="code-generation-popup">
            <CodeGenerationPopupHeader queryActive={queryActive} />
            <div className="choosers">
              <CodeGenerationPopupEnvironmentChooser
                environment={this.state.selectedEnv}
                setEnvironment={this.handleSetEnvironment}
              />
              <CodeGenerationPopupClientChooser
                client={this.state.selectedClient}
                setClient={this.handleSetClient}
              />
            </div>
            <CodeGenerationPopupCode
              endpointUrl={endpointUrl}
              query={query}
              client={this.state.selectedClient}
              environment={this.state.selectedEnv}
            />
          </div>
        </div>
      </Modal>
    )
  }

  private handleSetClient = (client: GraphQLClient) => {
    this.setState({ selectedClient: client } as State)
  }

  private handleSetEnvironment = (env: Environment) => {
    this.setState({ selectedEnv: env } as State)
  }
}
