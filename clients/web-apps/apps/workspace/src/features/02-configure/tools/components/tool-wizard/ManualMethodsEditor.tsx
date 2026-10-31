import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { ManualToolOperation } from "../../dtos";
import { MethodForm } from "./method-form/MethodForm";

const methodBadgeClass = (method: string): string => {
  switch (method) {
    case "GET":
      return "bg-ok/10 text-ok";
    case "POST":
      return "bg-selected text-primary-text";
    case "PUT":
      return "bg-warn/10 text-warn";
    case "PATCH":
      return "bg-selected text-primary-text";
    case "DELETE":
      return "bg-bad/10 text-bad";
    default:
      return "bg-primary/10 text-primary";
  }
};

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
    <div className="space-y-3">
      {operations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No methods added yet. Add at least one method — a request this tool can make.
        </p>
      ) : (
        <div className="space-y-2">
          {operations.map((operation, index) => (
            <div key={index} className="space-y-2">
              <div className="rounded border bg-muted/30 p-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${methodBadgeClass(operation.method)}`}
                  >
                    {operation.method}
                  </span>
                  <span className="truncate text-sm font-semibold">{operation.name}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => openFormForEdit(index)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label={`Edit ${operation.name}`}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
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
                      className="rounded p-1 text-muted-foreground hover:bg-bad/10 hover:text-bad disabled:opacity-50"
                      aria-label={`Remove ${operation.name}`}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {operation.endpoint}
                </p>
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
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <PlusIcon className="h-4 w-4" />
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
