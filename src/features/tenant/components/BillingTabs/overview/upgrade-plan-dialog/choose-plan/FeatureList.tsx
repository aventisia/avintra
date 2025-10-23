import { Check } from "lucide-react";

type FeatureListProps = {
  features: string[];
};

export const FeatureList = ({ features }: FeatureListProps) => {
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {features.map((label, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <div className="rounded-full bg-green-500 p-[2px]">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
};
