import { ToolDto } from "../../dtos/index";
import { normalizeToolOperations } from "../../utils/tool-operations.util";

interface OperationListProps {
  tool: ToolDto;
  showTitle?: boolean;
}

/**
 * Renders a read-only list of operations parsed from the tool schema.
 * Displays operations in a two-column grid showing the operation id and
 * description.
 */
export const OperationList = ({ tool, showTitle }: OperationListProps) => {
  const operations = normalizeToolOperations(tool);

  return (
    <>
      {showTitle && (
        <h3 className="text-sm font-semibold mb-3">
          Operations
          {operations.length > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({operations.length})
            </span>
          )}
        </h3>
      )}

      {!operations.length ? (
        <p className="text-sm text-muted-foreground">No operations available.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {operations.map((op) => (
            <div key={op.operationId} className="rounded border p-3 bg-muted/30">
              <div className="text-sm font-semibold text-foreground truncate">{op.operationId}</div>
              {(op.description || op.summary) && (
                <div className="text-xs text-muted-foreground mt-1">
                  {op.description || op.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
