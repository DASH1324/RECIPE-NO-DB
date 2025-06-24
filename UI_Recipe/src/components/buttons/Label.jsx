import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import "./Label.css";

const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  const combinedClassName = `label ${className}`;

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
