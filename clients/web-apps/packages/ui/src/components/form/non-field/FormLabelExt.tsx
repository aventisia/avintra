import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { FormLabel } from "@/ui/components/form";
import { Tooltip } from "@/ui/components/tooltip";
import { type FormFieldSizeType } from "@/ui/types";

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
        {isRequired && !disabled ? <span className="text-destructive">*</span> : null}
      </FormLabel>
      {typeof description === "string" && description.length > 0 ? (
        <Tooltip content={description}>
          <div className="rounded hover:bg-slate-100 hover:text-primary">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
};
