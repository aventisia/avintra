import { cn } from "@avplatform/ui/lib";

import { resolveAssetSrc } from "@/utils/resolve-asset-src.util";

interface FallbackImageIconProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const FallbackImageIcon = ({ className, src, ...props }: FallbackImageIconProps) => {
  const basePath = import.meta.env.VITE_STUDIO_PATH.replace(/\/$/, "");

  return (
    <div className="flex h-7 w-7 items-center justify-center overflow-hidden">
      <img
        alt="template"
        loading="lazy"
        decoding="async"
        src={resolveAssetSrc(src, basePath)}
        className={cn(
          "aspect-square h-5 rounded-[3px] object-cover opacity-80 transition-all",
          className,
        )}
        {...props}
      />
    </div>
  );
};
