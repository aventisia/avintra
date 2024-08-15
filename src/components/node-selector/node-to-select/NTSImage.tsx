import { cn } from "@/react-toolkit/lib/utils";

interface NTSImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const NTSImage = ({ className, src, ...props }: NTSImageProps) => {
  return (
    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md">
      <img
        alt="template"
        loading="lazy"
        decoding="async"
        src={src}
        className={cn(
          "aspect-square h-5 object-cover transition-all",
          className,
        )}
        {...props}
      />
    </div>
  );
};
