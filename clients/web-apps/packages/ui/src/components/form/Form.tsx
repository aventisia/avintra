import React, { useEffect, useRef } from "react";
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";

import { useIsInsideCrudDialog } from "@/ui/components/data-table/CrudDialogContext";
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

interface DirtyFormBlockerProps {
  isDirty: boolean;
  checkDirtyForm: boolean;
}

/**
 * Registers the generic dirty-form route blocker.
 *
 * Rendered as a sibling of the form only when the form is not inside a
 * URL-driven CRUD dialog. React Router only allows one active blocker at a
 * time, so we must avoid mounting this hook while the dialog's blocker is
 * already registered.
 */
function DirtyFormBlocker({ isDirty, checkDirtyForm }: DirtyFormBlockerProps) {
  const isBlockingRef = useRef(checkDirtyForm);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Re-arm after a confirmed navigation or once the form is clean again, so
  // every dirty navigation prompts instead of only the first one.
  // IMPORTANT NOTE: confirmActionFn below disarms the blocker to let the
  // pending navigation through; without this effect it would stay disarmed.
  useEffect(() => {
    isBlockingRef.current = checkDirtyForm;
  }, [pathname, checkDirtyForm, isDirty]);

  useBlocker(({ currentLocation, nextLocation }) => {
    // If form is dirty, show alert dialog
    if (
      isBlockingRef.current &&
      isDirty &&
      checkDirtyForm &&
      currentLocation.pathname !== nextLocation.pathname
    ) {
      showDefaultAlertDialog({
        confirmActionFn: () => {
          isBlockingRef.current = false;
          navigate(nextLocation.pathname + nextLocation.search + nextLocation.hash);
        },
        alertType: "unsaved",
      });
      // Block navigation
      return true;
    }
    // Allow navigation
    return false;
  });

  return null;
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

  // Detect whether this form is inside a URL-driven CRUD dialog. The dialog
  // already registers its own useBlocker, so we avoid mounting the generic
  // DirtyFormBlocker while inside the dialog.
  const isInsideCrudDialog = useIsInsideCrudDialog();

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
        <fieldset disabled={disabled} className={cn("flex w-full flex-col gap-3.5", className)}>
          {children}
        </fieldset>
      </form>
      {!isInsideCrudDialog && (
        <DirtyFormBlocker isDirty={formState.isDirty} checkDirtyForm={checkDirtyForm} />
      )}
    </FormProvider>
  );
};

Form.displayName = "Form";

export { Form };
