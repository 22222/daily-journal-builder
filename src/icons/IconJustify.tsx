import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

export const IconJustify = React.forwardRef<SVGSVGElement, IconProps>(function IconJustify(
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
        <path
          fillRule="evenodd"
          d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"
        />
      </svg>
    </Icon>
  );
});
