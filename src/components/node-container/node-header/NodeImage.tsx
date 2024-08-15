import { cn } from "@/react-toolkit/lib/utils";

interface NodeImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const NodeImage = ({ className, src, ...props }: NodeImageProps) => {
  return <img src={src} className={cn("h-4", className)} {...props} />;
};
