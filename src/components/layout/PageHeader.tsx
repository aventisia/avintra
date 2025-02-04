import { cn } from "@/react-toolkit/lib/utils";
import { Skeleton } from "@/react-toolkit/ui/skeleton";

interface PageHeaderProps {
  isLoading?: boolean;
  pageHeading: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader = ({
  isLoading,
  pageHeading,
  children,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn("mt-5 flex items-center justify-between", className)}>
      {isLoading ? (
        <>
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
        </>
      ) : (
        <>
          <h2 className="flex items-center text-lg font-medium text-foreground">
            {pageHeading}
          </h2>
          <div className="flex">{children}</div>
        </>
      )}
    </div>
  );
};

export { PageHeader };
