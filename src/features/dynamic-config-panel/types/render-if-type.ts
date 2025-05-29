type RenderIfConditionType = {
  field: string;
  equals: unknown;
};

type RenderIfType = {
  conditions: RenderIfConditionType[];
  _operator?: "AND" | "OR";
};

export type { RenderIfType, RenderIfConditionType };
