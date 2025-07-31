import { cn } from "@aventisia/ui/lib";

interface NodeImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const NodeImage = ({ className, src, ...props }: NodeImageProps) => {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100">
      <img src={src} className={cn("h-4 opacity-80", className)} {...props} />
    </div>
  );
};
