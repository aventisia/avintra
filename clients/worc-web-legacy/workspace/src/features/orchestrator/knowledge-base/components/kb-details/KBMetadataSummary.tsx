import { Badge } from "@aventisia/ui/badge";

import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";

/**
 * Returns an array of metadata rows for display in the KBMetadataSummary panel.
 * Each row contains a label, value, and (optionally) a BYOK badge indicator.
 * - Vector Store: Shows BYOK if storeCredentialId is set.
 * - Embedding Provider: Shows BYOK if embeddingCredentialId is set.
 * - Embedding Model: No BYOK badge.
 *
 * @param knowledgeBase The knowledge base object to extract metadata from.
 * @returns Array of metadata row objects for rendering.
 */
const metadataRows = (knowledgeBase?: KnowledgeBaseTableDto) => {
  // BYOK badge is shown when a credential id is configured for that provider.
  const storeBYOKEnabled = Boolean(knowledgeBase?.storeCredentialId);
  const embeddingBYOKEnabled = Boolean(knowledgeBase?.embeddingCredentialId);

  // Keep rendering data-driven so adding/removing metadata fields is simple.
  return [
    {
      label: "Vector Store",
      value: knowledgeBase?.vectorStore || "Not configured",
      isBYOK: storeBYOKEnabled,
    },
    {
      label: "Embedding Provider",
      value: knowledgeBase?.embeddingProvider || "Not configured",
      isBYOK: embeddingBYOKEnabled,
    },
    {
      label: "Embedding Model",
      value: knowledgeBase?.embeddingModel || "Not configured",
    },
  ];
};

/**
 * KBMetadataSummary
 *
 * Displays a summary panel of core Knowledge Base configuration metadata on the KB details page.
 * Shows Vector Store, Embedding Provider, and Embedding Model, with BYOK badges if user credentials are configured.
 *
 * Usage:
 *   <KBMetadataSummary knowledgeBase={kbObject} />
 *
 * - If a value is missing, displays "Not configured".
 * - BYOK badge appears for Vector Store or Embedding Provider if a credential id is present.
 * - Designed for maintainability: add/remove fields in metadataRows().
 *
 * @param knowledgeBase The knowledge base object whose metadata is displayed.
 */
export const KBMetadataSummary = ({
  knowledgeBase,
}: {
  knowledgeBase?: KnowledgeBaseTableDto;
}) => {
  // Prepare rows once per render and let UI map over them consistently.
  const rows = metadataRows(knowledgeBase);

  return (
    <div className="rounded-lg border bg-background px-5 py-3.5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5 rounded-md">
            <span className="text-2xs uppercase tracking-wide text-muted-foreground">
              {row.label}
            </span>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium break-all">{row.value}</span>
              {row.isBYOK && (
                <Badge variant="secondary" className="h-[1.1rem] px-1.5">
                  BYOK
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
