import { CopyableText } from "@avplatform/ui";
import { PersonAvatar } from "@avplatform/ui/avatar";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { RecordIdentifiers, recordLabelClass } from "@avplatform/ui/record-sheet";
import { formatDate } from "@avplatform/ui/utils";
import type { ReactNode } from "react";

import { AUTHENTICATION_TYPE_DISPLAY_NAMES } from "../../constants/tools-display-names.constant";
import type { ToolDto } from "../../dtos/index";

type DetailRowProps = {
  label: string;
  value?: ReactNode;
  /** Full value shown on hover when the value is truncated. */
  title?: string;
};

const DetailRow = ({ label, value, title }: DetailRowProps) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2">
    <dt className={cn("shrink-0", recordLabelClass)}>{label}</dt>
    <dd className="truncate text-right text-[13px] font-medium text-ink" title={title}>
      {value || FALLBACK_VALUE}
    </dd>
  </div>
);

const Person = ({ name }: { name: string }) => (
  <span className="inline-flex items-center gap-2">
    <PersonAvatar name={name} size="sm" />
    {name}
  </span>
);

const formatTimestamp = (timestamp?: string) => timestamp && formatDate(timestamp, true);

/**
 * Tool page sidebar: connection, sharing and audit details, and the copyable tool ID.
 */
export const ToolDetailsFacts = ({ tool }: { tool: ToolDto }) => (
  <section className="divide-y divide-line overflow-hidden rounded-lg bg-surface ring-1 ring-line">
    <h3 className="px-4 py-3 text-[13px] font-semibold text-ink">Details</h3>
    <dl className="py-1.5">
      <DetailRow
        label="Authentication"
        value={
          tool.authenticationType && AUTHENTICATION_TYPE_DISPLAY_NAMES[tool.authenticationType]
        }
      />
      <DetailRow label="Credential" value={tool.credentialName} />
      <DetailRow
        label="Base URL"
        title={tool.baseUrl}
        value={tool.baseUrl && <span className="font-mono text-[12px]">{tool.baseUrl}</span>}
      />
      <DetailRow label="Tenant-wide access" value={tool.isTenantWideAccess ? "Yes" : "No"} />
    </dl>
    <dl className="py-1.5">
      <DetailRow label="Created by" value={tool.createdBy && <Person name={tool.createdBy} />} />
      <DetailRow label="Created on" value={formatTimestamp(tool.createdOn)} />
      <DetailRow
        label="Modified by"
        value={tool.lastModifiedBy && <Person name={tool.lastModifiedBy} />}
      />
      <DetailRow label="Modified on" value={formatTimestamp(tool.lastModifiedOn)} />
    </dl>
    <RecordIdentifiers>
      <dt className={recordLabelClass}>Tool ID</dt>
      <dd className="font-mono text-[12px] text-ink-2">
        {tool.id ? <CopyableText value={tool.id} /> : FALLBACK_VALUE}
      </dd>
    </RecordIdentifiers>
  </section>
);
