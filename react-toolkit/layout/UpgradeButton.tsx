import { cn } from "@aventisia/ui/lib";

interface UpgradeButtonProps {
  className?: string;
}

const UpgradeButton = ({ className }: UpgradeButtonProps) => {
  return <div className={cn("", className)}></div>;
};

export { UpgradeButton };
