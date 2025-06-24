import React from "react";
import "./Box.css";

const Box = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`box ${className}`} {...props} />
));
Box.displayName = "Box";

const BoxHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`box-header ${className}`} {...props} />
));
BoxHeader.displayName = "BoxHeader";

const BoxTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h3 ref={ref} className={`box-title ${className}`} {...props} />
));
BoxTitle.displayName = "BoxTitle";

const BoxDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`box-description ${className}`} {...props} />
));
BoxDescription.displayName = "BoxDescription";

const BoxContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`box-content ${className}`} {...props} />
));
BoxContent.displayName = "BoxContent";

const BoxFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`box-footer ${className}`} {...props} />
));
BoxFooter.displayName = "BoxFooter";

export { Box, BoxHeader, BoxTitle, BoxDescription, BoxContent, BoxFooter };
