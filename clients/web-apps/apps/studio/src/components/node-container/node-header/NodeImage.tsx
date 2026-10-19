import { cn } from "@avplatform/ui/lib";

import { resolveAssetSrc } from "@/utils/resolve-asset-src.util";

interface NodeImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const NodeImage = ({ className, src, ...props }: NodeImageProps) => {
  const basePath = import.meta.env.VITE_STUDIO_PATH.replace(/\/$/, "");

  return (
    <img
      src={resolveAssetSrc(src, basePath)}
      className={cn("h-7 w-7 opacity-80", className)}
      draggable={false}
      {...props}
    />
  );
};
