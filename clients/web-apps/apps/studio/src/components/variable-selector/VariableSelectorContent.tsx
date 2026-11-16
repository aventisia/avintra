import { BracketsCurlyIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { SelectorSearchList } from "./SelectorSearchList";

export const VariableSelectorContent = () => {
  const { flowVariablesObject } = useReactFlowExtStore(
    useShallow((state) => ({
      flowVariablesObject: state.flowVariablesObject,
    })),
  );

  const variables = useMemo(
    () => [...new Set(flowVariablesObject.flatMap((item) => item.outputs))],
    [flowVariablesObject],
  );

  return (
    <SelectorSearchList
      items={variables}
      ItemIcon={BracketsCurlyIcon}
      placeholder="Search variables…"
      emptyTitle="No variables yet"
      emptyHint="Outputs from earlier nodes and flow inputs appear here."
    />
  );
};
