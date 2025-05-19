import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

import { DotSeparator } from "@aventisia/ui";
import { useLocation } from "react-router-dom";

import { ModelTypesEnum } from "../enums/model-type-enum";

const ModelInfo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelName = queryParams.get("mn") || "";
  const { data } = useFetchModel();
  return (
    <>
      <DotSeparator className="-mt-4 text-[2rem]" />
      <span className="mr-[0.6rem] truncate text-sm font-medium text-white">
        {modelName}
      </span>
      <span className="mr-[0.6rem] truncate rounded-full border px-3 py-1 text-xs font-medium text-white">
        {ModelTypesEnum[data?.data.type as keyof typeof ModelTypesEnum]}
      </span>
    </>
  );
};

export default ModelInfo;
