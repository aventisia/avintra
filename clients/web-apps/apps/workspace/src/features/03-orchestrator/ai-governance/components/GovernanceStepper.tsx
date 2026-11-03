import { cn } from "@avplatform/ui/lib";
import { CheckIcon } from "@phosphor-icons/react";

import { GOVERNANCE_SECTIONS } from "../constants/governance-sections";
import { AgentRiskTier } from "../enums/risk-tier-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../stores/ai-governance-store";
import { computeAgentRiskTier } from "../utils/tiering-engine";

const tierBadgeClass: Record<AgentRiskTier, string> = {
  [AgentRiskTier.Low]: "bg-ok/10 text-ok",
  [AgentRiskTier.Medium]: "bg-warn/10 text-warn",
  [AgentRiskTier.High]: "bg-bad/10 text-bad",
};

const tierLabel: Record<AgentRiskTier, string> = {
  [AgentRiskTier.Low]: "LOW RISK TIER",
  [AgentRiskTier.Medium]: "MEDIUM RISK TIER",
  [AgentRiskTier.High]: "HIGH RISK TIER",
};

/**
 * Left-hand stepper sidebar for the Agent Risk Registry wizard.
 * Renders the agent card (name + live tier badge) and the section nav with
 * completion checkmarks.
 */
export const GovernanceStepper = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const activeSection = useAiGovernanceStore((state) => state.activeSection);
  const completedSections = useAiGovernanceStore((state) => state.completedSections);
  const setActiveSection = useAiGovernanceStore((state) => state.setActiveSection);
  const assessment = useSelectedAssessment();

  const completedForAgent = selectedAgentId ? (completedSections[selectedAgentId] ?? {}) : {};
  const tier = assessment
    ? computeAgentRiskTier({
        scopeScore: assessment.scopeScore,
        dataSensitivityScore: assessment.dataSensitivityScore,
        dependencyComplexityScore: assessment.dependencyComplexityScore,
        supervisoryImpactScore: assessment.supervisoryImpactScore,
      })
    : null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-sunken p-5">
      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Agent risk registry
        </div>
      </div>

      {/* Agent card */}
      <div className="mb-6 rounded-lg border border-line bg-surface p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Evaluating</div>
        <div className="mt-1 truncate text-sm font-semibold">
          {assessment?.agentName || "Untitled Agent"}
        </div>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-bold tracking-wide",
            tier ? tierBadgeClass[tier] : "bg-muted text-muted-foreground",
          )}
        >
          {tier ? tierLabel[tier] : "Tier not yet assessed"}
        </div>
      </div>

      {/* Section nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {GOVERNANCE_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          const isComplete = !!completedForAgent[section.id];
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors",
                isActive
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px]",
                  isActive ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                {isComplete ? <CheckIcon className="h-3 w-3 text-ok" /> : section.id + 1}
              </span>
              <span className="truncate">{section.title}</span>
              <span className="ml-auto text-[9.5px] font-normal text-muted-foreground/70">
                {section.ref}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
