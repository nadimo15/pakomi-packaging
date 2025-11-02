import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const tooltipId = React.useId ? React.useId() : `tooltip-${Math.random().toString(36).substring(2)}`;
  
  // FIX: Fix for line 15: The generic argument for `React.isValidElement` was incorrect, causing a type error.
  // Using `React.AriaAttributes` correctly types the child's props to include ARIA attributes,
  // resolving the overload error for `React.cloneElement`.
  const triggerElement = React.isValidElement<React.AriaAttributes>(children) ?
    React.cloneElement(children, { 'aria-describedby': tooltipId }) :
    children;

  return (
    <div className="relative flex items-center group">
      {triggerElement}
      <div 
        id={tooltipId}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                   transform scale-95 group-hover:scale-100 origin-bottom z-10"
        role="tooltip"
      >
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800" aria-hidden="true"></div>
      </div>
    </div>
  );
};

export default Tooltip;
