import { Skeleton } from "@avplatform/ui";

interface InputDivElementProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  headingForInput: string;
  showSkelaton?: boolean;
  isRequired?: boolean;
  messageForInput: string;
}

export function InputDivElement({
  headingForInput,
  messageForInput,
  showSkelaton = false,
  isRequired = false,
  children,
}: Readonly<InputDivElementProps>) {
  return (
    <div className="mt-5 block flex-col pt-5 first:mt-0 first:pt-0 sm:flex xl:flex-row xl:items-center">
      <label className="mb-2 inline-block sm:mb-0 sm:mr-5 sm:text-right xl:mr-14 xl:w-60">
        <div className="text-left">
          <div className="flex items-center">
            <div className="text-sm font-medium text-ink">
              {headingForInput}
              {isRequired && <span className="font-medium text-bad"> *</span>}
            </div>
          </div>
          <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground xl:mt-3">
            {messageForInput}
          </div>
        </div>
        {""}
      </label>
      <div className="mt-3 w-full flex-1 xl:mt-0">
        {showSkelaton ? (
          <Skeleton className="box mt-3 flex h-10 w-full flex-1 xl:mt-0" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
