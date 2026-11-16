import { Badge } from "@avplatform/ui/badge";

import { SkillTableDto } from "../../dtos/skill-table.dto";

const metadataRows = (skill?: SkillTableDto) => {
  return [
    {
      label: "Status",
      value: skill?.isDisabled ? "Disabled" : "Active",
    },
    {
      label: "Total files",
      value: skill?.fileCount?.toString() ?? "0",
    },
    {
      label: "Access level",
      value: skill?.accessLevel?.replace(/([A-Z])/g, " $1") ?? "Personal",
      badge: skill?.isTenantWideAccess ? "Tenant-wide" : undefined,
    },
  ];
};

/**
 * Displays a summary panel of skills metadata on the skill details page.
 */
export const SkillMetadataSummary = ({ skill }: { skill?: SkillTableDto }) => {
  const rows = metadataRows(skill);

  return (
    <div className="rounded-lg border bg-surface px-5 py-3.5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5 rounded-md">
            <span className="text-2xs uppercase tracking-wide text-muted-foreground">
              {row.label}
            </span>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium break-all">{row.value}</span>
              {row.badge && (
                <Badge variant="secondary" className="h-[1.1rem] px-1.5">
                  {row.badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
