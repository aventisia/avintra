import { ISelectOption } from "@aventisia/ui/types";
import { BaseFieldProps } from "@aventisia/ui/form";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { useFetchDataFields } from "../../hooks/useFetchDataFields";

interface ColorPickerFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the select field. */
  selectOptions?: ISelectOption[];

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom select form field component with label (if provided)
 */
const ColorPickerField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: ColorPickerFieldProps) => {
  const { data } = useFetchDataFields();

  const text = data?.data.map((item) => item.color?.toLowerCase());

  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const colors = [
    { name: "Red", value: "red", bg: "bg-red-500" },
    { name: "Blue", value: "blue", bg: "bg-blue-500" },
    { name: "Green", value: "green", bg: "bg-green-500" },
    { name: "Yellow", value: "yellow", bg: "bg-yellow-500" },
    { name: "Purple", value: "purple", bg: "bg-purple-500" },
    { name: "Pink", value: "pink", bg: "bg-pink-500" },
    { name: "Orange", value: "orange", bg: "bg-orange-500" },
    { name: "Teal", value: "teal", bg: "bg-teal-500" },
    { name: "Indigo", value: "indigo", bg: "bg-indigo-500" },
    { name: "Fuchsia", value: "fuchsia", bg: "bg-fuchsia-500" },
    { name: "Cyan", value: "cyan", bg: "bg-cyan-500" },
    { name: "Stone", value: "stone", bg: "bg-stone-500" },
  ];
  // Render the ColorPickerField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && (
            <FormLabelExt
              {...{ size, label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger size={size} {...field} {...props} ref={field.ref}>
                <SelectValue
                  placeholder={placeholder ? "Select" : placeholder}
                />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <div className="grid grid-cols-6 gap-1 p-1">
                    {colors.map((color) => {
                      const isUsedColor = text?.includes(
                        color.name.toLowerCase(),
                      );
                      return (
                        <>
                          <SelectItem
                            disabled={isUsedColor}
                            // showCheck={false}
                            size={size}
                            key={color.value}
                            value={color.value}
                            className={`m-0 flex h-10 items-center justify-center p-0 hover:bg-slate-300 focus:border data-[state=checked]:border ${isUsedColor ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div
                              className={`h-6 w-6 rounded-full ${color.bg} `}
                            >
                              <span className="sr-only">{color.name}</span>
                            </div>
                          </SelectItem>
                        </>
                      );
                    })}
                  </div>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

ColorPickerField.displayName = "ColorPickerField";

export { ColorPickerField, type ColorPickerFieldProps };
