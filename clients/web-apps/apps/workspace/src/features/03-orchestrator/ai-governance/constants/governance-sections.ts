/**
 * Metadata for each wizard section, used to render the stepper sidebar.
 */
export interface GovernanceSection {
  /** Stable id (0-based index). */
  id: number;
  /** Display title. */
  title: string;
  /** Short descriptor shown in the sidebar. */
  ref: string;
}

export const GOVERNANCE_SECTIONS: GovernanceSection[] = [
  { id: 0, title: "Agent Identity", ref: "Baseline" },
  { id: 1, title: "Risk Tiering", ref: "Composite" },
  { id: 2, title: "Risks & Mitigations", ref: "Register" },
  { id: 3, title: "AI Models Used", ref: "Dependencies" },
  { id: 4, title: "Third-Party Tools Used", ref: "Dependencies" },
  { id: 5, title: "Validation & Approval", ref: "Lifecycle" },
];
