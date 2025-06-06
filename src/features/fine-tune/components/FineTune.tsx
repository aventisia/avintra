import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";

import DynamicTableContainer from "./DynamicTableContainer";

export const FineTune = () => {
  useLabelDataQueryKey();
  return <DynamicTableContainer />;
};
