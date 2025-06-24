import React from "react";
import "./Button.css";

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";

    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;

    return (
      <Comp
        ref={ref}
        className={`btn-base ${variantClass} ${sizeClass} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
