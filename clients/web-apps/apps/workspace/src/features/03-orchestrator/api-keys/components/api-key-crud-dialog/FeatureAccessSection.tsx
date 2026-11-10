import { Switch } from "@avplatform/ui";
import { Controller, useFormContext } from "react-hook-form";

import { API_KEY_PERMISSION_ITEMS } from "../../constants/api-key-permissions.constant";

/**
 * Feature access toggles for an API key, one row per permission.
 */
export const FeatureAccessSection = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-[12.5px] font-semibold text-ink-2">Feature access</p>
        <p className="text-[12px] text-muted-foreground">Choose which features this key can use.</p>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-md bg-sunken/80 ring-1 ring-line">
        {API_KEY_PERMISSION_ITEMS.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-3.5 py-3">
            <label htmlFor={`permission-${item.id}`} className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink">{item.label}</span>
              <span className="block text-[12px] text-muted-foreground">{item.description}</span>
            </label>

            <Controller
              name={`permissions.${item.id}`}
              control={control}
              render={({ field }) => (
                <Switch
                  id={`permission-${item.id}`}
                  size="sm"
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
