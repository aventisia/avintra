"use client";

import { Input, InputProps, Textarea, TextareaProps } from "@aventisia/ui";
import { Button, ButtonProps } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="input-group"
      className={cn(
        "flex w-full items-center rounded-lg border border-input bg-background shadow-sm shadow-black/5 transition-all",
        "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring",
        "has-[textarea]:items-stretch",
        "disabled:opacity-80",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Addon
 * ---------------------------------------------------------------------------*/

const addonVariants = cva("flex items-center text-muted-foreground text-sm", {
  variants: {
    align: {
      start: "pl-2",
      end: "pr-2 ml-auto",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

function InputGroupAddon({
  className,
  align,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof addonVariants>) {
  return (
    <div
      className={cn(addonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;

        const el = e.currentTarget.parentElement?.querySelector(
          "[data-slot='input-group-control']",
        ) as HTMLInputElement | HTMLTextAreaElement | null;

        if (!el || el.disabled || el.readOnly) return;

        el.focus();
      }}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------------*/

function InputGroupInput({
  className,
  fieldSize = "base",
  ...props
}: InputProps) {
  return (
    <Input
      fieldSize={fieldSize}
      className={cn(
        "border-0 shadow-none focus-visible:ring-0 flex-1",
        "rounded-none bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Textarea
 * ---------------------------------------------------------------------------*/

function InputGroupTextarea({
  className,
  size = "base",
  ...props
}: TextareaProps) {
  return (
    <Textarea
      size={size}
      className={cn(
        "border-0 shadow-none focus-visible:ring-0 flex-1 resize-none",
        "rounded-none bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Button inside group
 * ---------------------------------------------------------------------------*/

function InputGroupButton({ className, size = "sm", ...props }: ButtonProps) {
  return (
    <Button
      size={size}
      variant="ghost"
      className={cn("shadow-none", className)}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------------*/

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground text-sm flex items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * Exports
 * ---------------------------------------------------------------------------*/

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupButton,
  InputGroupText,
};
