import { SelectField } from "@avplatform/ui/form";
import { Controller, FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";

import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";

interface MemoryConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const MemoryConfigField = ({ name }: MemoryConfigFieldProps) => {
  // Set names for the fields
  const memoryProviderFieldName = `${name}.memoryProvider` as FieldPath<FieldValues>;
  const maxDataStoredFieldName = `${name}.maxDataStored` as FieldPath<FieldValues>;

  // Get the form context
  const { control } = useFormContext();

  const { field: maxDataStoredField } = useController({
    name: maxDataStoredFieldName,
    control,
  });

  // Render the MemoryConfigField component
  return (
    <GroupedFieldsWrapper groupName="Configure Memory">
      <div className="hidden">
        <SelectField
          size="sm"
          name={memoryProviderFieldName}
          selectOptions={[
            {
              label: "Memory Provider 1",
              value: "Memory Provider 1",
              description: "",
            },
            {
              label: "Memory Provider 2",
              value: "Memory Provider 2",
              description: "",
            },
          ]}
          label="Memory Provider"
        />
      </div>

      <Controller
        {...maxDataStoredField}
        render={({ field }) => (
          <SliderField
            label="Max. messages stored as Short-term Memory"
            name={field.name}
            trackColor="bg-muted"
            min={0}
            max={10}
            step={0.1}
            className="resize-none text-sm"
          />
        )}
      />
    </GroupedFieldsWrapper>
  );
};

MemoryConfigField.displayName = "MemoryConfigField";

export { MemoryConfigField, type MemoryConfigFieldProps };
