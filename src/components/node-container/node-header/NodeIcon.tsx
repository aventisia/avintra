import { cn } from "@/react-toolkit/lib/utils";

interface NodeIconProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
}

export const NodeIcon = ({ className, src, ...props }: NodeIconProps) => {
  return <img src={src} className={cn("h-3.5", className)} {...props} />;
};
