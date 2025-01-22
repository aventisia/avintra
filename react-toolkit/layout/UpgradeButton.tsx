import { cn } from "@/react-toolkit/lib/utils";

interface UpgradeButtonProps {
  className?: string;
}

const UpgradeButton = ({ className }: UpgradeButtonProps) => {
  return <div className={cn("", className)}></div>;
};

export { UpgradeButton };
