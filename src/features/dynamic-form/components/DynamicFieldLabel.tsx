import { IDynamicFieldSchema } from "..";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { FormLabel } from "@aventisia/ui/form";

interface DynamicFieldLabelProps {
  fData: IDynamicFieldSchema;
  className?: string;
}

const DynamicFieldLabel = ({ fData, className }: DynamicFieldLabelProps) => {
  return (
    <div className="flex items-center gap-0.5">
      <FormLabel className={cn("ml-1 flex items-center gap-0.5", className)}>
        <span>{fData.label}</span>
        {fData.regOptions?.required && !fData.disabled ? (
          <span className="text-destructive">*</span>
        ) : null}
      </FormLabel>
      {fData.description && !["switch", "checkbox"].includes(fData.type) ? (
        <Tooltip content={fData.description}>
          <div className="rounded hover:bg-slate-100 hover:text-primary">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
};

export { DynamicFieldLabel };
