import {
  PopoverContent,
  PopoverDefaultHeader,
  PopoverWrapper,
} from "@aventisia/ui/popover";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFetchMLModelVersions } from "../hooks/useFetchMLModelVersions";
import { useVersionPopoverStore } from "../stores/model-version-popover-store";
import { useMlModelVersionsStore } from "../stores/model-versions-store";
import { MLModelVersionsTrigger } from "./MLModelVersionsTrigger";
import { FVPopoverContent } from "./model-version-popover-content";

export const ModelVersions = () => {
  // Fetch  versions list data
  const [searchParams, setSearchParams] = useSearchParams();

  const mlModelId = searchParams.get("pid");
  const versionId = searchParams.get("v") || undefined;

  const { data, isLoading } = useFetchMLModelVersions(mlModelId || "");

  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useVersionPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  const { setVersion } = useMlModelVersionsStore(
    useShallow((state) => ({
      versionID: state.versionID,
      setVersion: state.setVersion,
    })),
  );

  //Set initial version to view as draft
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const versions = data.data;

      let selectedVersion = versions[0]; // default

      if (versionId) {
        const matched = versions.find((v) => v.id === versionId);
        if (matched) {
          selectedVersion = matched;
        }
      } else {
        searchParams.set("v", selectedVersion.id || "");
        setSearchParams(searchParams);
      }

      setVersion(selectedVersion.id || "", selectedVersion.versionNumber || 1);
    }
  }, [data?.data, searchParams, setSearchParams, setVersion, versionId]);

  return (
    <PopoverWrapper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
    >
      <MLModelVersionsTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className="ml-1 mt-1.5"
      >
        <PopoverDefaultHeader heading={"Versions"} />
        <FVPopoverContent
          modelVersionsList={data?.data}
          isLoading={isLoading}
        />
      </PopoverContent>
    </PopoverWrapper>
  );
};
