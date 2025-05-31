import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface ConditionLabelProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const ConditionLabel: React.FC<ConditionLabelProps> = ({
  label,
  description,
  className,
}) => (
  <div className="flex items-center gap-1">
    <span
      className={cn(
        "ml-1 flex items-center gap-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
    {description ? (
      <Tooltip content={description}>
        <div className="rounded hover:bg-slate-100 hover:text-primary">
          <InformationCircleIcon className="h-3.5 w-3.5" />
        </div>
      </Tooltip>
    ) : null}
  </div>
);
