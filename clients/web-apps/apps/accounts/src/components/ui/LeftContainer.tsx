import { cn } from "@avplatform/ui/lib";

interface LeftContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const LeftContainer = ({ className = "lg:w-[50%]", children }: LeftContainerProps) => {
  return (
    <div className={cn("flex w-full flex-col items-center justify-between", className)}>
      {children}
    </div>
  );
};

export { LeftContainer };
