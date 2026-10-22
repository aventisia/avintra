import { AsyncSingleSelect } from "@avplatform/ui/async-select";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { useState } from "react";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { searchFlows, useSelectedFlowVersion } from "../../hooks/useSelectedFlowVersion.hook";

interface FlowSelectorFieldProps extends BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;

  /** If true, the field is disabled and cannot be interacted with. */
  disabled?: boolean;
}

const getFlowLabel = (flow: SearchFlowVersionResDto) =>
  flow.name ? `${flow.name} - v${flow.versionNumber ?? "-"}` : flow.id;

const FlowSelectorField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
}: FlowSelectorFieldProps) => {
  const { control } = useFormContext<FieldValues>();
  const value = useWatch({ control, name }) as string | undefined;
  const selectedFlowVersion = useSelectedFlowVersion(value);
  const currentFlowVersionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const [pickedFlow, setPickedFlow] = useState<SearchFlowVersionResDto | null>(null);

  const selectedFlow = value
    ? (selectedFlowVersion ??
      (pickedFlow?.id === value ? pickedFlow : { id: value, flowId: "", name: "" }))
    : null;

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size="sm">
          <FormLabelExt size="sm" label={label} description={description} disabled={disabled} />

          <FormControl>
            <AsyncSingleSelect<SearchFlowVersionResDto>
              size="sm"
              placeholder={placeholder ?? "Search agent"}
              queryKeyBase={["flow-select-versions", "search"]}
              fetcher={(query) =>
                searchFlows(query).then((flows) =>
                  flows.filter((flow) => flow.id !== currentFlowVersionId),
                )
              }
              filters={undefined}
              selectedItem={selectedFlow}
              onSelect={(flow) => {
                setPickedFlow(flow);
                field.onChange(flow?.id ?? "");
              }}
              getItemId={(flow) => flow.id}
              getItemLabel={getFlowLabel}
              disabled={disabled}
            />
          </FormControl>

          <FormMessage size="sm" />
        </FormItem>
      )}
    />
  );
};

FlowSelectorField.displayName = "FlowSelectorField";

export { FlowSelectorField };
