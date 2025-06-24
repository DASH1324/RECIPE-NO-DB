import React from "react";
import "./Badge.css";

function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = `badge-${variant}`;
  return (
    <div className={`badge-base ${variantClass} ${className}`} {...props} />
  );
}

export { Badge };
