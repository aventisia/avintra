import { cn } from "@avplatform/ui/lib";

export const DCPTabsListWrapper = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex h-14 pt-1 items-center justify-between px-4", className)}>
      {children}
    </div>
  );
};
