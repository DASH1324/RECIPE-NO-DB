import React from "react";
import * as BarPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx";
import "./Bar.css";

const Bar = BarPrimitive.Root;

const BarList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <BarPrimitive.List
      ref={ref}
      className={clsx("bar-list", className)}
      {...props}
    />
  )
);
BarList.displayName = BarPrimitive.List.displayName;

const BarTrigger = React.forwardRef(
  ({ className, ...props }, ref) => (
    <BarPrimitive.Trigger
      ref={ref}
      className={clsx("bar-trigger", className)}
      {...props}
    />
  )
);
BarTrigger.displayName = BarPrimitive.Trigger.displayName;

const BarContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <BarPrimitive.Content
      ref={ref}
      className={clsx("bar-content", className)}
      {...props}
    />
  )
);
BarContent.displayName = BarPrimitive.Content.displayName;

export { Bar, BarList, BarTrigger, BarContent };
