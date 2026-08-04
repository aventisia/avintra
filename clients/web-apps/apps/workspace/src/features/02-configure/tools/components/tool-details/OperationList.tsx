import { ToolDto } from "../../dtos/index";
import { normalizeToolOperations } from "../../utils/tool-operations.util";

interface OperationListProps {
  tool: ToolDto;
}

/**
 * Renders a read-only list of operations parsed from the tool schema.
 */
export const OperationList = ({ tool }: OperationListProps) => {
  const operations = normalizeToolOperations(tool);

  if (!operations.length) {
    return <p className="text-sm text-muted-foreground">No operations available.</p>;
  }

  return (
    <ul className="space-y-2">
      {operations.map((op) => (
        <li key={op.operationId} className="rounded border p-2">
          <div className="font-medium">{op.operationId}</div>
          {op.summary && <div className="text-xs text-muted-foreground">{op.summary}</div>}
          <div className="text-2xs text-muted-foreground">
            {op.method} {op.path}
          </div>
        </li>
      ))}
    </ul>
  );
};
