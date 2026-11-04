import { SwitchField } from "@avplatform/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { unlockAccountProps } from "../../constants/user-form-field-props.constant";
import { userZodSchema } from "../../constants/user-zod-schema";
import { isAccountLocked } from "../../utils/account-status.util";

interface UnlockAccountFieldProps {
  form: UseFormReturn<z.infer<typeof userZodSchema>>;
}

/**
 * Renders the Switch field which allows the user-manager to unlock the account
 * of a user if the account is locked.
 */
export const UnlockAccountField = ({ form }: UnlockAccountFieldProps) => {
  return isAccountLocked(form.getValues("lockoutEnd")) ? (
    <SwitchField {...unlockAccountProps} />
  ) : null;
};
