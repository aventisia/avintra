import { EmptyState, Input } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { getHttpMethodBadgeClass } from "../../utils/http-method-badge.util";
import type { ToolOperation } from "../../utils/tool-operations.util";

const SEARCH_MIN_OPERATIONS = 8;

const matchesSearch = (operation: ToolOperation, query: string) =>
  [
    operation.method,
    operation.summary,
    operation.operationId,
    operation.path,
    operation.description,
  ].some((field) => field?.toLowerCase().includes(query));

const OperationRow = ({ operation }: { operation: ToolOperation }) => (
  <li className="flex items-start gap-3 px-4 py-3">
    <span
      className={cn(
        "mt-px w-14 shrink-0 rounded-sm py-0.5 text-center font-mono text-[10.5px] font-semibold",
        getHttpMethodBadgeClass(operation.method),
      )}
    >
      {operation.method}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium text-ink">
        {operation.summary || operation.operationId}
      </p>
      <p className="truncate font-mono text-[11.5px] text-muted-foreground" title={operation.path}>
        {operation.path}
      </p>
      {operation.description && operation.description !== operation.summary && (
        <p className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-ink-2">
          {operation.description}
        </p>
      )}
    </div>
  </li>
);

/**
 * Searchable read-only list of a tool's operations. Operation verification is intentionally
 * not surfaced here; it is only shown while testing operations in the tool wizard.
 */
export const OperationList = ({ operations }: { operations: ToolOperation[] }) => {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleOperations = query
    ? operations.filter((operation) => matchesSearch(operation, query))
    : operations;

  if (!operations.length) {
    return (
      <EmptyState
        className="rounded-lg bg-surface py-10 ring-1 ring-line"
        primaryMessage="No operations defined"
        secondaryMessage="Operations appear here once the tool has a specification or methods."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      {operations.length >= SEARCH_MIN_OPERATIONS && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="relative w-full max-w-72">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search operations"
              placeholder="Search operations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 rounded-md pl-8 text-sm"
            />
          </div>
          {query && (
            <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
              {visibleOperations.length} of {operations.length}
            </span>
          )}
        </div>
      )}
      {visibleOperations.length ? (
        <ul className="divide-y divide-line">
          {visibleOperations.map((operation) => (
            <OperationRow
              key={`${operation.method} ${operation.path} ${operation.operationId}`}
              operation={operation}
            />
          ))}
        </ul>
      ) : (
        <EmptyState className="py-10" primaryMessage={`No operations match “${search.trim()}”`} />
      )}
    </section>
  );
};
