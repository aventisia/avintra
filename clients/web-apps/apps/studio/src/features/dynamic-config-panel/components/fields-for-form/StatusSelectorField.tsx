import { BaseFieldProps } from "@avplatform/ui/form";
import { SelectField } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store.ts";

import { getQueuesByAgent } from "../../apis/queues-apis.ts";
import { QueuesTableDto } from "../../dtos/queues-table-dto.ts";

interface StatusSelectorFieldProps extends BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The name of the queue-select field that determines which queue's statuses to show. */
  queueFieldName?: string;

  /** The size of the select field. */
  size?: "sm" | "base" | "lg";

  /** Whether the field is disabled. */
  disabled?: boolean;
}

/**
 * The core system statuses that are always available on every queue.
 */
const CORE_STATUSES: ISelectOption[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In progress" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
];

/**
 * A select field that populates its options from the statuses of the queue selected
 * in the associated queue-select field. It always includes the core system statuses
 * (Pending, InProgress, Completed, Failed) plus any custom statuses defined on the
 * selected queue.
 */
const StatusSelectorField = ({
  name,
  queueFieldName = "QueueName",
  ...props
}: StatusSelectorFieldProps) => {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { data } = useQuery({
    queryKey: ["agent-queues", currentFlow.versionId],
    queryFn: () => getQueuesByAgent(currentFlow.versionId),
    select: (response) => response?.data,
    enabled: Boolean(currentFlow.versionId),
  });

  // Form context
  const { watch } = useFormContext();

  // The currently selected queue name
  const selectedQueueName = watch(queueFieldName);

  // Find the selected queue and build its status options
  const statusOptions = (() => {
    const queue: QueuesTableDto | undefined = (data ?? []).find(
      (q) => q.name === selectedQueueName || q.id === selectedQueueName,
    );

    const customOptions: ISelectOption[] = (queue?.statuses ?? []).map((s) => ({
      value: s.name,
      label: s.label || s.name,
    }));

    return [...CORE_STATUSES, ...customOptions];
  })();

  return <SelectField name={name} {...props} selectOptions={statusOptions} size="sm" />;
};

StatusSelectorField.displayName = "StatusSelectorField";

export { StatusSelectorField };
