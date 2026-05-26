import { Separator } from "@radix-ui/react-separator";
import { formatDistanceToNow } from "date-fns";

interface IAddedByAutherCardProps {
  addedBy: string;
  addedOn: Date;
  lastModifiedBy: string;
  lastModifiedOn: Date;
}

export const AddedByAutherCard = ({
  addedBy,
  addedOn,
  lastModifiedBy,
  lastModifiedOn,
}: IAddedByAutherCardProps) => {
  const addedOnDistance = formatDistanceToNow(
    addedOn ? new Date(addedOn) : new Date(),
    {
      addSuffix: true,
    },
  );

  const lastModifiedOnDistance = formatDistanceToNow(
    lastModifiedOn ? new Date(lastModifiedOn) : new Date(),
    {
      addSuffix: true,
    },
  );

  return (
    <div className="!mt-10 ml-1.5 space-y-2 pt-1 text-2xs text-muted-foreground">
      <Separator />
      {addedBy === lastModifiedBy ? (
        <p className="space-x-1">
          <span>Added and modified by</span>
          <span className="-mb-[1px] text-sm lowercase text-foreground">
            {addedBy}
          </span>
          <span>added on</span>
          <span>{addedOnDistance}</span>
          <span>and last modified on</span>
          <span>{addedOnDistance}</span>
        </p>
      ) : (
        <>
          <p className="space-x-1">
            <span>Added by</span>
            <span className="-mb-[1px] text-sm lowercase text-foreground">
              {addedBy}
            </span>
            <span>{addedOnDistance}</span>
          </p>
          <p className="space-x-1">
            <span>Last modified by</span>
            <span className="-mb-[1px] text-sm lowercase text-foreground">
              {lastModifiedBy}
            </span>
            <span>{lastModifiedOnDistance}</span>
          </p>
        </>
      )}
    </div>
  );
};
