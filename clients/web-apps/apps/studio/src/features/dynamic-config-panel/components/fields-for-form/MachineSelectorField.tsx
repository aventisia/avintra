import { AsyncSingleSelectField, BaseFieldProps } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useController, useFormContext, useWatch } from "react-hook-form";

import { searchMachines } from "../../apis/search-machines.apis";
import { MachineSearchQueryFilters } from "../../types/machine-search-filters.type";

interface MachineSelectorFieldProps extends BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The form field holding the selected flow version the machine search is scoped to. */
  dependsOn?: string;

  /** The placeholder for the select field. */
  placeholder?: string;

  /** If true, the field is disabled and cannot be interacted with. */
  disabled?: boolean;
}

const DEFAULT_DEPENDS_ON = "TargetFlowVersionId";

const MachineSelectorField = ({
  name,
  label,
  description,
  placeholder,
  dependsOn,
  disabled,
}: MachineSelectorFieldProps) => {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ control, name });
  const watchedFlowVersionId = useWatch({
    control,
    name: (dependsOn ?? DEFAULT_DEPENDS_ON) as FieldPath<FieldValues>,
  });
  const flowVersionId = (watchedFlowVersionId as string | undefined) || null;
  const machineName = (field.value as string | undefined) ?? "";

  const filters: MachineSearchQueryFilters = { flowVersionId };

  const fetchMachines = (query: string, queryFilters: MachineSearchQueryFilters) => {
    if (!query.trim() && !queryFilters.flowVersionId) return Promise.resolve<ISelectOption[]>([]);

    return searchMachines(query, queryFilters).then((response) => response.data ?? []);
  };

  const selectedMachine: ISelectOption | null = machineName
    ? { label: machineName, value: machineName }
    : null;

  return (
    <AsyncSingleSelectField<ISelectOption, MachineSearchQueryFilters>
      name={name}
      label={label}
      description={description}
      placeholder={placeholder ?? "Search machine..."}
      queryKeyBase={["machine-select", "search"]}
      fetcher={fetchMachines}
      filters={filters}
      minChars={flowVersionId ? 0 : 1}
      selectedItem={selectedMachine}
      // IMPORTANT NOTE: the search returns the machine Id as the option value, while this field
      // stores the machine name that the job contract expects, so only the label is written back.
      onSelect={(item) => field.onChange(item?.label ?? "")}
      getItemId={(item) => item.value}
      getItemLabel={(item) => item.label}
      renderItem={(item) => (
        <span className="flex w-full items-center justify-between gap-2 truncate">
          <span className="truncate">{item.label}</span>
          <span className="text-muted-foreground">{item.description ?? "Offline"}</span>
        </span>
      )}
      disabled={disabled}
    />
  );
};

MachineSelectorField.displayName = "MachineSelectorField";

export { MachineSelectorField };
