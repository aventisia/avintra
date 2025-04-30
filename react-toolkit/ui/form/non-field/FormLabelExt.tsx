import { FormFieldSizeType } from "@/react-toolkit/types/form-field-size-type";
import { Tooltip } from "@/react-toolkit/ui/Tooltip";
import { FormLabel } from "@/react-toolkit/ui/form/FormLabel";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
        {isRequired && !disabled ? (
          <span className="text-destructive">*</span>
        ) : null}
      </FormLabel>
      {description ? (
        <Tooltip content={description}>
          <div className="rounded hover:bg-slate-100 hover:text-primary">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
};
