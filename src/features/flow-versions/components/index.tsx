import {
  PopoverWrapper,
  PopoverContent,
  PopoverDefaultHeader,
} from "@aventisia/ui/popover";
import { FlowVersionsTrigger } from "./FlowVersionsTrigger";
import { FVPopoverContent } from "./flow-version-popover-content";
import { useFetchFlowVersions } from "../hooks/useFetchFlowVersions";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useFlowVersionPopoverStore } from "../stores/flow-version-popover-store";

export const FlowVersions = () => {
  // Fetch flow versions list data

  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f");
  const versionId = queryParams.get("v") || undefined;
  const { data, isLoading } = useFetchFlowVersions(flowId || "");
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useFlowVersionPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  const { setVersion } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionID: state.versionID,
      setVersion: state.setVersion,
    })),
  );

  // Get global store state & actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  //Set initial version to view as draft
  useEffect(() => {
    if (data?.data) {
      let selectedVersion = data?.data[0]; // default to first item
      if (versionId) {
        const matched = data?.data.find((v) => v.id === versionId);
        if (matched) {
          selectedVersion = matched;
        }
      }

      setVersion(
        selectedVersion.id || "",
        selectedVersion.versionNumber || null,
      );
    }
  }, [data?.data, versionId, setVersion, currentFlow]);

  return (
    <PopoverWrapper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
    >
      <FlowVersionsTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className="ml-1 mt-1.5"
      >
        <PopoverDefaultHeader heading={"Versions"} />
        <FVPopoverContent flowVersionsList={data?.data} isLoading={isLoading} />
      </PopoverContent>
    </PopoverWrapper>
  );
};
