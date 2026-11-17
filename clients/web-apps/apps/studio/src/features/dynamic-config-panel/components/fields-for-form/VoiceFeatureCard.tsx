import { Switch } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { cn } from "@avplatform/ui/lib";
import { ReactNode, useId } from "react";
import { useController, useFormContext } from "react-hook-form";

type VoiceFeatureCardProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  toggleName?: string;
  toggleDescription?: string;
  fieldNames?: string[];
  children: ReactNode;
};

const FeatureToggle = ({
  name,
  labelledBy,
  describedBy,
}: {
  name: string;
  labelledBy: string;
  describedBy?: string;
}) => {
  const { field } = useController({ name });
  return (
    <Switch
      size="sm"
      checked={field.value === true}
      onCheckedChange={field.onChange}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    />
  );
};

/** "Configured" or "Not configured" for a switched-on feature; nothing while it is off. */
export const VoiceFeatureStatusBadge = ({
  enabled,
  configured,
}: {
  enabled: boolean;
  configured: boolean;
}) => {
  if (!enabled) return null;

  return configured ? (
    <Badge variant="completed">Configured</Badge>
  ) : (
    <Badge variant="review">Not configured</Badge>
  );
};

/** Renders one Voice Agent feature as a setting row (title, hint, switch); its body shows only while on. */
export const VoiceFeatureCard = ({
  title,
  description,
  badge,
  toggleName,
  toggleDescription,
  fieldNames = [],
  children,
}: VoiceFeatureCardProps) => {
  const { watch, formState } = useFormContext();
  const id = useId();
  const showBody = toggleName ? watch(toggleName) === true : true;
  const hint = toggleDescription || description;

  const hasError = fieldNames.some((name) => Boolean(formState.errors[name]));

  // IMPORTANT NOTE: configuration stays mounted in every toggle state so disabling a feature never
  // unmounts a field and drops its saved value from the flushed inputKeys; hidden is CSS-only.
  return (
    <Card>
      <CardHeader className="space-y-0 p-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle id={`${id}-title`} className="text-body-sm font-semibold">
                {title}
              </CardTitle>
              {badge}
              {hasError ? <Badge variant="destructive">Needs attention</Badge> : null}
            </div>
            {hint ? (
              <CardDescription id={`${id}-hint`} className="text-hint">
                {hint}
              </CardDescription>
            ) : null}
          </div>
          {toggleName ? (
            <FeatureToggle
              name={toggleName}
              labelledBy={`${id}-title`}
              describedBy={hint ? `${id}-hint` : undefined}
            />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={cn("border-t border-line p-4", !showBody && "hidden")}>
        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
};
