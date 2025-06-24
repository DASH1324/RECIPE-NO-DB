import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Example usage inside a React component
const ExampleComponent = ({ className }) => {
  return <div className={cn("bg-blue-500 text-white p-4", className)}>Hello World</div>;
};

export default ExampleComponent;
