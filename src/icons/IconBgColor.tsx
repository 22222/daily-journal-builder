import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

export const IconBgColor = React.forwardRef<SVGSVGElement, IconProps>(function IconBgColor(
  { className, style, color = "currentColor", size = "1em", ...rest }: IconProps,
  ref,
) {
  return (
    <Icon className={className} style={style}>
      <svg
        ref={ref}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        {...rest}
      >
        <path fill={color} fillOpacity=".01" d="M0 0h48v48H0z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37 37a4 4 0 0 0 4-4c0-1.473-1.333-3.473-4-6-2.667 2.527-4 4.527-4 6a4 4 0 0 0 4 4Z"
          fill={color}
        />
        <path d="m20.854 5.504 3.535 3.536" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <path
          d="M23.682 8.333 8.125 23.889 19.44 35.203l15.556-15.557L23.682 8.333Z"
          stroke={color}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="m12 20.073 16.961 5.577M4 43h40" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
    </Icon>
  );
});
