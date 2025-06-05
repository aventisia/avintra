// import { RunReviewTableDTO } from "../dtos/run-review-table-dto";
import { useFetchFineTuneRecords } from "../hooks/useFetchFineTuneRecords";

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

// const countBy = (
//   data: RunReviewTableDTO[],
//   predicate: (item: RunReviewTableDTO) => boolean,
// ): number => {
//   if (!data) return 0;
//   return data.reduce((acc, item) => (predicate(item) ? acc + 1 : acc), 0);
// };

const FineTuneStats = () => {
  const { data } = useFetchFineTuneRecords();
  const records = data?.data ?? [];

  const totalCount = records.length;

  return (
    <div className="grid grid-cols-3 items-center justify-between gap-4">
      <StatCard label="Total Volumes" value={totalCount} />
      <StatCard label="Current Model Accuracy" value={"---"} />
      <StatCard label="Last Fine-Tuned" value={"---"} />
    </div>
  );
};

export default FineTuneStats;
