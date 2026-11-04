import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { ManualToolOperation } from "../../dtos";
import { getHttpMethodBadgeClass } from "../../utils/http-method-badge.util";
import { MethodForm } from "./method-form/MethodForm";

type ManualMethodsEditorProps = {
  operations: ManualToolOperation[];
  onChange: (operations: ManualToolOperation[]) => void;
  disabled?: boolean;
};

/**
 * Editor for manually authored tool methods, listing each method as a compact row.
 */
export const ManualMethodsEditor = ({
  operations,
  onChange,
  disabled,
}: ManualMethodsEditorProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openFormForCreate = () => {
    setEditIndex(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (index: number) => {
    if (isFormOpen && editIndex === index) {
      closeForm();
      return;
    }
    setEditIndex(index);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditIndex(null);
  };

  const handleSubmit = (operation: ManualToolOperation) => {
    if (editIndex === null) {
      onChange([...operations, operation]);
    } else {
      onChange(
        operations.map((operation_, index) => (index === editIndex ? operation : operation_)),
      );
    }
    closeForm();
  };

  const isCreateFormOpen = isFormOpen && editIndex === null;

  return (
    <div className="space-y-2">
      {operations.length === 0 ? (
        <p className="rounded-md border border-dashed border-line px-3.5 py-5 text-center text-[13px] text-muted-foreground">
          No methods yet. Add the first request this tool can make.
        </p>
      ) : (
        <div className="space-y-2">
          {operations.map((operation, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-3 rounded-md bg-sunken/80 px-3 py-2.5 ring-1 ring-line">
                <span
                  className={`w-14 shrink-0 rounded-sm py-0.5 text-center text-[10.5px] font-semibold uppercase ${getHttpMethodBadgeClass(operation.method)}`}
                >
                  {operation.method}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{operation.name}</p>
                  <p className="truncate font-mono text-[11.5px] text-muted-foreground">
                    {operation.endpoint}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => openFormForEdit(index)}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                    aria-label={`Edit ${operation.name}`}
                  >
                    <PencilSimpleIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(operations.filter((_, i) => i !== index));
                      if (editIndex === index) {
                        closeForm();
                      } else if (editIndex !== null && editIndex > index) {
                        setEditIndex(editIndex - 1);
                      }
                    }}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                    aria-label={`Remove ${operation.name}`}
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </div>
              </div>
              {isFormOpen && editIndex === index && (
                <MethodForm
                  initialOperation={operation}
                  existingNames={operations
                    .filter((_, operationIndex) => operationIndex !== index)
                    .map((operation) => operation.name)}
                  onSubmit={handleSubmit}
                  onCancel={closeForm}
                  submitLabel="Save method"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <button
          type="button"
          onClick={() => (isCreateFormOpen ? closeForm() : openFormForCreate())}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong text-[13px] font-medium text-ink-2 outline-none transition hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
        >
          <PlusIcon className="size-4" />
          Add method
        </button>
      )}

      {isCreateFormOpen && (
        <MethodForm
          existingNames={operations.map((operation) => operation.name)}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitLabel="Add method"
        />
      )}
    </div>
  );
};
