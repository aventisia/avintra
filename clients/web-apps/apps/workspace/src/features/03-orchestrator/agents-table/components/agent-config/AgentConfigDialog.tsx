import { useAgentConfigStore } from "../../stores/agent-config-store";
import { AgentConfigForm } from "./AgentConfigForm";

const AgentConfigDialog = () => {
  const open = useAgentConfigStore((state) => state.showDialog);

  return open ? <AgentConfigForm /> : null;
};

export default AgentConfigDialog;
