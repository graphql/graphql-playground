import * as React from 'react'

interface IProps {
  title?: string
  color?: string
  width?: number
  height?: number
  stroke?: string
  fill?: string
  strokeWidth?: number
  className?: string
  children?: any
  viewBox?: string
  y?: string
  x?: string
  onClick?: () => void
}

const Svg = ({ title, children, ...props }: IProps) => (
  <svg {...props}>
    {title ? <title>{title}</title> : undefined}
    {children}
  </svg>
)

export const AddIcon = (props: IProps) => (
  <Svg {...props} viewBox="0 0 50 50">
    <line x1="25" y1="13.1" x2="25" y2="36.9" />
    <line x1="36.9" y1="25" x2="13.1" y2="25" />
  </Svg>
)

export const AddFullIcon = (props: IProps) => (
  <Svg x="0px" y="0px" viewBox="-1 3 50 50" {...props}>
    <line x1="24" y1="7.27" x2="24" y2="48.73" />
    <line x1="44.73" y1="28" x2="3.27" y2="28" />
  </Svg>
)

export const FullArrowRightIcon = (props: IProps) => (
  <Svg {...props} viewBox="0 0 14 11">
    <path
      d="M13.32,4.97L8.99,0.64c-0.29-0.29-0.77-0.29-1.06,0s-0.29,0.77,0,1.06l2.97,2.97H1.21
	C0.8,4.67,0.46,5,0.46,5.42S0.8,6.17,1.21,6.17h9.85L7.93,9.3c-0.29,0.29-0.29,0.77,0,1.06c0.15,0.15,0.34,0.22,0.53,0.22
	s0.38-0.07,0.53-0.22l4.33-4.33C13.61,5.74,13.61,5.26,13.32,4.97z"
    />
  </Svg>
)

// export const ArrowRight = ({ width, height, color }: IProps) => (
//   <Svg width="30px" height="50px" viewBox="0 0 30 50" stroke={color}>
//     <polyline points="5,5 25,25 5,45 " />
//   </Svg>
// )

export const SettingsIcon = (props: IProps) => (
  <Svg {...props} viewBox="0 0 50 50">
    <path
      d="M48,21h-5.71c-0.4-1.58-0.91-3.33-1.56-4.66l4.06-4.06c0.19-0.19,0.29-0.44,0.29-0.71
		c0-0.27-0.11-0.52-0.29-0.71L39.14,5.2c-0.39-0.39-1.02-0.39-1.41,0l-4.06,4.06C32.33,8.62,30.58,8.11,29,7.71V2c0-0.55-0.45-1-1-1
		h-6c-0.55,0-1,0.45-1,1v5.71c-1.58,0.4-3.33,0.91-4.66,1.55L12.27,5.2c-0.39-0.39-1.02-0.39-1.41,0L5.2,10.86
		c-0.39,0.39-0.39,1.02,0,1.41l4.07,4.07C8.62,17.66,8.11,19.42,7.71,21H2c-0.55,0-1,0.45-1,1v6c0,0.55,0.45,1,1,1h5.71
		c0.4,1.58,0.91,3.34,1.56,4.66L5.2,37.73c-0.19,0.19-0.29,0.44-0.29,0.71s0.11,0.52,0.29,0.71l5.66,5.66c0.38,0.38,1.04,0.38,1.41,0
		l4.07-4.06c1.32,0.65,3.08,1.15,4.66,1.56V48c0,0.55,0.45,1,1,1h6c0.55,0,1-0.45,1-1v-5.71c1.58-0.4,3.34-0.91,4.66-1.56l4.07,4.06
		c0.39,0.39,1.02,0.39,1.41,0l5.66-5.66c0.39-0.39,0.39-1.02,0-1.41l-4.06-4.07c0.65-1.33,1.16-3.08,1.56-4.66H48c0.55,0,1-0.45,1-1
		v-6C49,21.45,48.55,21,48,21 M25,33c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S29.41,33,25,33"
    />
  </Svg>
)

export const CrossIcon = (props: IProps) => (
  <Svg {...props} viewBox="0 0 50 50">
    <line x1="4" y1="4" x2="46" y2="46" />
    <line x1="46" y1="4" x2="4" y2="46" />
  </Svg>
)

export const ArrowRight = (props: IProps) => (
  <Svg width={14} height={11} {...props} viewBox="-1 -1 14 11">
    <path
      d="M5,8.79825579 L5,-1.79402089"
      id="Stroke-3"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform="translate(5.750000, 3.502117) rotate(-90.000000) translate(-5.750000, -3.502117) "
    />
    <polyline
      id="Stroke-5"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform="translate(9.868295, 4.333992) rotate(-90.000000) translate(-9.868295, -4.333992) "
      points="14.2022868 2.16699605 9.86829475 6.50098814 5.53430265 2.16699605"
    />
  </Svg>
)

