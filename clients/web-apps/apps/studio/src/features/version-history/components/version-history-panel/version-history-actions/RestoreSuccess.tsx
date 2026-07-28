import { Link } from "react-router-dom";

interface Props {
  flowId: string;
  versionId: string;
}

export const RestoreSuccessToast = ({ flowId, versionId }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">Change restored successfully</span>

      <Link
        to={`/agents/${flowId}?v=${versionId}`}
        className="text-sm text-primary underline hover:opacity-80"
      >
        View restored version
      </Link>
    </div>
  );
};
