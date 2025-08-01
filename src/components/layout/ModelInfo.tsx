import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

import { DotSeparator } from "@aventisia/ui";
import { useLocation } from "react-router-dom";

import { ModelNamesEnum } from "../enums/model-name-enum";

const ModelInfo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelName = queryParams.get("mn") || "";
  const modelType = queryParams.get("ml") || "";
  const { data } = useFetchModel();
  const badgeName =
    ModelNamesEnum[data?.data.type as keyof typeof ModelNamesEnum] ||
    ModelNamesEnum[modelType as keyof typeof ModelNamesEnum] ||
    "";
  return (
    <>
      <DotSeparator className="-mt-4 text-[2rem]" />
      <span
        className="mr-[0.6rem] truncate text-sm font-medium text-white mt-1 max-w-24"
        title={modelName}
      >
        {modelName}
      </span>
      {badgeName ? (
        <span className="mr-[0.6rem] truncate rounded-full border px-3 py-1 text-xs font-medium text-white mt-1">
          {badgeName}
        </span>
      ) : null}
    </>
  );
};

export default ModelInfo;
