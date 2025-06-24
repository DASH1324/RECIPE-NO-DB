import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import PropTypes from "prop-types";
import clsx from "clsx"; // Ensure clsx is installed using npm install clsx
import "./entry.css"; // Ensure you have the corresponding CSS file

const Entry = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={clsx("entry", className)} ref={ref} {...props} />;
});

Entry.propTypes = {
  className: PropTypes.string,
  asChild: PropTypes.bool,
};

Entry.displayName = "Entry";

export { Entry };
