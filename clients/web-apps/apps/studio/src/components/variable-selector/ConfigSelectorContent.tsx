import { GearSixIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { SelectorSearchList } from "./SelectorSearchList";

export const ConfigSelectorContent = () => {
  const { configVariables } = useReactFlowExtStore(
    useShallow((state) => ({
      configVariables: state.configVariables,
    })),
  );

  return (
    <SelectorSearchList
      items={configVariables}
      isConfigValue
      ItemIcon={GearSixIcon}
      placeholder="Search keys…"
      emptyTitle="No keys yet"
      emptyHint="Keys added to the key store appear here."
    />
  );
};
