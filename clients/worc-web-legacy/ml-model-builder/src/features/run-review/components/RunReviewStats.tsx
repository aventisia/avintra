import { RunReviewTableDTO } from "../dtos/run-review-table-dto";
import { useFetchRunReviewRecords } from "../hooks/useFetchRunReviewRecords";

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="border border-dashed p-3 bg-white rounded-lg shadow-sm flex flex-col ">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-base">{value}</p>
  </div>
);

const countBy = (
  data: RunReviewTableDTO[],
  predicate: (item: RunReviewTableDTO) => boolean,
): number => {
  if (!data) return 0;
  return data.reduce((acc, item) => (predicate(item) ? acc + 1 : acc), 0);
};

const RunReviewStats = () => {
  const { data } = useFetchRunReviewRecords();
  const records = data?.data ?? [];

  const totalCount = records.length;
  const reviewedCount = countBy(
    records,
    (item) => item.status.toLowerCase() === "reviewed",
  );
  const submittedForFineTuningCount = countBy(
    records,
    (item) => item.submitForFineTuning,
  );
  const pendingReviewCount = totalCount - reviewedCount;

  return (
    <div className="grid grid-cols-4 items-center justify-between gap-4">
      <StatCard label="Total Volumes" value={totalCount} />
      <StatCard label="Reviewed" value={reviewedCount} />
      <StatCard label="Pending Review" value={pendingReviewCount} />
      <StatCard
        label="Submitted for fine tuning"
        value={submittedForFineTuningCount}
      />
    </div>
  );
};

export default RunReviewStats;
