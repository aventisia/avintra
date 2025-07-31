import { cn } from "@aventisia/ui/lib";

interface FallbackImageIconProps
  extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const FallbackImageIcon = ({
  className,
  src,
  ...props
}: FallbackImageIconProps) => {
  return (
    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-slate-100">
      <img
        alt="template"
        loading="lazy"
        decoding="async"
        src={src}
        className={cn(
          "aspect-square h-5 object-cover opacity-70 transition-all",
          className,
        )}
        {...props}
      />
    </div>
  );
};
