import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { AgentRiskRegistryTable } from "@/features/03-orchestrator/ai-governance/components/AgentRiskRegistryTable";
import { AiGovernanceWizard } from "@/features/03-orchestrator/ai-governance/components/AiGovernanceWizard";
import { IssuesTable } from "@/features/03-orchestrator/ai-governance/components/IssuesTable";
import { useAiGovernanceStore } from "@/features/03-orchestrator/ai-governance/stores/ai-governance-store";

/**
 * Renders the Agent Risk Registry page.
 * Shows a registry table by default; clicking an agent name opens the
 * Agent Risk Registry wizard, and an Issues action opens the Issues table.
 * @returns JSX element representing the AiGovernancePage component.
 */
export const AiGovernancePage = () => {
  const view = useAiGovernanceStore((state) => state.view);
  const goToTable = useAiGovernanceStore((state) => state.goToTable);
  const location = useLocation();

  // Reset to the table view on any client-side navigation to this page (e.g.
  // clicking the sidebar menu item, even when already on this route). A full
  // page refresh keeps the persisted view (e.g. the wizard) so in-progress
  // work is not lost — React Router sets location.key to "default" on a fresh
  // load, and to a new random key on client-side navigation.
  const prevKey = useRef(location.key);
  useEffect(() => {
    if (prevKey.current !== location.key) {
      goToTable();
    }
    prevKey.current = location.key;
  }, [location.key, goToTable]);

  return (
    <Suspense fallback={<TableCNSkeleton />}>
      {view === "table" && <AgentRiskRegistryTable />}
      {view === "wizard" && <AiGovernanceWizard />}
      {view === "issues" && <IssuesTable />}
    </Suspense>
  );
};
