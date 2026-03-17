import { cn } from "@aventisia/ui/lib";

interface NodeImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const NodeImage = ({ className, src, ...props }: NodeImageProps) => {
  const basePath = import.meta.env.VITE_AGENTBUILDER_PATH.replace(/\/$/, "");

  return (
    <img
      src={basePath + src}
      className={cn("h-7 w-7 opacity-80", className)}
      draggable={false}
      {...props}
    />
  );
};
