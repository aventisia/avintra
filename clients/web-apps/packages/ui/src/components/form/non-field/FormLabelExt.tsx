import { useIsInsideCrudDialog } from "@/ui/components/crud-dialog/CrudDialogContext";
import { FormLabel } from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

import { crudDialogFieldClasses } from "../crud-dialog-field-classes";
import { FieldHelpPopover } from "./FieldHelpPopover";

interface FormLabelExtProps {
  size?: FormFieldSizeType;
  label?: string;
  disabled?: boolean;
  isRequired?: boolean;
  description?: string;
}

export const FormLabelExt = ({
  size = "base",
  label,
  isRequired,
  description,
  disabled,
}: FormLabelExtProps) => {
  const isInDialog = useIsInsideCrudDialog() && size === "base";

  return (
    <div className="flex items-center gap-0.5">
      <FormLabel
        size={size}
        className={cn("ml-1 flex items-center gap-0.5", isInDialog && crudDialogFieldClasses.label)}
      >
        <span>{label}</span>
        {isRequired && !disabled ? <span className="text-bad">*</span> : null}
      </FormLabel>
      {typeof description === "string" && description.length > 0 ? (
        <FieldHelpPopover content={description} />
      ) : null}
    </div>
  );
};
