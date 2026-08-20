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

import { getCredSelectOptions } from "../../apis/app-secret-apis.ts";
import { CredSelectDto } from "../../dtos/cred-select-dto.ts.ts";

interface CredentialsSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;

  modelProvider?: string;
}

/**
 * A custom select form field component to select credential_id form app secret api
 */
const CredentialsSelectField = ({
  name,
  label,
  size = "sm",
  isRequired,
  description,
  disabled,
  placeholder,
  modelProvider,
  ...props
}: CredentialsSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const [selectOptions, setSelectOptions] = useState<CredSelectDto[]>([]);

  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    // Fetch credential list. Prefer explicit modelProvider prop; fall back to name-based parsing.
    getCredSelectOptions(modelProvider ?? name.replace("__CredentialName__", ""))
      .then((data) => {
        setSelectOptions(data?.data);
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

CredentialsSelectField.displayName = "CredentialsSelectField";

export { CredentialsSelectField, type CredentialsSelectFieldProps };
