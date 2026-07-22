import { formatDistanceToNow } from "date-fns";

interface IAutherCardProps {
  createdBy: string;
  createdOn: Date;
  lastModifiedBy: string;
  lastModifiedOn: Date;
}

export const AutherCard = ({
  createdBy,
  createdOn,
  lastModifiedBy,
  lastModifiedOn,
}: IAutherCardProps) => {
  const createdOnDistance = formatDistanceToNow(createdOn ? new Date(createdOn) : new Date(), {
    addSuffix: true,
  });

  const lastModifiedOnDistance = formatDistanceToNow(
    lastModifiedOn ? new Date(lastModifiedOn) : new Date(),
    {
      addSuffix: true,
    },
  );

  return (
    <div className="ml-1.5 space-y-2 pt-1 text-2xs text-muted-foreground">
      {createdBy === lastModifiedBy ? (
        <p className="space-x-1">
          <span>Created and modified by</span>
          <span className="-mb-[1px] text-sm lowercase text-foreground">{createdBy}</span>
          <span>created on</span>
          <span>{createdOnDistance}</span>
          <span>and last modified on</span>
          <span>{createdOnDistance}</span>
        </p>
      ) : (
        <>
          <p className="space-x-1">
            <span>Created by</span>
            <span className="-mb-[1px] text-sm lowercase text-foreground">{createdBy}</span>
            <span>{createdOnDistance}</span>
          </p>
          <p className="space-x-1">
            <span>Last modified by</span>
            <span className="-mb-[1px] text-sm lowercase text-foreground">{lastModifiedBy}</span>
            <span>{lastModifiedOnDistance}</span>
          </p>
        </>
      )}
    </div>
  );
};
