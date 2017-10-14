import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import Tooltip from '../Tooltip'
import { Theme } from '../Playground'
import * as cn from 'classnames'
import { PermissionSession, ServiceInformation } from '../../types'
import TypeChooser from './TypeChooser'
import { Button } from '../Button'

interface Props {
  theme: Theme
  serviceInformation: ServiceInformation
  onNewPermissionTab: (permissionTab: PermissionSession) => void
}

interface State {
  open: boolean
  modelSelected: boolean
  modelName: string
  relationName: string
  modelOperation: string
}

export default class NewPermissionTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: false,
      modelSelected: true,
      modelName: props.serviceInformation.models[0].name,
      relationName: props.serviceInformation.relations[0].name,
      modelOperation: 'create',
    }
  }
  render() {
    const {
      open,
      modelSelected,
      modelName,
      relationName,
      modelOperation,
    } = this.state
    const { theme, serviceInformation } = this.props
    return (
      <div className="settings">
        <style jsx={true}>{`
          .settings {
            @p: .absolute;
            z-index: 1005;
            right: 203px;
            top: 17px;
          }
          .tooltip-text {
            @p: .mr10, .darkBlue50, .fw6, .ttu, .f14;
            letter-spacing: 0.53px;
          }
          .icon {
            @p: .pointer, .relative;
          }

          .icon:hover :global(.permission-icon) :global(svg),
          .icon.open :global(.permission-icon) :global(svg) {
            fill: $white60;
          }
          .icon.light:hover :global(.permission-icon) :global(svg),
          .icon.light.open :global(.permission-icon) :global(svg) {
            fill: $darkBlue60;
          }

          .icon:hover :global(.stroke) :global(svg),
          .icon.open :global(.stroke) :global(svg) {
            fill: $white60;
            stroke: $white60;
          }
          .icon.light:hover :global(.stroke) :global(svg),
          .icon.light.open :global(.stroke) :global(svg) {
            fill: $darkBlue60;
            stroke: $darkBlue60;
          }

          .icon .permission-icon {
            @p: .relative;
          }
          .icon .permission-icon :global(.plus) {
            @p: .absolute;
            right: -5px;
            top: 12px;
          }
          .tooltip {
            @p: .absolute;
            right: -21px;
          }
          .row {
            @p: .flex, .itemsCenter, .justifyBetween;
            min-width: 245px;
          }
          .row + .row {
            @p: .mt16;
          }
          .button {
            @p: .br2, .f14, .fw6, .ttu, .darkBlue40;
            background: #e9eaeb;
            padding: 5px 9px 6px 9px;
          }
          .button:hover {
            @p: .darkBlue50;
            background: #dbdcdc;
          }
          input {
            @p: .bgDarkBlue10, .br2, .pv6, .ph10, .fw6, .darkBlue, .f12, .db,
              .w100;
          }
          b {
            @p: .fw6, .db;
          }
          .permission-type {
            @p: .mb10;
          }
          .chooser {
            @p: .mb25;
          }
          .select {
            @p: .relative, .flexAuto;
          }
          .select + .select {
            @p: .ml16;
          }
          select {
            @p: .relative, .darkBlue80;
            background: none;
            padding-right: 30px;
            background: $darkBlue04;
            border: none;
            border-radius: 2px;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;

            width: 100%;
            margin: 0;
            outline: none;
            padding: .5em .8em .6em .8em;

            /* Prefixed box-sizing rules necessary for older browsers */
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;

            /* Font size must be 16px to prevent iOS page zoom on focus */
            font-size: 16px;
          }
          .arrow {
            @p: .absolute, .darkBlue80;
            pointer-events: none;
            top: 6px;
            right: 8px;
          }
          .selects {
            @p: .flex;
          }
        `}</style>
        <div className={cn('icon', theme, { open })}>
          <div className="permission-icon" onClick={this.toggleTooltip}>
            <Icon
              src={require('graphcool-styles/icons/fill/permissions.svg')}
              color={theme === 'light' ? $v.darkBlue20 : $v.white20}
              width={23}
              height={23}
            />
            <Icon
              src={require('graphcool-styles/icons/stroke/addFull.svg')}
              color={theme === 'light' ? 'rgb(179,187,191)' : 'rgb(58,67,74)'}
              stroke={true}
              strokeWidth={6}
              width={12}
              height={12}
              className="plus stroke"
            />
          </div>
          <div className="tooltip">
            <Tooltip
              open={open}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <div>
                <div className="row chooser">
                  <div>
                    <div className="permission-type">Permission Type</div>
                    <TypeChooser
                      modelSelected={this.state.modelSelected}
                      onToggle={this.toggleType}
                    />
                  </div>
                </div>
                {modelSelected
                  ? <div className="row">
                      <div className="selects w100">
                        <div className="select">
                          <select
                            value={modelName}
                            onChange={this.handleModelNameChange}
                          >
                            {serviceInformation.models.map(model =>
                              <option value={model.name}>
                                {model.name}
                              </option>,
                            )}
                          </select>
                          <div className="arrow">▾</div>
                        </div>
                        <div className="select">
                          <select
                            value={modelOperation}
                            onChange={this.handleModelOperationChange}
                          >
                            {[
                              'create',
                              'read',
                              'update',
                              'delete',
                            ].map(operation =>
                              <option value={operation}>
                                {operation}
                              </option>,
                            )}
                          </select>
                          <div className="arrow">▾</div>
                        </div>
                      </div>
                    </div>
                  : <div className="row">
                      <div className="select w100">
                        <select
                          value={relationName}
                          onChange={this.handleRelationNameChange}
                          className="w100"
                        >
                          {serviceInformation.relations.map(relation =>
                            <option value={relation.name}>
                              {relation.name}
                            </option>,
                          )}
                        </select>
                        <div className="arrow">▾</div>
                      </div>
                    </div>}
                <div className="row">
                  <Button green={true} onClick={this.newTab}>
                    New Permission Tab
                  </Button>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  private handleModelNameChange = e => {
    this.setState({ modelName: e.target.value })
  }

  private handleRelationNameChange = e => {
    this.setState({ relationName: e.target.value })
  }

  private handleModelOperationChange = e => {
    this.setState({ modelOperation: e.target.value })
  }

  private newTab = () => {
    this.props.onNewPermissionTab({
      relationName: this.state.relationName,
      modelName: this.state.modelName,
      modelOperation: this.state.modelOperation,
    })
  }

  private toggleType = () => {
    this.setState(state => ({ modelSelected: !state.modelSelected }))
  }
  //
  // private handleChangeEndpoint = e => {
  //   if (typeof this.props.onChangeEndpoint === 'function') {
  //     this.props.onChangeEndpoint(e.target.value)
  //   }
  // }
  //
  // private handleChangeSubscriptionsEndpoint = e => {
  //   if (typeof this.props.onChangeSubscriptionsEndpoint === 'function') {
  //     this.props.onChangeSubscriptionsEndpoint(e.target.value)
  //   }
  // }

  private toggleTooltip = () => {
    this.setState(state => ({ open: !state.open }))
  }
}
