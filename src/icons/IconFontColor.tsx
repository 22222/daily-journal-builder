import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

export const IconFontColor = React.forwardRef<SVGSVGElement, IconProps>(function IconFontColor(
  { className, style, color = "currentColor", size = "1em", ...rest }: IconProps,
  ref,
) {
  return (
    <Icon className={className} style={style}>
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size} {...rest}>
        <path
          fill={color}
          d="M221.631 109 109.92 392h58.055l24.079-61h127.892l24.079 61h58.055L290.369 109Zm-8.261 168L256 169l42.63 108Z"
        />
      </svg>
    </Icon>
  );
});
