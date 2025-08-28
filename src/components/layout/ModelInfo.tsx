import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { useLocation } from "react-router-dom";

import { ModelNamesEnum } from "../enums/model-name-enum";

const ModelInfo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelName = queryParams.get("pn") || "";
  const modelType = queryParams.get("ml") || "";
  const { data } = useFetchProjectMetaData();
  const badgeName =
    ModelNamesEnum[data?.data.type as keyof typeof ModelNamesEnum] ||
    ModelNamesEnum[modelType as keyof typeof ModelNamesEnum] ||
    "";
  return (
    <div className="flex items-center ml-3 gap-3">
      <span className="rotate-12 text-white/50">/</span>
      <span
        className="mr-[0.6rem] truncate text-sm font-medium text-white mt-1 md:max-w-[50px] lg:max-w-[100px] xl:max-w-[182px]"
        title={modelName}
      >
        {modelName}
      </span>
      {badgeName ? (
        <span className="mr-[0.6rem] truncate rounded-full border px-3 py-1 text-xs font-medium text-white mt-1">
          {badgeName}
        </span>
      ) : null}
    </div>
  );
};

export default ModelInfo;
