import { Button } from "@avplatform/ui/buttons";
import { useState } from "react";

import { useDebounce } from "../../../agents-table/hooks/useDebounce";
import { useSearchUsersList } from "../../../agents-table/hooks/user/useSearchUsersList";
import { ApprovalStateDto } from "../../dtos/approval-state-dto";
import { AgentRiskTier } from "../../enums/risk-tier-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { computeAgentRiskTier } from "../../utils/tiering-engine";
import { DateInput } from "./DateInput";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

const EMPTY_APPROVAL: ApprovalStateDto = {
  isSubmitted: false,
  requestedToUserId: "",
  requestedToName: "",
  requestedOn: "",
  decision: "pending",
  decidedBy: "",
  decidedOn: "",
  decisionNotes: "",
  exceptions: [],
};

/**
 * Section 06 - Validation & Approval.
 * Includes a workflow where the submitter selects an approver by name and the
 * approver approves/rejects or requests changes.
 */
export const ValidationApprovalSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  const [approverSearch, setApproverSearch] = useState("");
  const debouncedApproverSearch = useDebounce(approverSearch, 400);

  const { data: approverResults } = useSearchUsersList(debouncedApproverSearch);

  if (!assessment || !selectedAgentId) return null;

  const tier = computeAgentRiskTier({
    scopeScore: assessment.scopeScore,
    dataSensitivityScore: assessment.dataSensitivityScore,
    dependencyComplexityScore: assessment.dependencyComplexityScore,
    supervisoryImpactScore: assessment.supervisoryImpactScore,
  });

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const updateApproval = (patch: Partial<ApprovalStateDto>) => {
    update({ approval: { ...assessment.approval, ...patch } });
  };

  const approval = assessment.approval ?? EMPTY_APPROVAL;

  const approvalRoute =
    tier === AgentRiskTier.High
      ? "Elevated review / approval (mandatory)"
      : tier
        ? "Delegated review authority"
        : "Complete the risk tiering first";

  const approvers = approverResults?.data ?? [];
  const showApproverDropdown = approverSearch.trim().length > 0;

  return (
    <SectionLayout
      eyebrow="Section 06"
      title="Validation & Approval"
      description="Closes the loop from validation through ongoing review and approval."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Last Validation Date"
            info="Enter the date this agent was last validated. Leave blank if it has not been validated yet."
          >
            <DateInput
              value={assessment.lastValidationDate}
              onChange={(date) => update({ lastValidationDate: date })}
            />
          </Field>
          <Field
            label="Next Review Due"
            info="Enter the date of the next scheduled review. Higher-risk agents should be reviewed more frequently."
          >
            <DateInput
              value={assessment.nextReviewDate}
              onChange={(date) => update({ nextReviewDate: date })}
            />
          </Field>
        </div>

        <Field
          label="Approval Route"
          info="Auto-derived from the composite risk tier. High-risk agents require elevated review; medium/low may use delegated authority."
        >
          <div className="rounded-lg border border-primary bg-gradient-to-br from-primary/15 to-primary/5 p-4">
            <div className="text-xs leading-relaxed text-muted-foreground">
              Based on the composite risk tier, this agent routes to:{" "}
              <strong className="text-foreground">{approvalRoute}</strong>
            </div>
          </div>
        </Field>

        {/* Approver selection */}
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="mb-3 text-sm font-semibold">Approval</div>

          {approval.isSubmitted ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Requested of: </span>
                <span className="font-medium">{approval.requestedToName}</span>
              </div>
              {approval.decidedBy && (
                <div>
                  <span className="text-muted-foreground">Decision ({approval.decision}): </span>
                  <span className="font-medium">{approval.decidedBy}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateApproval({
                      isSubmitted: false,
                      decision: "pending",
                      decidedBy: "",
                      decidedOn: "",
                      decisionNotes: "",
                    })
                  }
                >
                  Edit Approval Request
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  Select Approver
                </label>
                <div className="relative">
                  <input
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    placeholder="Search approver by name…"
                    value={approverSearch}
                    onChange={(e) => setApproverSearch(e.target.value)}
                  />
                  {showApproverDropdown && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                      {approvers.length === 0 && (
                        <div className="p-2 text-xs text-muted-foreground">No users found</div>
                      )}
                      {approvers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            const name = `${user.firstName} ${user.lastName}`.trim();
                            updateApproval({
                              requestedToUserId: user.id,
                              requestedToName: name || user.userName || "",
                            });
                            setApproverSearch("");
                          }}
                        >
                          {`${user.firstName} ${user.lastName}`.trim() || user.userName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {approval.requestedToName && (
                <div className="text-xs text-muted-foreground">
                  Selected approver:{" "}
                  <span className="font-medium text-foreground">{approval.requestedToName}</span>
                </div>
              )}
              <Button
                size="sm"
                disabled={!approval.requestedToName}
                onClick={() =>
                  updateApproval({
                    isSubmitted: true,
                    requestedOn: new Date().toISOString(),
                    decision: "pending",
                  })
                }
              >
                Submit for Approval
              </Button>
            </div>
          )}

          {approval.isSubmitted && approval.decision === "pending" && (
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              <Field label="Decision Notes">
                <textarea
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  placeholder="Notes accompanying the decision"
                  value={approval.decisionNotes}
                  onChange={(e) => updateApproval({ decisionNotes: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateApproval({
                      decision: "approved",
                      decidedBy: approval.requestedToName,
                      decidedOn: new Date().toISOString(),
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateApproval({
                      decision: "rejected",
                      decidedBy: approval.requestedToName,
                      decidedOn: new Date().toISOString(),
                    })
                  }
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateApproval({
                      decision: "returned",
                      decidedBy: approval.requestedToName,
                      decidedOn: new Date().toISOString(),
                    })
                  }
                >
                  Request Changes
                </Button>
              </div>
            </div>
          )}

          {approval.isSubmitted && approval.decision !== "pending" && (
            <div className="mt-3 text-sm">
              <span className="font-semibold uppercase tracking-wide text-primary">
                {approval.decision}
              </span>
              {approval.decisionNotes && (
                <p className="mt-1 text-xs text-muted-foreground">{approval.decisionNotes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionLayout>
  );
};
