import { cn } from "@avplatform/ui/lib";
import React from "react";

import { ConditionLabel } from "../..";

export const PriorityFieldsLabelHeader: React.FC = () => (
  <div className={cn("grid grid-cols-[1fr_1fr_auto] gap-2")}>
    <ConditionLabel label="Field" description="The field to compare in the condition." />
    <ConditionLabel label="Order by" description="Order by." />
    <span className="w-8" />
  </div>
);
