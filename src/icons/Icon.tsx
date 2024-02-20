import React from "react";

export function Icon({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <i className={className} style={style}>
      {children}
    </i>
  );
}
