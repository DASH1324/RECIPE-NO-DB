import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import PropTypes from "prop-types";
import clsx from "clsx"; // Ensure you install clsx using npm install clsx
import "./input.css"; // Import your CSS file

const Input = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "input"; // Changed default to "input" instead of "button"
  return <Comp className={clsx("input", className)} ref={ref} {...props} />;
});

Input.propTypes = {
  className: PropTypes.string,
  asChild: PropTypes.bool,
};

Input.displayName = "Input";

export { Input };
