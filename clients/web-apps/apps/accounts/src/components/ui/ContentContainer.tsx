import { cn } from "@avplatform/ui/lib";

interface ContentContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const ContentContainer = ({ children, className = "" }: ContentContainerProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="flex w-[calc(100vw-1.5rem)] flex-col items-start justify-center space-y-6 p-5 xs:w-[30rem] xs:p-10">
        {children}
      </div>
    </div>
  );
};

export { ContentContainer };
