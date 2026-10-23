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

  const [selectOptions, setSelectOptions] = useState<VaultCredentialSelectDto[]>([]);

  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Skip fetching until the field is enabled (a tool is selected) so credentials
    // are not requested for an unknown provider.
    if (disabled) {
      setSelectOptions([]);
      setLoading(false);
      return;
    }

    // Set loading state
    setLoading(true);

    // Fetch credential list. Note: Every credential-field should have name ending with 'Credential'
    getVaultCredentialSelectOptions(
      name.includes("credential_name") ? modelProvider : name.replace("__CredentialName__", ""),
    )
      .then((data) => {
        setSelectOptions(data?.data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch models", err);
        setSelectOptions([]);
        setLoading(false);
      });
  }, [modelProvider, name, disabled]);

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
                          {item.label}
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
