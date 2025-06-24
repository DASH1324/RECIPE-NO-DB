import React from "react";
import { Slot } from "@radix-ui/react-slot";
import "./Click.css";

const clickVariants = {
  default: "click-default",
  destructive: "click-destructive",
  outline: "click-outline",
  secondary: "click-secondary",
  ghost: "click-ghost",
  link: "click-link",
};

const clickSizes = {
  default: "click-size-default",
  sm: "click-size-sm",
  lg: "click-size-lg",
  icon: "click-size-icon",
};

const Click = React.forwardRef(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variantClass = clickVariants[variant] || clickVariants.default;
    const sizeClass = clickSizes[size] || clickSizes.default;
    const combinedClassName = `click ${variantClass} ${sizeClass} ${className}`;

    return <Comp className={combinedClassName} ref={ref} {...props} />;
  }
);

Click.displayName = "Click";

export { Click };
