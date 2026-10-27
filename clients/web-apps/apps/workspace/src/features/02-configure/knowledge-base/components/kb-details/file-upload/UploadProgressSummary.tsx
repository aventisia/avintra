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
  <div className="rounded-lg bg-selected p-3 border border-line">
    <p className="text-xs font-medium text-primary-text">
      Progress: {completedCount}/{totalCount} completed
    </p>
    {activeFileName && (
      <p className="text-xs text-primary-text mt-1">
        {activeFileName} - {activeStageMessage}
      </p>
    )}
  </div>
);
