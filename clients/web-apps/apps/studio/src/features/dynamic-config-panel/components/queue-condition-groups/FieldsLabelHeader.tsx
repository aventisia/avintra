import { cn } from "@avplatform/ui/lib";
import React from "react";

import { ConditionLabel } from "../..";

export const FieldsLabelHeader: React.FC = () => (
  <div className={cn("grid grid-cols-[1fr_1fr_1fr_auto] gap-2")}>
    <ConditionLabel label="Field" description="The field to compare in the condition." />
    <ConditionLabel label="Operator" description="The operator to use for comparison." />
    <ConditionLabel label="Value" description="The value to compare in the condition." />
    <span className="w-8" />
  </div>
);
