import { cn } from "@aventisia/ui/lib";
import React from "react";
import { ConditionLabel } from "../..";

interface FieldsLabelHeaderProps {
  fieldsCount: number;
}

export const FieldsLabelHeader: React.FC<FieldsLabelHeaderProps> = ({
  fieldsCount,
}) => (
  <div
    className={cn(
      "grid grid-cols-[1fr_1fr_1fr_auto] gap-2",
      fieldsCount > 1
        ? "grid-cols-[1fr_1fr_1fr_auto]"
        : "grid-cols-[1fr_1fr_1fr]",
    )}
  >
    <ConditionLabel
      label="First Value"
      description="The first value to compare in the condition. This can be a number, string, or variable."
    />
    <ConditionLabel
      label="Operator"
      description="The operator to use for comparison."
    />
    <ConditionLabel
      label="Second Value"
      description="The second value to compare in the condition. This can be a number, string, or variable."
    />
    {fieldsCount > 1 ? <span className="w-8" /> : null}
  </div>
);
