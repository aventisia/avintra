import { CheckIcon } from "@phosphor-icons/react";

type FeatureListProps = {
  features: string[];
};

export const FeatureList = ({ features }: FeatureListProps) => {
  return (
    <ul className="text-sm mt-2 space-y-1">
      {features.map((label, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <div className="rounded-full bg-ok p-[2px]">
            <CheckIcon className="h-3 w-3 text-bg" />
          </div>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
};
