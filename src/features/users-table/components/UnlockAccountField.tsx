import { SwitchField } from "@/react-toolkit/components/form";
import { FormField } from "@/react-toolkit/components/ui";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { userZodSchema } from "../sample-index";
import { CrudActionType } from "@/react-toolkit/types";

interface UnlockAccountFieldProps {
  crudAction: CrudActionType;
  form: UseFormReturn<z.infer<typeof userZodSchema>>;
}

/**
 * Renders the Switch field which allows the user-manager to unlock the account
 * of a user if the account is locked.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.crudAction - The CRUD action.
 * @param {Object} props.form - The form object.
 * @returns {JSX.Element} The UnlockAccountField component.
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
        <FormField
          name="unlockAccount"
          control={form.control}
          render={({ field }) => (
            <SwitchField
              field={field}
              fieldData={{
                label: "Unlock Account",
                description:
                  "Unlocking the account will allow the user to log in again. Use caution if the account was locked due to security concerns",
                disabled: crudAction === "read",
              }}
            />
          )}
        />
      )}
    </>
  );
};
