import React from "react";
import "./Enter.css";

const Enter = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`enter ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Enter.displayName = "Enter";

export { Enter };
