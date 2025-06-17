import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";

import { DynamicTableContainer } from "./DynamicTableContainer.tsx";

export const FineTune = () => {
  useLabelDataQueryKey();
  return <DynamicTableContainer />;
};
