import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./IconProps";

interface IconSquareProps extends IconProps {
  aspectRatio?: number | `${number}:${number}`;
}

export const IconSquare = React.forwardRef<SVGSVGElement, IconSquareProps>(function IconSquare(
  { className, style, color = "currentColor", size = "1em", aspectRatio, ...rest }: IconSquareProps,
  ref,
) {
  let width = size;
  let height = size;

  const aspectRatioParsed = parseAspectRatio(aspectRatio);
  if (aspectRatioParsed) {
    const [sizeValue, sizeUnit] = parseSize(size);
    if (sizeValue) {
      if (aspectRatioParsed >= 1) {
        height = sizeValue / aspectRatioParsed + sizeUnit;
      } else {
        width = sizeValue * aspectRatioParsed + sizeUnit;
      }
    }
  }

  return (
    <Icon className={className} style={style}>
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width={width}
        height={height}
        preserveAspectRatio={aspectRatioParsed ? "none" : undefined}
        fill={color}
        {...rest}
      >
        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
      </svg>
    </Icon>
  );
});

function parseSize(size: string | number | undefined): [number | undefined, string] {
  if (typeof size === "number") {
    return [size, ""];
  }

  if (typeof size === "string") {
    const match = size.match(/^([0-9]+)(.*)$/);
    if (match) {
      return [parseInt(match[1], 10), match[2]];
    }
  }

  return [undefined, ""];
}

function parseAspectRatio(aspectRatio: IconSquareProps["aspectRatio"]): number | undefined {
  if (typeof aspectRatio === "string") {
    const match = aspectRatio.match(/^([1-9][0-9]*):([1-9][0-9]*)$/);
    if (!match) {
      return undefined;
    }

    aspectRatio = parseInt(match[1], 10) / parseInt(match[2], 10);
  }

  if (typeof aspectRatio !== "number") {
    return undefined;
  }

  if (isNaN(aspectRatio) || !isFinite(aspectRatio) || aspectRatio <= 0 || aspectRatio === 1) {
    return undefined;
  }

  return aspectRatio;
}
