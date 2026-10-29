import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { ArrowLeftIcon, ArrowRightIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";

import { GOVERNANCE_SECTIONS } from "../constants/governance-sections";
import { AgentRiskAssessmentDto } from "../dtos/agent-risk-assessment-dto";
import { useLoadAgentRiskRegistry } from "../hooks/useLoadAgentRiskRegistry";
import { useSaveAgentRiskRegistry } from "../hooks/useSaveAgentRiskRegistry";
import { useAiGovernanceStore, useSelectedAssessment } from "../stores/ai-governance-store";
import { GovernanceStepper } from "./GovernanceStepper";
import {
  AgentIdentitySection,
  AiModelsUsedSection,
  RiskTieringSection,
  RisksMitigationsSection,
  ThirdPartyToolsUsedSection,
  ValidationApprovalSection,
} from "./sections";

/**
 * Returns true when the given assessment is still the pristine seed created by
 * handleOpen (no human data and no saved record id). Used to decide whether the
 * wizard should hydrate from the backend on mount.
 */
const isPristineSeed = (a: AgentRiskAssessmentDto | undefined): boolean =>
  !!a &&
  a.id === "" &&
  !a.intendedUse &&
  !a.businessProcesses &&
  a.scopeScore === 0 &&
  a.dataSensitivityScore === 0 &&
  a.dependencyComplexityScore === 0 &&
  a.supervisoryImpactScore === 0;

/**
 * Validates the mandatory fields for a given wizard section.
 * Returns a warning message if a required field is incomplete, otherwise null.
 */
const validateSection = (id: number, a: AgentRiskAssessmentDto): string | null => {
  switch (id) {
    case 0:
      if (!a.intendedUse?.trim()) return "Please enter the Intended Use & Business Purpose.";
      if (!a.businessProcesses?.trim()) return "Please enter the Business Processes Affected.";
      return null;
    case 1:
      if (!a.scopeScore) return "Please select the Scope / Autonomy score.";
      if (!a.dataSensitivityScore) return "Please select the Data Sensitivity score.";
      if (!a.dependencyComplexityScore) return "Please select the Dependency Complexity score.";
      if (!a.supervisoryImpactScore)
        return "Please select the Supervisory / Regulatory Impact score.";
      return null;
    case 2:
      if (a.risks.some((r) => !r.name?.trim() || !r.mitigationPlan?.trim()))
        return "Each risk requires a name and a mitigation plan.";
      return null;
    case 3:
      if (a.aiModels.some((m) => !m.riskRating)) return "Each AI model requires a Risk Rating.";
      return null;
    case 4:
      return null;
    case 5:
      if (!a.approval?.isInformationAccurate)
        return "Please confirm that the information provided is accurate.";
      if (!a.approval?.requestedToName?.trim())
        return "Please select an approver to submit for approval.";
      return null;
    default:
      return null;
  }
};

/**
 * Validates every mandatory field across all six sections.
 * Returns the first warning message found, or null if the record is complete.
 */
const validateAllSections = (a: AgentRiskAssessmentDto): string | null => {
  for (const section of GOVERNANCE_SECTIONS) {
    const missing = validateSection(section.id, a);
    if (missing) return missing;
  }
  return null;
};

/**
 * Renders the active section body based on the current section id.
 */
const renderSection = (id: number) => {
  switch (id) {
    case 0:
      return <AgentIdentitySection />;
    case 1:
      return <RiskTieringSection />;
    case 2:
      return <RisksMitigationsSection />;
    case 3:
      return <AiModelsUsedSection />;
    case 4:
      return <ThirdPartyToolsUsedSection />;
    case 5:
      return <ValidationApprovalSection />;
    default:
      return null;
  }
};

/**
 * Main Agent Risk Registry wizard - breadcrumb + stepper sidebar + active
 * section + footer nav. Operates on the currently selected agent.
 */
export const AiGovernanceWizard = () => {
  const assessment = useSelectedAssessment();
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const activeSection = useAiGovernanceStore((state) => state.activeSection);
  const markSectionComplete = useAiGovernanceStore((state) => state.markSectionComplete);
  const setActiveSection = useAiGovernanceStore((state) => state.setActiveSection);
  const goToTable = useAiGovernanceStore((state) => state.goToTable);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const { mutate: save, isPending: isSaving } = useSaveAgentRiskRegistry();
  const { data: loaded, isFetching: isLoadingRecord } = useLoadAgentRiskRegistry(selectedAgentId);

  // Hydrate the selected agent's assessment from the backend when the current
  // in-memory assessment is missing (fresh page load) or still the pristine
  // seed (opened but not yet saved/edited). A real saved/edited assessment is
  // preserved so reopening doesn't clobber in-memory data with a stale
  // react-query cache.
  useEffect(() => {
    if (loaded && selectedAgentId && loaded.flowVersionId === selectedAgentId) {
      const current = useAiGovernanceStore.getState().assessments[selectedAgentId];
      if (!current || isPristineSeed(current)) {
        updateAssessment(selectedAgentId, loaded);
      }
    }
  }, [loaded, selectedAgentId, updateAssessment]);

  const currentIndex = GOVERNANCE_SECTIONS.findIndex((s) => s.id === activeSection);
  const isLast = currentIndex === GOVERNANCE_SECTIONS.length - 1;

  if (!assessment || !selectedAgentId) {
    return null;
  }

  if (isLoadingRecord) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    );
  }

  const handleNext = () => {
    // On the final step, validate ALL mandatory fields across every section.
    const missing = isLast
      ? validateAllSections(assessment)
      : validateSection(activeSection, assessment);
    if (missing) {
      // Persist the partial data silently so nothing is lost, but do not
      // advance and do not show a success toast (only the warning).
      save({ assessment, silent: true });
      toast.warning(missing);
      return;
    }
    // Persist and advance on a fully valid section.
    save({ assessment });
    markSectionComplete(activeSection);
    if (!isLast) {
      setActiveSection(GOVERNANCE_SECTIONS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveSection(GOVERNANCE_SECTIONS[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <GovernanceStepper />
      <main className="flex-1 px-12 py-8">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={goToTable}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Agent risk registry
        </button>

        {renderSection(activeSection)}

        <div className="mt-9 flex items-center justify-between border-t border-border pt-5">
          <Button variant="outline" onClick={handleBack} disabled={currentIndex <= 0}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={isSaving}>
            {isLast ? (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save &amp; Finish
              </>
            ) : (
              <>
                Save &amp; Continue
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};
