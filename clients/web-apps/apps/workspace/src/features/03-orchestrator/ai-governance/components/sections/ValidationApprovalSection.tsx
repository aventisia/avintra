import { Checkbox } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useState } from "react";

import { useDebounce } from "../../../agents-table/hooks/useDebounce";
import { ApprovalStateDto } from "../../dtos/approval-state-dto";
import { useSearchUsersList } from "../../hooks/useSearchUsersList";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

const EMPTY_APPROVAL: ApprovalStateDto = {
  isSubmitted: false,
  requestedToUserId: "",
  requestedToName: "",
  requestedOn: "",
  decision: "pending",
  decidedBy: "",
  decidedByUserId: "",
  decidedOn: "",
  decisionNotes: "",
  exceptions: [],
  isInformationAccurate: false,
};

/**
 * Section 06 - Validation & Approval.
 * Confirm the information is accurate, select an approver by name, and submit
 * for approval. The approver approves/rejects or requests changes.
 */
export const ValidationApprovalSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  const [approverSearch, setApproverSearch] = useState("");
  const debouncedApproverSearch = useDebounce(approverSearch, 400);

  const { data: approverResults } = useSearchUsersList(debouncedApproverSearch);

  if (!assessment || !selectedAgentId) return null;

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const updateApproval = (patch: Partial<ApprovalStateDto>) => {
    update({ approval: { ...assessment.approval, ...patch } });
  };

  const approval = assessment.approval ?? EMPTY_APPROVAL;

  const approvers = approverResults?.data ?? [];
  const showApproverDropdown = approverSearch.trim().length > 0;

  return (
    <SectionLayout
      eyebrow="Section 06"
      title="Validation & approval"
      description="Confirm the information provided is accurate, select an approver, and submit for approval."
    >
      <div className="space-y-6">
        {/* Accuracy confirmation */}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-sunken/20 p-4">
          <Checkbox
            checked={approval.isInformationAccurate}
            onCheckedChange={(checked) => updateApproval({ isInformationAccurate: !!checked })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            I confirm that the information provided in this record is accurate to the best of my
            knowledge.
          </span>
        </label>

        {/* Approver selection */}
        <div className="rounded-lg border border-line bg-sunken/20 p-4">
          <div className="mb-3 text-sm font-semibold">Select Approver &amp; Submit</div>

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
                  Edit approval request
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  Select approver
                </label>
                <div className="relative">
                  <input
                    className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm"
                    placeholder="Search approver by name…"
                    value={approverSearch}
                    onChange={(e) => setApproverSearch(e.target.value)}
                  />
                  {showApproverDropdown && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-pop">
                      {approvers.length === 0 && (
                        <div className="p-2 text-xs text-muted-foreground">No users found</div>
                      )}
                      {approvers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-hover"
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
                  <span className="font-medium text-ink">{approval.requestedToName}</span>
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
                Submit for approval
              </Button>
            </div>
          )}

          {approval.isSubmitted && approval.decision === "pending" && (
            <div className="mt-4 space-y-3 border-t border-line pt-3">
              <Field label="Decision notes">
                <textarea
                  className="w-full rounded-lg border border-line bg-surface p-3 text-sm"
                  placeholder="Notes accompanying the decision"
                  value={approval.decisionNotes}
                  onChange={(e) => updateApproval({ decisionNotes: e.target.value })}
                />
              </Field>

              {assessment.canApprove ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateApproval({
                        decision: "approved",
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
                        decidedOn: new Date().toISOString(),
                      })
                    }
                  >
                    Request changes
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Only the designated approver can make a decision on this submission.
                </p>
              )}
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
