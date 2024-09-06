import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

export const IconBorderStyleSolid = React.forwardRef<SVGSVGElement, IconProps>(function IconBorderStyleSolid(
  { className, style, color = "currentColor", size = "1em", ...rest }: IconProps,
  ref,
) {
  return (
    <Icon className={className} style={style}>
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill={color}
        {...rest}
      >
        {/* <path d="M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5z" /> */}
        <path d="M 1,7.5 A 0.5,0.5 0 0 1 1.5,7 h 13 A 0.5,0.5 0 0 1 15,7.5 v 1 A 0.5,0.5 0 0 1 14.5,9 H 1.5 A 0.5,0.5 0 0 1 1,8.5 Z" />
      </svg>
    </Icon>
  );
});
