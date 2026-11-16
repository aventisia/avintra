import { cn } from "@avplatform/ui/lib";
import { SEGMENTED_TABS_LIST_CLASS, TabsList } from "@avplatform/ui/tabs";

export const DCPTabsList = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <TabsList className={cn(SEGMENTED_TABS_LIST_CLASS, className)}>{children}</TabsList>;
};
