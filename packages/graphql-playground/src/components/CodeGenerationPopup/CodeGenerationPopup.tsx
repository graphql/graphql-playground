import * as React from 'react'
import CodeGenerationPopupCode from './CodeGenerationPopupCode'
import CodeGenerationPopupHeader from './CodeGenerationPopupHeader'
import CodeGenerationPopupEnvironmentChooser from './CodeGenerationPopupEnvironmentChooser'
import CodeGenerationPopupClientChooser from './CodeGenerationPopupClientChooser'
import { modalStyle } from '../../constants'
import * as Modal from 'react-modal'
import { Environment, GraphQLClient } from '../../types'

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
    const { selectedEnv } = this.state
    const queryActive =
      Boolean(query) && query.length > 0 && query.includes('query')
    const clients =
      selectedEnv === 'Cli' ? ['curl'] : ['graphql-request', 'fetch']

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
                environment={this.state.selectedEnv}
                client={this.state.selectedClient}
                setClient={this.handleSetClient}
                clients={clients}
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
    const { selectedClient } = this.state
    if (env === 'Cli') {
      this.setState({ selectedEnv: env, selectedClient: 'curl' } as State)
    } else {
      this.setState(
        {
          selectedEnv: env,
          selectedClient: selectedClient === 'curl' ? 'fetch' : selectedClient,
        } as State,
      )
    }
  }
}
