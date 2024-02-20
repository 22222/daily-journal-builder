import React from "react";

export function OptionalText({ children }: { children: React.ReactNode }) {
  return <span className="text d-none d-md-inline">{children}</span>;
}
