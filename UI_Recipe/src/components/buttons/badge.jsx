import * as React from "react";
import clsx from "clsx"; // Import clsx correctly
import "./Badge.css"; // Import the CSS file

const Badge = ({ className, variant = "default", ...props }) => {
  return (
    <div className={clsx("badge", `badge-${variant}`, className)} {...props} />
  );
};

export { Badge };
