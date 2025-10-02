"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type DockProps = React.HTMLAttributes<HTMLDivElement>;

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 rounded-3xl border border-white/40 bg-white/15 p-3 shadow-[0_25px_50px_-12px_rgba(30,41,59,0.35)]",
          "backdrop-blur-3xl backdrop-saturate-150",
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/60 before:to-white/10 before:opacity-60",
          "after:absolute after:-inset-3 after:-z-20 after:rounded-[inherit] after:bg-gradient-to-br after:from-white/20 after:to-transparent after:opacity-40",
          "relative",
          className
        )}
        {...props}
      />
    );
  }
);

Dock.displayName = "Dock";

export interface DockItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DockItem = React.forwardRef<HTMLElement, DockItemProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as React.Ref<any>}
        className={cn(
          "group relative flex size-16 items-center justify-center overflow-visible rounded-2xl border border-white/50",
          "bg-white/30/60 text-neutral-700 shadow-lg backdrop-blur-3xl backdrop-saturate-150",
          "hover:scale-[1.12] focus-visible:ring-2 focus-visible:ring-white/70",
          "transition-all duration-300 ease-out",
          className
        )}
        {...(asChild
          ? props
          : ({ type: "button", ...props } as React.ButtonHTMLAttributes<HTMLButtonElement>))}
      >
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/80 to-white/30 opacity-70 mix-blend-screen" />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-70" />
        {children}
      </Comp>
    );
  }
);

DockItem.displayName = "DockItem";

export const DockIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "pointer-events-none flex size-8 items-center justify-center text-neutral-700 drop-shadow-[0_8px_16px_rgba(30,41,59,0.25)]",
      className
    )}
    {...props}
  />
));

DockIcon.displayName = "DockIcon";

export const DockLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100",
      className
    )}
    {...props}
  />
));

DockLabel.displayName = "DockLabel";

