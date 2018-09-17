import * as React from 'react'
// /*
// fill/fullArrowRight.svg
// arrowRight.svg
// star.svg DONE
// stroke/search.svg DONE
// Triangle
// stroke/cross.svg DONE
// fill/settings.svg DONE
// stroke/add.svg DONE
// stroke/addFull.svg DONE
// fill/copy.svg
// */

interface Props {
  color?: string
  width?: number
  height?: number
  stroke?: boolean
  strokeWidth?: number
  className?: string
  onClick?: () => void
}

export const AddIcon = ({ width, height, strokeWidth }: Props) => (
  <svg
    width={width}
    height={height}
    strokeWidth={strokeWidth}
    viewBox="0 0 50 50"
  >
    <line x1="25" y1="13.1" x2="25" y2="36.9" />
    <line x1="36.9" y1="25" x2="13.1" y2="25" />
  </svg>
)

export const AddFullIcon = ({ width, height, strokeWidth }: Props) => (
  <svg
    x="0px"
    y="0px"
    width={width}
    height={height}
    viewBox="-1 3 50 50"
    strokeWidth={strokeWidth}
  >
    <line x1="24" y1="7.27" x2="24" y2="48.73" />
    <line x1="44.73" y1="28" x2="3.27" y2="28" />
  </svg>
)

// export const ArrowRight = ({ width, height, color }: Props) => (
//   <svg width="30px" height="50px" viewBox="0 0 30 50" stroke={color}>
//     <polyline points="5,5 25,25 5,45 " />
//   </svg>
// )

export const SettingsIcon = ({
  color,
  width,
  height,
  className,
  onClick,
}: Props) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill={color}
    viewBox="0 0 50 50"
    onClick={onClick}
  >
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
  </svg>
)

export const CrossIcon = ({
  color,
  width,
  height,
  strokeWidth,
  className,
}: Props) => (
  <svg
    width={width}
    height={height}
    className={className}
    stroke={color}
    strokeWidth={strokeWidth}
    viewBox="0 0 50 50"
  >
    <line x1="4" y1="4" x2="46" y2="46" />
    <line x1="46" y1="4" x2="4" y2="46" />
  </svg>
)

export const ArrowRight = ({ width, height, color }: Props) => (
  <svg width="14px" height="11px" viewBox="-1 -1 14 11">
    <path
      d="M5,8.79825579 L5,-1.79402089"
      id="Stroke-3"
      stroke="#FFFFFF"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      transform="translate(5.750000, 3.502117) rotate(-90.000000) translate(-5.750000, -3.502117) "
    />
    <polyline
      id="Stroke-5"
      stroke="#FFFFFF"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      transform="translate(9.868295, 4.333992) rotate(-90.000000) translate(-9.868295, -4.333992) "
      points="14.2022868 2.16699605 9.86829475 6.50098814 5.53430265 2.16699605"
    />
  </svg>
)

export const History = ({ width, height, color, strokeWidth }: Props) => (
  <svg
    width={width}
    height={height}
    stroke={color}
    strokeWidth={strokeWidth}
    viewBox="0 0 50 50"
    fill="none"
  >
    <polyline points="4.33,19.64 9.7,27.69 15.95,20.54 " />
    <path
      d="M9.71,27.69C8.36,16.81,16.68,8.38,26.06,8.03c9.37-0.35,17.25,6.97,17.6,16.35
	c0.35,9.38-6.97,17.26-16.35,17.6"
    />
    <polyline points="26.68,16.06 26.68,25.89 35.62,25.89 " />
  </svg>
)

export const Star = ({
  height,
  width,
  color,
  stroke,
  strokeWidth,
  onClick,
}: Props) => (
  <svg
    width={width}
    height={height}
    fill={!stroke ? color : 'none'}
    stroke={stroke ? color : 'none'}
    strokeWidth={strokeWidth}
    viewBox="118 12 16 16"
    onClick={onClick}
  >
    <polygon points="126 24 121.297718 26.472136 122.195774 21.236068 118.391548 17.527864 123.648859 16.763932 126 12 128.351141 16.763932 133.608452 17.527864 129.804226 21.236068 130.702282 26.472136" />
  </svg>
)

export const Search = ({ height, width, strokeWidth, color }: Props) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 50 50"
    strokeWidth={strokeWidth}
    stroke={color}
    fill="none"
  >
    <circle cx="17.82" cy="18.11" r="16.21" />
    <line x1="29.28" y1="29.57" x2="48.21" y2="48.5" />
  </svg>
)
