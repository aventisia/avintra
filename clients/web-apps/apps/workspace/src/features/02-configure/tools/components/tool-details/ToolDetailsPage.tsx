import { useParams, useSearchParams } from "react-router-dom";

/**
 * Placeholder details page for a tool.
 */
export const ToolDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const toolName = searchParams.get("tool") ?? "Tool Details";

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">{toolName}</h1>
      <p className="text-sm text-muted-foreground">Tool ID: {id}</p>
      <p className="text-sm text-muted-foreground">Detailed tool editor and playground will be added here.</p>
    </div>
  );
};
