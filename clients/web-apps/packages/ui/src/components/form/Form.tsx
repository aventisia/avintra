import React, { useEffect, useRef } from "react";
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form";
import { useBlocker, useNavigate } from "react-router-dom";

import { useShowAlertHandler } from "@/ui/hooks";
import { cn } from "@/ui/lib";

interface FormProps<T extends FieldValues> extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form methods from react-hook-form */
  methods: UseFormReturn<T>;

  /** If true, it will disable all form fields */
  disabled?: boolean;

  /** If true, it will check for dirty form and prevent leaving the page */
  checkDirtyForm?: boolean;
}

/** Extended version of FormProvider, form, fieldset. It supports:
 * - Reset the form when unmounting
 * - "beforeunload" event listener to prevent leaving the page when the form is dirty
 * - Prevent changing the route when the form is dirty
 * - Can disable all form fields using <fieldset> element (Opens form in read mode)
 */
const Form = <T extends FieldValues>({
  methods,
  disabled = false,
  checkDirtyForm = true,
  className,
  children,
  onSubmit,
}: FormProps<T>) => {
  // Get form state
  const { formState } = methods;

  // Set blocking state
  const isBlockingRef = useRef(checkDirtyForm);

  // Get navigate function
  const navigate = useNavigate();

  // Get discard unsaved changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // ----------------Add beforeunload event listener
  useEffect(() => {
    // Handle beforeunload event
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formState.isDirty && checkDirtyForm) event.preventDefault();
    };

    // Add event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [checkDirtyForm, formState.isDirty]);

  // ----------------Check for route changes
  useBlocker(({ currentLocation, nextLocation }) => {
    // If form is dirty, show alert dialog
    if (
      isBlockingRef.current &&
      formState.isDirty &&
      currentLocation.pathname !== nextLocation.pathname
    ) {
      showDefaultAlertDialog({
        confirmActionFn: () => {
          isBlockingRef.current = false;
          navigate(nextLocation.pathname);
        },
        alertType: "unsaved",
      });
      // Block navigation
      return true;
    }
    // Allow navigation
    return false;
  });

  // ----------------Reset form when unmounting
  useEffect(() => {
    return () => {
      methods.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------Return the form
  return (
    <FormProvider {...methods}>
      <form className="w-full" onSubmit={onSubmit}>
        <fieldset disabled={disabled} className={cn("w-full space-y-3.5", className)}>
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
};

Form.displayName = "Form";

export { Form };
