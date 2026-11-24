import { useRef } from "react";

/** Lets a menu item open an inline name input without the closing menu taking focus back to its trigger. */
export const useInlineEditFocusGuard = () => {
  const isEditingRef = useRef(false);

  return {
    markEditing: () => {
      isEditingRef.current = true;
    },
    onCloseAutoFocus: (event: Event) => {
      // IMPORTANT NOTE: Radix focuses the menu trigger after the exit animation, which would blur the just-opened input and end the edit.
      if (isEditingRef.current) event.preventDefault();
      isEditingRef.current = false;
    },
  };
};
