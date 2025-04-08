import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { CrudActionType } from "@/react-toolkit/types/literal-types";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";

import { unlockAccountProps } from "../../constants/role-form-field-props";
import { roleZodSchema } from "../../constants/role-zod-schema";

interface UnlockAccountFieldProps {
  crudAction: CrudActionType;
  form: UseFormReturn<z.infer<typeof roleZodSchema>>;
}

/**
 * Renders the Switch field which allows the role-manager to unlock the account
 * of a role if the account is locked.
 */
export const UnlockAccountField = ({
  crudAction,
  form,
}: UnlockAccountFieldProps) => {
  // Show unlock account field if the role is locked
  const showUnlockAccount = () => {
    // Get the lockout end date
    const lockoutEnd = form.getValues("lockoutEnd");

    // Return showUnlockAccount state
    return lockoutEnd ? new Date() < new Date(lockoutEnd) : false;
  };

  return (
    <>
      {showUnlockAccount() && (
        <SwitchField {...unlockAccountProps} disabled={crudAction === "read"} />
      )}
    </>
  );
};
