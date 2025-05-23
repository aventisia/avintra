type RenderIfConditionType = {
  field: string;
  equals: unknown;
};

type RenderIfType = {
  conditions: RenderIfConditionType[];
  operator?: "AND" | "OR";
};

export type { RenderIfType, RenderIfConditionType };
