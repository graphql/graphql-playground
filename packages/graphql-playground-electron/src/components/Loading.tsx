import * as React from 'react'

interface Props {
  color?: string
  width?: number
  height?: number
  className?: string
}

export default class Loading extends React.Component<Props, {}> {
  render() {
    const width = this.props.width || 30
    const height = this.props.height || 30
    const backgroundColor = this.props.color || '#000'
    return (
      <div
        style={{ width, height, backgroundColor }}
        className={`root ${this.props.className}`}
      >
        <style jsx={true}>{`
          div {
            border-radius: 100%;
            animation: sk-scaleout 1.0s infinite ease-in-out;
          }

          @keyframes sk-scaleout {
            0% {
              transform: scale(0);
            }
            100% {
              transform: scale(1.0);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    )
  }
}
