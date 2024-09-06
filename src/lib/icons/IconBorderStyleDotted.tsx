import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

export const IconBorderStyleDotted = React.forwardRef<SVGSVGElement, IconProps>(function IconBorderStyleDotted(
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
        <path d="M 1,7.5 A 0.5,0.5 0 0 1 1.5,7 h 1 A 0.5,0.5 0 0 1 3,7.5 v 1 A 0.5,0.5 0 0 1 2.5,9 h -1 A 0.5,0.5 0 0 1 1,8.5 Z m 8,0 A 0.5,0.5 0 0 1 9.5,7 h 1 A 0.5,0.5 0 0 1 11,7.5 v 1 A 0.5,0.5 0 0 1 10.5,9 h -1 A 0.5,0.5 0 0 1 9,8.5 Z m -4,0 A 0.5,0.5 0 0 1 5.5,7 h 1 A 0.5,0.5 0 0 1 7,7.5 v 1 A 0.5,0.5 0 0 1 6.5,9 h -1 A 0.5,0.5 0 0 1 5,8.5 Z m 8,0 A 0.5,0.5 0 0 1 13.5,7 h 1 A 0.5,0.5 0 0 1 15,7.5 v 1 A 0.5,0.5 0 0 1 14.5,9 h -1 A 0.5,0.5 0 0 1 13,8.5 Z" />
      </svg>
    </Icon>
  );
});
