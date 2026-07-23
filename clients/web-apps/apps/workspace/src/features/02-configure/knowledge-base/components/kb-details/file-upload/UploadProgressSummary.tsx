interface UploadProgressSummaryProps {
  completedCount: number;
  totalCount: number;
  activeFileName?: string;
  activeStageMessage?: string;
}

/** Shows overall upload progress and the currently active file's stage */
export const UploadProgressSummary = ({
  completedCount,
  totalCount,
  activeFileName,
  activeStageMessage,
}: UploadProgressSummaryProps) => (
  <div className="rounded-lg bg-primary-50 p-3 border border-primary-200">
    <p className="text-xs font-medium text-primary">
      Progress: {completedCount}/{totalCount} completed
    </p>
    {activeFileName && (
      <p className="text-xs text-primary mt-1">
        {activeFileName} - {activeStageMessage}
      </p>
    )}
  </div>
);
