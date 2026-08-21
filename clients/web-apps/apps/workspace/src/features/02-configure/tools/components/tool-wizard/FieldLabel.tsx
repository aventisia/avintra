import { FieldHelpPopover } from "@avplatform/ui/form";

/**
 * Standalone field label with an optional "i" markdown help popover.
 *
 * Unlike `FormLabelExt`, this does NOT use react-hook-form's `FormLabel`
 * (which calls `useFormContext()`). The ToolWizard steps render their fields
 * with plain state, not a `FormProvider`, so using `FormLabelExt` there throws
 * "Cannot destructure property 'getFieldState' of useFormContext(...) as null".
 * This component renders a plain `<label>` plus the `FieldHelpPopover` content.
 */
const FieldLabel = ({
  label,
  isRequired,
  description,
}: {
  label: string;
  isRequired?: boolean;
  description?: string;
}) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium">
        {label}
        {isRequired ? <span className="text-destructive"> *</span> : null}
      </span>
      {description ? <FieldHelpPopover content={description} /> : null}
    </div>
  );
};

export { FieldLabel };
