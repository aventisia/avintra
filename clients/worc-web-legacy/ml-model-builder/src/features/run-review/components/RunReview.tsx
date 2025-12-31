import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";

import { RunReviewTable } from "./run-review-table/RunReviewTable";

export const RunReview = () => {
  useLabelDataQueryKey();
  return <RunReviewTable />;
};
