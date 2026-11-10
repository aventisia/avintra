import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: FormFieldSizeType;
  }
>(({ className, children, size = "base", ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between gap-2 rounded-md border border-line-strong bg-surface text-left text-ink transition-[border-color,box-shadow] duration-[120ms] ease-out focus:outline-none focus-visible:border-focus focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] data-[state=open]:border-focus data-[state=open]:ring-[3px] data-[state=open]:ring-focus/[0.28] aria-[invalid=true]:border-bad data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:text-muted-foreground motion-reduce:transition-none [&>span]:line-clamp-1",
      size === "xs" && "h-6 pl-2 pr-1 text-hint",
      size === "sm" && "h-7 pl-2.5 pr-1.5 text-body-sm",
      size === "base" && "h-8 pl-[11px] pr-2 text-body",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretDownIcon
        className={cn(
          "shrink-0 text-muted-foreground",
          size === "xs" && "h-3 w-3",
          size === "sm" && "h-3.5 w-3.5",
          size === "base" && "h-4 w-4",
        )}
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <CaretUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <CaretDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    matchTriggerWidth?: boolean;
  }
>(({ className, children, position = "popper", matchTriggerWidth = false, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg bg-surface text-ink shadow-pop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "w-full p-1",
          matchTriggerWidth &&
            "min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]",
          position === "popper" && "h-[var(--radix-select-trigger-height)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 pb-1 pt-2 font-mono text-label uppercase text-muted-foreground", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    size?: FormFieldSizeType;
    description?: string;
  }
>(({ className, children, size = "base", description, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "flex w-full cursor-default select-none flex-col justify-center rounded-sm text-ink outline-none focus:bg-hover data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground",
      size === "xs" && "px-1 py-1 text-2xs",
      size === "sm" && "px-1.5 py-1 text-xs",
      size === "base" && "min-h-8 px-2 py-1 text-body-sm",
      className,
    )}
    {...props}
  >
    <div className="flex w-full items-center gap-1 justify-between">
      <SelectPrimitive.ItemText className="grow">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="text-primary-text">
        <CheckIcon
          className={cn(
            size === "xs" && "h-3 w-3",
            size === "sm" && "h-3.5 w-3.5",
            size === "base" && "h-4 w-4",
          )}
        />
      </SelectPrimitive.ItemIndicator>
    </div>
    {description && (
      <span title={description} className="truncate text-2xs text-muted-foreground">
        {description}
      </span>
    )}
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-line", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