export const History = (props: IProps) => (
  <Svg {...props} viewBox="0 0 50 50" fill="none">
    <polyline points="4.33,19.64 9.7,27.69 15.95,20.54 " />
    <path
      d="M9.71,27.69C8.36,16.81,16.68,8.38,26.06,8.03c9.37-0.35,17.25,6.97,17.6,16.35
	c0.35,9.38-6.97,17.26-16.35,17.6"
    />
    <polyline points="26.68,16.06 26.68,25.89 35.62,25.89 " />
  </Svg>
)

export const Star = ({
  height,
  width,
  stroke,
  fill,
  strokeWidth,
  onClick,
  ...props
}: IProps) => (
  <Svg
    width={width}
    height={height}
    fill={fill ? fill : 'none'}
    stroke={stroke ? stroke : 'none'}
    strokeWidth={strokeWidth}
    viewBox="118 12 16 16"
    onClick={onClick}
    {...props}
  >
    <polygon points="126 24 121.297718 26.472136 122.195774 21.236068 118.391548 17.527864 123.648859 16.763932 126 12 128.351141 16.763932 133.608452 17.527864 129.804226 21.236068 130.702282 26.472136" />
  </Svg>
)

export const Search = ({
  height,
  width,
  strokeWidth,
  color,
  ...props
}: IProps) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 50 50"
    strokeWidth={strokeWidth}
    stroke={color}
    fill="none"
    {...props}
  >
    <circle cx="17.82" cy="18.11" r="16.21" />
    <line x1="29.28" y1="29.57" x2="48.21" y2="48.5" />
  </Svg>
)

export const ShareIcon = ({ width, height, color, ...props }: IProps) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 50 50"
    stroke={color}
    {...props}
  >
    <path d="M16.47 15.56c-.36 0-.65.3-.65.67v20.22c0 .37.29.67.65.67h9.06c.36 0 .65-.3.65-.67s-.29-.67-.65-.67h-8.41V16.91h1.29v.67c0 .37.29.67.65.67h10.35c.36 0 .65-.3.65-.67v-.67h1.29v6.07c0 .37.29.67.65.67.36 0 .65-.3.65-.67v-6.74a.66.66 0 0 0-.65-.67h-1.94v-1.35h3.88v8.76c0 .37.29.67.65.67.36 0 .65-.3.65-.67v-9.44a.66.66 0 0 0-.65-.67h-4.53v-.67a.66.66 0 0 0-.65-.67H27.4c-.3-1.54-1.61-2.7-3.17-2.7-1.56 0-2.87 1.16-3.17 2.7h-2.01c-.36 0-.65.3-.65.67v.67h-4.53c-.36 0-.65.3-.65.67V40.5c0 .37.29.67.65.67h11.65c.36 0 .65-.3.65-.67s-.29-.67-.65-.67h-11V14.22h3.88v1.35h-1.93zm3.24-2.69h1.94c.36 0 .65-.3.65-.67 0-1.11.87-2.02 1.94-2.02 1.07 0 1.94.91 1.94 2.02 0 .37.29.67.65.67h1.94v4.04h-9.06v-4.04z" />
    <path d="M28.71 20.96h-9.06c-.36 0-.65.3-.65.67 0 .37.29.67.65.67h9.06c.36 0 .65-.3.65-.67a.66.66 0 0 0-.65-.67M28.71 23.65h-9.06c-.36 0-.65.3-.65.67s.3.68.66.68h9.06c.36 0 .65-.3.65-.67s-.3-.68-.66-.68M28.71 26.35h-9.06c-.36 0-.65.3-.65.67s.29.67.65.67h9.06c.36 0 .65-.3.65-.67s-.29-.67-.65-.67M26.13 29.04h-6.47c-.36 0-.65.3-.65.67 0 .37.29.67.65.67h6.47c.36 0 .65-.3.65-.67-.01-.36-.3-.67-.65-.67M37.77 33.21h-6.13l1.43-1.38c.26-.25.28-.68.03-.95a.62.62 0 0 0-.91-.04l-2.63 2.54c-.13.13-.21.3-.21.49v.02c0 .2.09.38.23.5l2.6 2.56c.12.12.28.18.44.18.17 0 .34-.07.47-.21.25-.27.23-.7-.03-.95l-1.43-1.41h6.13c.36 0 .65-.3.65-.67s-.28-.68-.64-.68" />
  </Svg>
)

export const Triangle = (props: IProps) => (
  <Svg width={6} height={7} viewBox="40 0 6 7" {...props}>
    <polygon
      stroke="none"
      fill="rgba(0, 0, 0, .2)"
      fillRule="evenodd"
      points="40 7 40 0 46 3.5"
    />
  </Svg>
)
