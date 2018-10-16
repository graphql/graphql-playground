import * as React from 'react'
import { ShareIcon } from './Icons'
import ToggleButton from './ToggleButton'
import Tooltip from './Tooltip'
import { Button } from './Button'
import Copy from './Copy'
import { keyframes, styled, ThemeInterface, withTheme } from '../styled'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import {
  getSharingHistory,
  getSharingHeaders,
  getSharingAllTabs,
  getShareUrl,
} from '../state/sharing/selectors'
import {
  toggleShareHistory,
  toggleShareHeaders,
  toggleShareAllTabs,
  share,
} from '../state/sharing/actions'

export interface SharingProps {
  allTabs: boolean
  headers: boolean
  history: boolean
  theme: ThemeInterface

  toggleShareHistory: () => void
  toggleShareHeaders: () => void
  toggleShareAllTabs: () => void
  share: () => void

  shareUrl?: string
  reshare: boolean
  isSharingAuthorization: boolean
  children?: any
}

export interface State {
  open: boolean
}

class Share extends React.Component<SharingProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }
  render() {
    const { open } = this.state
    const { allTabs, headers, history, shareUrl, reshare, theme } = this.props
    return (
      <Wrapper>
        <IconWrapper>
          <div onClick={this.toggleTooltip}>{this.props.children}</div>
          {open && (
            <TooltipWrapper>
              <Tooltip
                open={open}
                onClose={this.toggleTooltip}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'bottom',
                }}
                renderAfterContent={this.renderAuthSharingWarning}
              >
                <div>
                  <Row>
                    <TooltipText onClick={this.props.toggleShareAllTabs}>
                      Share all tabs{' '}
                    </TooltipText>
                    <ToggleButton
                      checked={allTabs}
                      onChange={this.props.toggleShareAllTabs}
                    />
                  </Row>
                  <Row>
                    <TooltipText onClick={this.props.toggleShareHeaders}>
                      HTTP headers{' '}
                    </TooltipText>
                    <ToggleButton
                      checked={headers}
                      onChange={this.props.toggleShareHeaders}
                    />
                  </Row>
                  <Row>
                    <TooltipText onClick={this.props.toggleShareHistory}>
                      History{' '}
                    </TooltipText>
                    <ToggleButton
                      checked={history}
                      onChange={this.props.toggleShareHistory}
                    />
                  </Row>
                  {shareUrl && (
                    <Row>
                      <Input value={shareUrl} disabled={true} />
                      <CopyWrapper>
                        <Copy text={shareUrl}>
                          <ShareIcon
                            color={theme.colours.darkBlue30}
                            width={25}
                            height={25}
                            title="Copy URL to Clipboard"
                          />
                        </Copy>
                      </CopyWrapper>
                    </Row>
                  )}
                  <Row>
                    <div />
                    <Button hideArrow={true} onClick={this.share}>
                      {reshare && shareUrl ? 'Reshare' : 'Share'}
                    </Button>
                  </Row>
                </div>
              </Tooltip>
            </TooltipWrapper>
          )}
        </IconWrapper>
      </Wrapper>
    )
  }

  private share = () => {
    this.props.share()
  }

  private renderAuthSharingWarning = () => {
    if (!this.props.isSharingAuthorization) {
      return null
    }

    return <AuthSharingWarning />
  }

  private toggleTooltip = () => {
    this.setState(state => ({ open: !state.open }))
  }
}

const mapStateToProps = createStructuredSelector({
  history: getSharingHistory,
  headers: getSharingHeaders,
  allTabs: getSharingAllTabs,
  shareUrl: getShareUrl,
})

export default withTheme(
  connect(
    mapStateToProps,
    {
      toggleShareAllTabs,
      toggleShareHeaders,
      toggleShareHistory,
      share,
    },
  )(Share),
)

const AuthSharingWarning = () => (
  <Message>
    <MessageTitle>Watch out!</MessageTitle>
    You’re sharing your <code>Authorization</code> header with the world!
  </Message>
)

// TODO: use theme

const pulse = keyframes`
  0% {
    transform: scale(1.04);
  }

  100% {
    transform: scale(1);
  }
`

const Message = styled.div`
  padding: 12px 16px;
  margin-top: 10px;

  font-size: 14px;
  letter-spacing: normal;

  cursor: default;
  border-radius: 2px;
  background: #f3f4f4;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);

  animation: ${pulse} 0.7s ease-in-out infinite alternate;
`

const MessageTitle = styled.div`
  margin-right: 3px;
  margin-bottom: 2px;
  font-weight: bold;
  color: #2a7ed2;
`

// Main styled components
const Wrapper = styled.div`
  z-index: 1005;
  height: 100%;
  margin-left: 6px;
`

const TooltipText = styled.div`
  margin-right: 10px;

  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontSemiBold};
  text-transform: uppercase;
  letter-spacing: 0.53px;

  color: ${p => p.theme.colours.darkBlue50};
`

const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;
`

const TooltipWrapper = styled.div`
  position: absolute;
  right: 0px;
`

const Row = styled.div`
  position: relative;
  min-width: 245px;
  margin-top: ${p => p.theme.sizes.small16};

  display: flex;
  align-items: center;
  justify-content: space-between;

  &:first-child {
    margin-top: 0;
  }
`

const CopyWrapper = styled.div`
  position: absolute;
  right: 0;

  &:hover {
    svg {
      fill: ${p => p.theme.colours.darkBlue60};
    }
  }
`

const Input = styled.input`
  display: block;
  width: 100%;
  padding: ${p => p.theme.sizes.small6} ${p => p.theme.sizes.small10};
  padding-right: 25px;

  font-weight: ${p => p.theme.sizes.fontSemiBold};
  font-size: ${p => p.theme.sizes.fontTiny};

  border-radius: ${p => p.theme.sizes.smallRadius};
  background: ${p => p.theme.colours.darkBlue10};
  color: ${p => p.theme.colours.darkBlue};
`
