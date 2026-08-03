import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { PrimaryCategoryType } from "@/features/action-selector/types/primary-category-type";
import { getFlowBlocks } from "@/features/flow-block/apis/flow-block-apis";
import { FLOW_BLOCK_QUERY_KEY } from "@/features/flow-block/constants";
import { createActivityJson } from "@/features/flow-block/utils/createActivityJson";

export const useGetBlockActions = () => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const versionId = queryParams.get("v") || "";

  const { data } = useQuery({
    queryKey: [FLOW_BLOCK_QUERY_KEY],
    queryFn: () => getFlowBlocks(versionId),
    enabled: !!versionId && import.meta.env.MODE !== "production",
  });

  // Get setActionSelectorData function from the store
  const { actionSelectorData, setActionSelectorData } = useNodeSelectorStore(
    useShallow((state) => ({
      setActionSelectorData: state.setActionSelectorData,
      actionSelectorData: state.actionSelectorData,
    })),
  );

  useEffect(() => {
    if (data?.data && import.meta.env.MODE !== "production") {
      const blockObj = createActivityJson(data?.data);

      if (blockObj.length > 0) {
        const actions = actionSelectorData.filter(
          (value: PrimaryCategoryType) => value.label !== "Blocks",
        );

        setActionSelectorData([...actions, ...blockObj]);
      }
    }
  }, [data?.data, setActionSelectorData]);
};
