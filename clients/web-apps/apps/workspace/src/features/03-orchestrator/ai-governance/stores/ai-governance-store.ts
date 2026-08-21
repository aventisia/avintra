import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AgentRiskAssessmentDto } from "../dtos/agent-risk-assessment-dto";
import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";

/**
 * Creates a fresh, empty agent risk assessment record.
 */
export const createEmptyAssessment = (): AgentRiskAssessmentDto => ({
  id: "",
  flowVersionId: "",
  flowId: "",
  agentName: "",
  agentType: "",
  versionNumber: 0,
  publishedOn: "",
  isConsumerFacing: false,
  intendedUse: "",
  businessProcesses: "",
  scopeScore: 0,
  dataSensitivityScore: 0,
  dependencyComplexityScore: 0,
  supervisoryImpactScore: 0,
  compositeTier: null,
  tierJustification: "",
  oversightModel: "",
  status: RiskLifecycleStatus.NotAssessed,
  lastValidationDate: "",
  nextReviewDate: "",
  validatorUserId: "",
  aiModels: [],
  thirdPartyTools: [],
  skills: [],
  knowledgeBases: [],
  risks: [],
  approval: {
    isSubmitted: false,
    requestedToUserId: "",
    requestedToName: "",
    requestedOn: "",
    decision: "pending",
    decidedBy: "",
    decidedOn: "",
    decisionNotes: "",
    exceptions: [],
  },
  issues: [],
});

/** View mode of the Agent Risk Registry page. */
export type RegistryView = "table" | "wizard" | "issues";

interface AiGovernanceState {
  /** Per-agent assessments, keyed by flowVersionId. */
  assessments: Record<string, AgentRiskAssessmentDto>;
  /** Current view mode. */
  view: RegistryView;
  /** Currently selected agent's flowVersionId (null when viewing the table). */
  selectedAgentId: string | null;
  /** Currently active wizard section id. */
  activeSection: number;
  /** Sections that have been completed (marked with a check), per agent. */
  completedSections: Record<string, Record<number, boolean>>;

  /** Selects an agent and opens the wizard. */
  openAgent: (assessment: AgentRiskAssessmentDto) => void;
  /** Opens the Issues & Violations table for a given agent. */
  openIssues: (flowVersionId: string) => void;
  /** Returns to the registry table view. */
  goToTable: () => void;
  /** Updates the assessment for a given agent. */
  updateAssessment: (flowVersionId: string, assessment: AgentRiskAssessmentDto) => void;
  /** Sets the in-memory list of assessments loaded from the backend. */
  setAssessments: (assessments: Record<string, AgentRiskAssessmentDto>) => void;
  setActiveSection: (id: number) => void;
  markSectionComplete: (id: number) => void;
  markSectionIncomplete: (id: number) => void;
}

export const useAiGovernanceStore = create<AiGovernanceState>()(
  persist(
    (set, get) => ({
      assessments: {},
      view: "table",
      selectedAgentId: null,
      activeSection: 0,
      completedSections: {},

      openAgent: (assessment) =>
        set((state) => ({
          selectedAgentId: assessment.flowVersionId,
          view: "wizard",
          activeSection: 0,
          assessments: { ...state.assessments, [assessment.flowVersionId]: assessment },
        })),

      openIssues: (flowVersionId) => set({ view: "issues", selectedAgentId: flowVersionId }),

      goToTable: () => set({ view: "table", selectedAgentId: null }),

      updateAssessment: (flowVersionId, assessment) =>
        set((state) => ({
          assessments: { ...state.assessments, [flowVersionId]: assessment },
        })),

      setAssessments: (assessments) => set({ assessments }),

      setActiveSection: (id) => set({ activeSection: id }),

      markSectionComplete: (id) =>
        set((state) => {
          const agentId = get().selectedAgentId;
          if (!agentId) return state;
          return {
            completedSections: {
              ...state.completedSections,
              [agentId]: { ...state.completedSections[agentId], [id]: true },
            },
          };
        }),

      markSectionIncomplete: (id) =>
        set((state) => {
          const agentId = get().selectedAgentId;
          if (!agentId) return state;
          const agentSections = { ...(state.completedSections[agentId] ?? {}) };
          delete agentSections[id];
          return {
            completedSections: { ...state.completedSections, [agentId]: agentSections },
          };
        }),
    }),
    {
      name: "ai-governance",
      storage: createJSONStorage(() => localStorage),
      // Persist the navigation state (which agent/section is open) AND the
      // in-memory assessments so a page refresh keeps the user in the form
      // with their partial data intact. The wizard's hydration guard preserves
      // this in-memory data over the backend, so nothing is lost on refresh.
      partialize: (state) => ({
        view: state.view,
        selectedAgentId: state.selectedAgentId,
        activeSection: state.activeSection,
        completedSections: state.completedSections,
        assessments: state.assessments,
      }),
    },
  ),
);

/**
 * Selector helper: returns the assessment for the currently selected agent.
 */
export const useSelectedAssessment = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const assessments = useAiGovernanceStore((state) => state.assessments);
  return selectedAgentId ? assessments[selectedAgentId] : undefined;
};
