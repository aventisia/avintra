import { cn } from "@avplatform/ui/lib";

interface TriggerNodeIconProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export const TriggerNodeIcon = ({ Icon, className }: TriggerNodeIconProps) => {
  return (
    <div className="grid min-h-6 min-w-6 place-items-center rounded-lg bg-green-100">
      <Icon
        className={cn("h-3.5 w-3.5 stroke-[2] text-green-600", className)}
      />
    </div>
  );
};
