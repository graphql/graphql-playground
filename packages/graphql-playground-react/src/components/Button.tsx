import * as React from 'react'
import * as cn from 'classnames'
import { Icon, $v } from 'graphcool-styles'

export interface Props {
  hideArrow?: boolean
  primary?: boolean
  button?: boolean
  green?: boolean
  white?: boolean
  gray?: boolean
  greenOnWhite?: boolean
  arrowToBottom?: boolean
  arrowToLeft?: boolean
  children?: any
  className?: string
  wrap?: boolean
  onClick?: (e?: any) => void
}

export function A({
  hideArrow,
  primary,
  button,
  green,
  white,
  gray,
  greenOnWhite,
  arrowToBottom,
  arrowToLeft,
  children,
  className,
  wrap,
  onClick,
}: Props) {
  return (
    <div
      className={cn('link', className, {
        primary,
        button,
        green,
        'green-on-white': greenOnWhite,
        white,
        arrowToBottom,
        arrowToLeft,
        gray,
        wrap,
      })}
      onClick={onClick}
    >
      <style jsx={true}>{`
        .link {
          @p: .pointer, .dib, .blue, .f14, .flex, .itemsCenter;
        }

        .link.gray {
          @p: .darkBlue50;
        }

        .link.gray :global(svg) {
          fill: $darkBlue50;
        }

        .link.gray:hover {
          @p: .darkBlue70;
        }

        .link.gray:hover :global(svg) {
          fill: $darkBlue70;
        }

        .link.white {
          @p: .white50;
        }

        .link.white :global(svg) {
          fill: $white50;
        }

        .link.white:hover {
          @p: .white70;
        }
        .link.white:hover :global(svg) {
          fill: $white70;
        }

        .link :global(a),
        .link > div {
          @p: .flex, .itemsCenter, .ttu, .tracked, .fw6, .nowrap, .noUnderline;
          font-size: inherit;
          color: inherit;
        }

        .link.wrap :global(a),
        .link.wrap > div {
          white-space: normal;
          text-align: right;
        }

        .link.arrowToLeft :global(a),
        .link.arrowToLeft > div {
          @p: .flex, .itemsCenter, .ttu, .tracked, .fw6, .nowrap, .noUnderline;
          font-size: inherit;
          color: inherit;
          flex-direction: row-reverse;
        }

        .button {
          @p: .br2, .pv6, .ph10, .buttonShadow, .white, .bgBlue;
          transition: background 0.25s ease, box-shadow 0.25s ease,
            transform 0.25s ease;
        }

        .button :global(svg) {
          fill: $white !important;
        }

        .button.green {
          @p: .bgGreen;
        }

        .link.button.white {
          @p: .darkBlue, .bgWhite;
        }

        .button.green-on-white {
          @p: .green, .bgWhite;
        }

        .link.button.white :global(svg) {
          fill: $darkBlue !important;
        }

        .button.green-on-white :global(svg) {
          fill: $green !important;
        }

        .link :global(.arrow) {
          @p: .ml10;
        }

        .link.arrowToLeft :global(.arrow) {
          @p: .ml0, .mr10;
        }

        .link.arrowToBottom :global(.arrow) {
          transform: rotate(90deg) !important;
        }

        .link.arrowToLeft :global(.arrow) {
          transform: rotate(180deg) !important;
        }

        .link:hover {
          color: #69a4e0;
        }

        .button:hover {
          color: $white;
          background: #3f8ad7;
          box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
          transform: translate3D(0, -1px, 0);
        }

        .button.green:hover {
          background: #3cb66f;
        }

        .button.white:hover {
          color: $darkBlue80;
          background: $white;
        }

        .button.green-on-white:hover {
          color: #3cb66f;
          background: $white;
        }

        .link:hover :global(.arrow) {
          animation: move 1s ease infinite;
        }

        .link.arrowToBottom:hover :global(.arrow) {
          animation: moveToBottom 1s ease infinite;
        }

        .link.arrowToLeft:hover :global(.arrow) {
          animation: moveToLeft 1s ease infinite;
        }

        @keyframes move {
          0% {
            transform: translate3D(0, 0, 0);
          }

          50% {
            transform: translate3D(3px, 0, 0);
          }

          100% {
            transform: translate3D(0, 0, 0);
          }
        }

        @keyframes moveToBottom {
          0% {
            transform: rotate(90deg) translate3D(0, 0, 0);
          }

          50% {
            transform: rotate(90deg) translate3D(3px, 0, 0);
          }

          100% {
            transform: rotate(90deg) translate3D(0, 0, 0);
          }
        }

        @keyframes moveToLeft {
          0% {
            transform: rotate(180deg) translate3D(0, 0, 0);
          }

          50% {
            transform: rotate(180deg) translate3D(3px, 0, 0);
          }

          100% {
            transform: rotate(180deg) translate3D(0, 0, 0);
          }
        }

        @media (min-width: 1000px) {
          .link.primary {
            @p: .f16;
          }
        }
      `}</style>
      {
        <div>
          {children ? children : 'Learn more'}
          {!hideArrow && (
            <Icon
              src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
              color={$v.blue}
              width={14}
              height={11}
              className="arrow"
            />
          )}
        </div>
      }
    </div>
  )
}

export function Button({
  hideArrow,
  primary,
  green,
  white,
  greenOnWhite,
  arrowToBottom,
  arrowToLeft,
  children,
  className,
  wrap,
  onClick,
}: Props) {
  return (
    <A
      button={true}
      hideArrow={hideArrow}
      primary={primary}
      green={green}
      white={white}
      greenOnWhite={greenOnWhite}
      arrowToBottom={arrowToBottom}
      arrowToLeft={arrowToLeft}
      className={className}
      wrap={wrap}
      onClick={onClick}
    >
      {children || null}
    </A>
  )
}
