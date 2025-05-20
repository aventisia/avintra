import { SwitchField } from "@aventisia/ui/form";
import { CrudActionType } from "@aventisia/ui/types";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { unlockAccountProps } from "../../constants/user-form-field-props";
import { userZodSchema } from "../../constants/user-zod-schema";

interface UnlockAccountFieldProps {
  crudAction: CrudActionType;
  form: UseFormReturn<z.infer<typeof userZodSchema>>;
}

/**
 * Renders the Switch field which allows the user-manager to unlock the account
 * of a user if the account is locked.
 */
export const UnlockAccountField = ({
  crudAction,
  form,
}: UnlockAccountFieldProps) => {
  // Show unlock account field if the user is locked
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
