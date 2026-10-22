import { AsyncSingleSelectField, BaseFieldProps } from "@avplatform/ui/form";
import { useState } from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { searchAgentFlowVersions } from "@/apis/search-flow-versions-api";
import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSelectedFlowVersion } from "../../hooks/useSelectedFlowVersion.hook";

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
  const { field } = useController({ control, name });
  const value = field.value as string | undefined;
  const selectedFlowVersion = useSelectedFlowVersion(value);
  const currentFlowVersionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const currentFlowId = useCurrentFlowStore((state) => state.currentFlow.id);
  const [pickedFlow, setPickedFlow] = useState<SearchFlowVersionResDto | null>(null);

  const selectedFlow = value
    ? (selectedFlowVersion ??
      (pickedFlow?.id === value ? pickedFlow : { id: value, flowId: "", name: "" }))
    : null;

  return (
    <AsyncSingleSelectField<SearchFlowVersionResDto>
      name={name}
      size="sm"
      label={label}
      description={description}
      placeholder={placeholder ?? "Search agent"}
      queryKeyBase={["flow-select-versions", "search"]}
      fetcher={(query) =>
        searchAgentFlowVersions(query).then((flows) =>
          flows.filter((flow) => flow.id !== currentFlowVersionId && flow.flowId !== currentFlowId),
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
  );
};

FlowSelectorField.displayName = "FlowSelectorField";

export { FlowSelectorField };
