import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import React from "react";

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isDestructive?: boolean;
  shortcut?: string;
  size?: "sm" | "md";
}

export default function MenuItem({
  icon,
  label,
  onClick,
  disabled = false,
  className,
  isDestructive = false,
  shortcut,
  size = "md",
}: MenuItemProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={isDestructive ? "dropdownCautionItem" : "dropdownItem"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-start gap-2 hover:bg-accent",
        disabled && "text-muted-foreground",
        size === "sm" && "h-8 px-2 text-xs",
        size === "md" && "h-8",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex items-center justify-center",
            size === "sm" && "h-3.5 w-3.5",
            size === "md" && "h-4 w-4",
          )}
        >
          {icon}
        </span>
      )}

      <span className="truncate">{label}</span>

      {shortcut && !disabled && (
        <span className="ml-auto text-2xs tracking-widest text-muted-foreground">
          {shortcut}
        </span>
      )}
    </Button>
  );
}
