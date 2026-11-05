import { LoadingSpinner } from "@avplatform/ui";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { useEffect, useState } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { getVaultCredentialIconSrc } from "../../../vault-credentials/vault-credential-config/utils/vault-credential-icon.util";
import { getVaultCredentialSelectOptions } from "../../apis/vault-credential-select.apis.ts";
import { VaultCredentialSelectDto } from "../../dtos/vault-credential-select.dto";

interface VaultCredentialSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;

  modelProvider?: string;
}

/**
 * A custom select form field component to select a credential from the vault credential API
 */
const VaultCredentialSelectField = ({
  name,
  label,
  size = "sm",
  isRequired,
  description,
  disabled,
  placeholder,
  modelProvider,
  ...props
}: VaultCredentialSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const [selectOptions, setSelectOptions] = useState<
    (VaultCredentialSelectDto & { icon: string })[]
  >([]);

  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    // Fetch credential list. Prefer explicit modelProvider prop; fall back to name-based parsing.
    const credentialType = modelProvider ?? name.replace("__CredentialName__", "");
    getVaultCredentialSelectOptions(credentialType)
      .then((data) => {
        setSelectOptions(
          (data?.data ?? []).map((option) => ({
            ...option,
            icon: getVaultCredentialIconSrc(credentialType),
          })),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch models", err);
        setLoading(false);
      });
  }, [modelProvider, name]);

  return (
    <>
      <FormField
        {...{ name, control }}
        render={({ field }) => (
          <FormItem {...{ size }}>
            {label && (
              <FormLabelExt {...{ size, label, disabled, isRequired, description }}></FormLabelExt>
            )}
            <FormControl>
              <div className="flex flex-col gap-2">
                <Select
                  disabled={disabled}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger size={size} {...field} ref={field.ref} {...props}>
                    <SelectValue
                      className="placeholder:text-muted-foreground"
                      placeholder={placeholder ?? "Select credential"}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {selectOptions.length === 0 ? (
                      <div className="flex h-20 items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                        {isLoading ? (
                          <>
                            <LoadingSpinner className="size-3.5 text-primary" />
                            Fetching credentials...
                          </>
                        ) : (
                          "No credentials found"
                        )}
                      </div>
                    ) : (
                      selectOptions.map((item) => (
                        <SelectItem size={size} key={item.value} value={item.value}>
                          <span className="flex items-center gap-2">
                            <img src={item.icon} alt="" className="size-4 shrink-0" />
                            {item.label}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage {...{ size }} />
          </FormItem>
        )}
      />
    </>
  );
};

VaultCredentialSelectField.displayName = "VaultCredentialSelectField";

export { VaultCredentialSelectField, type VaultCredentialSelectFieldProps };
