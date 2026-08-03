import { cn } from "@avplatform/ui/lib";
import React from "react";

import { ConditionLabel } from "../..";

export const FieldsLabelHeader: React.FC = () => (
  <div className={cn("grid grid-cols-[1fr_1fr_1fr_auto] gap-2")}>
    <ConditionLabel
      label="First Value"
      description="The first value to compare in the condition. This can be a number, string, or variable."
    />
    <ConditionLabel label="Operator" description="The operator to use for comparison." />
    <ConditionLabel
      label="Second Value"
      description="The second value to compare in the condition. This can be a number, string, or variable."
    />
    <span className="w-8" />
  </div>
);
