import { cn } from "@avplatform/ui/lib";

export const DCPTabsListWrapper = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex h-12 shrink-0 items-center justify-between gap-4 px-4", className)}>
      {children}
    </div>
  );
};
