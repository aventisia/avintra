import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A wrapper component that visually groups related fields.
 *
 * Renders a bordered container with a floating group title.
 * Use this as a parent wrapper for any form fields that should
 * appear as a logical group.
 */
export const GroupedFieldsWrapper = ({
  groupName,
  children,
  className,
}: {
  groupName: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative !mt-5 space-y-3 rounded-lg border p-3 first:!mt-1.5",
        className,
      )}
    >
      <div className="absolute -top-3 left-2.5">
        <span className="rounded-full bg-indigo-100 px-1.5 py-1 text-xs font-medium text-indigo-600">
          {groupName}
        </span>
      </div>
      {children}
    </div>
  );
};
