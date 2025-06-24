import * as React from "react";
import clsx from "clsx";
import "./button.css";

const buttonVariants = {
  default: "button-default",
  destructive: "button-destructive",
  outline: "button-outline",
  secondary: "button-secondary",
  ghost: "button-ghost",
  link: "button-link",
};

const buttonSizes = {
  default: "button-size-default",
  sm: "button-size-sm",
  lg: "button-size-lg",
  icon: "button-size-icon",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={clsx(
        "button-base",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}
