// import { RunReviewTableDTO } from "../dtos/run-review-table-dto";
import { format, isValid, parseISO } from "date-fns";

import { HistoryTableDTO } from "../dtos/history-table-dto";
import { useFetchFineTuneRecords } from "../hooks/useFetchFineTuneRecords";
import { useFetchHistoryRecords } from "../hooks/useFetchHistoryRecords";

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

const calculateAverageAccuracy = (records: HistoryTableDTO[]): string => {
  if (!Array.isArray(records)) return "---";

  const validAccuracies = records
    .map((r) => r.accuracy)
    .filter((a) => typeof a === "number" && !isNaN(a));

  if (validAccuracies.length === 0) return "---";

  const total = validAccuracies.reduce((sum, val) => sum + val, 0);
  const average = total / validAccuracies.length;

  return average.toFixed(2);
};

const getLastFineTunedDate = (records: HistoryTableDTO[]): string => {
  if (!Array.isArray(records)) return "---";

  const validDates = records
    .map((r) => {
      if (typeof r.fineTunedOn === "string") {
        const date = parseISO(r.fineTunedOn);
        return isValid(date) ? date : null;
      }
      return null;
    })
    .filter((d): d is Date => d !== null);

  if (validDates.length === 0) return "---";

  const latestDate = validDates.reduce((latest, current) =>
    current > latest ? current : latest,
  );

  return format(latestDate, "dd/MM/yyyy, HH:mm:ss");
};

const FineTuneStats = () => {
  const { data } = useFetchFineTuneRecords();
  const { data: historyRecords } = useFetchHistoryRecords();
  const records = data?.data ?? [];
  const history = historyRecords?.data ?? [];

  const totalCount = records.length;
  const avgAccuracy = calculateAverageAccuracy(history);
  const lastFineTuned = getLastFineTunedDate(history);

  return (
    <div className="grid grid-cols-3 items-center justify-between gap-4">
      <StatCard label="Total Volumes" value={totalCount} />
      <StatCard label="Current Model Accuracy" value={`${avgAccuracy}%`} />
      <StatCard label="Last Fine-Tuned" value={lastFineTuned} />
    </div>
  );
};

export default FineTuneStats;
