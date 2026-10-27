import { Input } from "@avplatform/ui";
import { Label } from "@avplatform/ui/label";
import { cn } from "@avplatform/ui/lib";
import * as React from "react";

export type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, ...props }, ref) => {
    return <Input placeholder=" " className={cn("peer", className)} ref={ref} {...props} />;
  },
);
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "absolute start-0.5 top-1.5 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text rounded-sm bg-surface px-1.5 text-body font-normal text-muted-foreground duration-300 peer-focus:text-primary-text motion-reduce:transition-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1.5 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-1.5 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingLabel.displayName = "FloatingLabel";

type FloatingLabelInputProps = FloatingInputProps & { label?: string };

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, FloatingLabelInput };
