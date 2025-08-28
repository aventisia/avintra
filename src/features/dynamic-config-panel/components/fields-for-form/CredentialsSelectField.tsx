import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { getCredSelectOptions } from "../../apis/app-secret-apis.ts";
import { CredSelectDto } from "../../dtos/cred-select-dto.ts.ts";

interface CredentialsSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom select form field component to select credentials form app secret api
 */
const CredentialsSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: CredentialsSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const [selectOptions, setSelectOptions] = useState<CredSelectDto[]>([]);

  const [, setLoading] = useState<boolean>(true);

  function getQueryForVaultKey(vaultKey: string): string {
    const serviceMap: Record<string, string> = {
      OpenAiServiceVaultId: "OpenAiApi",
      SendGridServiceVaultId: "SendGridApi",
      TwilioServiceVaultId: "TwilioApi",
    };

    return serviceMap[vaultKey] || "";
  }

  useEffect(() => {
    getCredSelectOptions(getQueryForVaultKey(name))
      .then((data) => {
        setSelectOptions(data?.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch models", err);
        setLoading(false);
      });
  }, [name]);

  return (
    <>
      <FormField
        {...{ name, control }}
        render={({ field }) => (
          <FormItem {...{ size }}>
            {label && (
              <FormLabelExt
                {...{ size, label, disabled, isRequired, description }}
              ></FormLabelExt>
            )}
            <FormControl>
              <div className="flex flex-col gap-2">
                <Select
                  disabled={disabled}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger
                    size={size}
                    {...field}
                    ref={field.ref}
                    {...props}
                  >
                    <SelectValue placeholder={placeholder ?? "Select"} />
                  </SelectTrigger>

                  <SelectContent>
                    {selectOptions.map((item) => (
                      <SelectItem
                        size={size}
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 💡 Show LLM as badge when available */}
                {/* {selectedOption?.llm && (
                <div className="mt-1 ml-1">
                  <Badge variant="default">{selectedOption.llm}</Badge>
                </div>
              )}*/}
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
