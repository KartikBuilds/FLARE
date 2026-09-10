import * as React from "react";
import { cn } from "../lib/cn";

export function Container({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("container-flare", className)} {...props}>
      {children}
    </div>
  );
}
