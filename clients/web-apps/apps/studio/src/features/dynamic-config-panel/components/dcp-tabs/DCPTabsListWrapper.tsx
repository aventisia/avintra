import { cn } from "@avplatform/ui/lib";

export const DCPTabsListWrapper = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-10 items-end justify-between gap-4 border-b border-line px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
