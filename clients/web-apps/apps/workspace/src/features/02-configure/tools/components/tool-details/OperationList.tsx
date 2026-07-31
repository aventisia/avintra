import { ToolDto } from "../../dtos/index";

interface OperationListProps {
  tool: ToolDto;
}

/**
 * Renders a read-only list of operations parsed from the tool schema.
 */
export const OperationList = ({ tool }: OperationListProps) => {
  const operations =
    tool.parsedSchema && typeof tool.parsedSchema === "object" && "operations" in tool.parsedSchema
      ? (tool.parsedSchema.operations as Array<{ operationId: string; summary?: string }>)
      : [];

  if (!operations.length) {
    return <p className="text-sm text-muted-foreground">No operations available.</p>;
  }

  return (
    <ul className="space-y-2">
      {operations.map((op) => (
        <li key={op.operationId} className="rounded border p-2">
          <div className="font-medium">{op.operationId}</div>
          {op.summary && <div className="text-xs text-muted-foreground">{op.summary}</div>}
        </li>
      ))}
    </ul>
  );
};
