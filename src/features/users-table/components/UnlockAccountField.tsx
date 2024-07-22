import { unlockAccountProps, userZodSchema } from "@/features/users-table";
import { SwitchField } from "@/react-toolkit/components/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { CrudActionType } from "@/react-toolkit/types";

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
