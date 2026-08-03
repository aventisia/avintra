import { cn } from "@avplatform/ui/lib";

interface NodesCategoryL1IconProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export const NodesCategoryL1Icon = ({ Icon, className }: NodesCategoryL1IconProps) => {
  return (
    <div className="grid min-h-6 min-w-6 place-items-center rounded-lg bg-slate-100">
      <Icon className={cn("h-4 w-4 stroke-[1.7] text-slate-600", className)} />
    </div>
  );
};
