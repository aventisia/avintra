import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";

import { FineTuneTable } from "./fine-tune-table/FineTuneTable";

export const FineTune = () => {
  useLabelDataQueryKey();
  return <FineTuneTable />;
};
