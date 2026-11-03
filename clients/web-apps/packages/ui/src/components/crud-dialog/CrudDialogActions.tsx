import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { SubmitTargetFormIdProvider, useFormId } from "@/ui/components/form/FormIdContext";

import { useCrudDialogChrome } from "./CrudDialogContext";

/**
 * Places a form's submit actions in the CRUD dialog footer, or right-aligned under the form
 * outside one. Submit `Button`s and `SubmitButton`s inside keep targeting the enclosing form.
 */
export const CrudDialogActions = ({ children }: { children: ReactNode }) => {
  const actionsSlot = useCrudDialogChrome()?.actionsSlot;
  const formId = useFormId();

  if (actionsSlot) {
    return createPortal(
      <SubmitTargetFormIdProvider value={formId}>{children}</SubmitTargetFormIdProvider>,
      actionsSlot,
    );
  }

  return <div className="!mt-5 flex w-full justify-end gap-2">{children}</div>;
};
