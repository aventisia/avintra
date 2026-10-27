import { FormLabel } from "@/ui/components/form";
import { type FormFieldSizeType } from "@/ui/types";

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
  return (
    <div className="flex items-center gap-0.5">
      <FormLabel size={size} className="ml-1 flex items-center gap-0.5">
        <span>{label}</span>
        {isRequired && !disabled ? <span className="text-bad">*</span> : null}
      </FormLabel>
      {typeof description === "string" && description.length > 0 ? (
        <FieldHelpPopover content={description} />
      ) : null}
    </div>
  );
};
