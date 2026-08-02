import { Switch } from "@avplatform/ui";
import { Controller, useFormContext } from "react-hook-form";

import { API_KEY_PERMISSION_ITEMS } from "../../constants/api-key-permissions.constant";

interface FeatureAccessSectionProps {
  disabled?: boolean;
}

/**
 * Renders the feature access toggles using the card-style layout from the design sample.
 */
export const FeatureAccessSection = ({ disabled }: FeatureAccessSectionProps) => {
  const { control } = useFormContext();

  return (
    <div className="max-w-xl mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h3 className="text-md font-medium leading-5 text-slate-900">Feature Access</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Enable or disable specific features for this key.
        </p>
      </div>

      <ul className="divide-y divide-slate-200">
        {API_KEY_PERMISSION_ITEMS.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-sm font-medium text-slate-900">{item.label}</span>
              <span className="text-xs text-slate-500">{item.description}</span>
            </div>

            <Controller
              name={`permissions.${item.id}`}
              control={control}
              render={({ field }) => (
                <Switch
                  size="base"
                  disabled={disabled}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
