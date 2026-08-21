import { Badge } from "@avplatform/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { Button } from "@avplatform/ui/buttons";
import { DTPagination, DataTable } from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { SelectOption } from "../constants/dropdown-options";
import { AgentRiskIssueDto } from "../dtos/agent-risk-issue-dto";
import { RiskSeverity } from "../enums/risk-severity-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../stores/ai-governance-store";
import { DateInput } from "./sections/DateInput";

const ISSUE_STATUS_OPTIONS: SelectOption[] = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "wont-fix", label: "Won't Fix" },
];

const ISSUE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "model-output", label: "Model Output" },
  { value: "data", label: "Data" },
  { value: "security", label: "Security" },
  { value: "compliance", label: "Compliance" },
  { value: "operational", label: "Operational" },
  { value: "other", label: "Other" },
];

const severityBadgeClass: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-600",
  medium: "bg-amber-500/15 text-amber-600",
  high: "bg-red-500/15 text-red-600",
  critical: "bg-red-600/20 text-red-700",
};

const renderSelect = (value: string, options: SelectOption[], onChange: (v: string) => void) => (
  <select
    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const createEmptyIssue = (flowVersionId: string): AgentRiskIssueDto => ({
  id: "",
  agentRiskRegistryId: "",
  flowVersionId,
  jobId: "",
  severity: RiskSeverity.Medium,
  category: "operational",
  title: "",
  description: "",
  detectedOn: "",
  status: "open",
  resolutionNotes: "",
});

/**
 * Issues & Violations table - a business-as-usual view of manually recorded
 * issues for the selected agent. Issues appear as line items with an
 * "Add Issue" button at the top.
 */
export const IssuesTable = () => {
  useDocumentTitle("Issues & Violations");

  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const goToTable = useAiGovernanceStore((state) => state.goToTable);
  const assessment = useSelectedAssessment();

  // Safe defaults so hooks are called unconditionally.
  const agentId = selectedAgentId ?? "";
  const issues = assessment?.issues ?? [];
  const agentName = assessment?.agentName ?? "Agent";

  const update = (patch: Partial<typeof assessment>) => {
    if (!assessment) return;
    updateAssessment(agentId, { ...assessment, ...patch });
  };

  const addIssue = () => {
    if (!assessment) return;
    update({ issues: [...issues, createEmptyIssue(agentId)] });
  };

  const updateIssue = (index: number, patch: Partial<AgentRiskIssueDto>) => {
    if (!assessment) return;
    const next = issues.map((issue, i) => (i === index ? { ...issue, ...patch } : issue));
    update({ issues: next });
  };

  const removeIssue = (index: number) => {
    if (!assessment) return;
    update({ issues: issues.filter((_, i) => i !== index) });
  };

  const columns: ColumnDef<AgentRiskIssueDto>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row, getValue }) => {
        const index = row.index;
        return (
          <input
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            placeholder="Issue title"
            value={String(getValue() ?? "")}
            onChange={(e) => updateIssue(index, { title: e.target.value })}
          />
        );
      },
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ getValue }) => (
        <Badge variant="outline" className={severityBadgeClass[String(getValue())]}>
          {String(getValue()).toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row, getValue }) =>
        renderSelect(String(getValue()), ISSUE_CATEGORY_OPTIONS, (v) =>
          updateIssue(row.index, { category: v }),
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row, getValue }) =>
        renderSelect(String(getValue()), ISSUE_STATUS_OPTIONS, (v) =>
          updateIssue(row.index, { status: v }),
        ),
    },
    {
      accessorKey: "detectedOn",
      header: "Detected On",
      cell: ({ row, getValue }) => (
        <DateInput
          value={String(getValue() ?? "")}
          onChange={(date) => updateIssue(row.index, { detectedOn: date })}
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row, getValue }) => (
        <textarea
          className="w-full rounded-lg border border-border bg-background p-2 text-sm"
          placeholder="Describe the issue"
          value={String(getValue() ?? "")}
          onChange={(e) => updateIssue(row.index, { description: e.target.value })}
        />
      ),
    },
    {
      accessorKey: "resolutionNotes",
      header: "Resolution Notes",
      cell: ({ row, getValue }) => (
        <textarea
          className="w-full rounded-lg border border-border bg-background p-2 text-sm"
          placeholder="Resolution notes"
          value={String(getValue() ?? "")}
          onChange={(e) => updateIssue(row.index, { resolutionNotes: e.target.value })}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => removeIssue(row.index)}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remove issue"
        >
          <Trash2Icon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const table = useDataTable(columns, issues, {}, undefined, false);

  if (!assessment || !selectedAgentId) {
    return null;
  }

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button type="button" onClick={goToTable} className="text-muted-foreground">
                  Agent Risk Registry
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-48 truncate">{agentName}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Issues & Violations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button variant="outline" onClick={addIssue}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Issue
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <DataTable table={table} columnsLength={columns.length} />
      </div>

      <DTPagination table={table} />
    </div>
  );
};
