import { NavLink } from "react-router-dom";

interface JobsTableCellLinkProps {
  jobId: string;
  flowVersionId: string;
  flowName: string;
  flowVersionNumber: string;
}

export const JobsTableCellLink = ({
  jobId,
  flowVersionId,
  flowName,
  flowVersionNumber,
}: JobsTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}execution-log?v=${flowVersionId}&j=${jobId}`}
      className="group inline-flex h-auto w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary"
    >
      <span className="inline-flex items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary">
        <span>{flowName}</span>
        <span className="bg-slate-100 border group-hover:text-primary text-2xs rounded-xl px-1.5 py-[1px] text-muted-foreground">
          {flowVersionNumber}
        </span>
      </span>
    </NavLink>
  );
};
