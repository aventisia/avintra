import { ToolDto } from "../../dtos/index";
import { normalizeToolOperations } from "../../utils/tool-operations.util";

interface OperationListProps {
  tool: ToolDto;
  showTitle?: boolean;
}

/**
 * Renders a read-only list of operations parsed from the tool schema. Operation
 * verification is intentionally not surfaced here; it is only shown while
 * testing operations in the tool wizard.
 */
export const OperationList = ({ tool, showTitle }: OperationListProps) => {
  const operations = normalizeToolOperations(tool);

  return (
    <>
      {showTitle && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">
            Operations
            {operations.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({operations.length})
              </span>
            )}
          </h3>
        </div>
      )}

      {!operations.length ? (
        <p className="text-sm text-muted-foreground">No operations available.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {operations.map((operation) => (
            <div key={operation.operationId} className="rounded border p-3 bg-muted/30">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {operation.operationId}
                </div>
                {(operation.description || operation.summary) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {operation.description || operation.summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
