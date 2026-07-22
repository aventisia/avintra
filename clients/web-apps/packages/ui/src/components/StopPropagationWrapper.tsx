import { type KeyboardEventHandler, type MouseEventHandler } from "react";

/**
 * A wrapper component that stops event propagation for mouse and keyboard events.
 */
export const StopPropagationWrapper = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  /** Stop propagation for all mouse events */
  const stopMouseEvent: MouseEventHandler = (event) => {
    event.stopPropagation();
  };

  /** Stop propagation for all keyboard events */
  const stopKeyboardEvent: KeyboardEventHandler = (event) => {
    event.stopPropagation();
  };

  return (
    <div onClick={stopMouseEvent} onKeyDown={stopKeyboardEvent} {...props}>
      {children}
    </div>
  );
};
