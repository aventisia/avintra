import { LoadingSpinner } from "@avplatform/ui";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  SelectFieldProps,
} from "@avplatform/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { FieldValues, useFormContext } from "react-hook-form";

interface ModelSelectFieldProps extends SelectFieldProps, BaseFieldProps {
  isLoading?: boolean;
}

/**
 * A custom select form field component to select models form app secret api
 */
const ModelSelectField = ({
  name,
  label,
  size = "sm",
  isRequired,
  description,
  disabled,
  selectOptions,
  isLoading,
  ...props
}: ModelSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

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
                    <SelectValue
                      className="placeholder:text-muted-foreground"
                      placeholder={"Select model"}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {selectOptions.length === 0 ? (
                      <div className="flex h-20 items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                        {isLoading ? (
                          <>
                            <LoadingSpinner className="size-3.5 text-primary" />
                            Fetching models...
                          </>
                        ) : (
                          "No models found"
                        )}
                      </div>
                    ) : (
                      selectOptions.map((item) => (
                        <SelectItem
                          size={size}
                          key={item.value}
                          value={item.value}
                        >
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

ModelSelectField.displayName = "ModelSelectField";

export { ModelSelectField, type ModelSelectFieldProps };
