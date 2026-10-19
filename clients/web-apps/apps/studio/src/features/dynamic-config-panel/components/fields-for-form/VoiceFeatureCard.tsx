import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { SwitchField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

type VoiceFeatureCardProps = {
  title: string;
  description: string;
  badge?: ReactNode;
  toggleName?: string;
  toggleLabel?: string;
  toggleDescription?: string;
  fieldNames?: string[];
  children: ReactNode;
};

/** Renders one Voice Agent feature card whose persisted On/Off toggle is the only enable control. */
export const VoiceFeatureCard = ({
  title,
  description,
  badge,
  toggleName,
  toggleLabel = "",
  toggleDescription = "",
  fieldNames = [],
  children,
}: VoiceFeatureCardProps) => {
  const { watch, formState } = useFormContext();
  const showBody = toggleName ? watch(toggleName) === true : true;

  const hasError = fieldNames.some((name) => Boolean(formState.errors[name]));

  const header = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          {badge}
          {hasError ? <Badge variant="destructive">Needs attention</Badge> : null}
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </div>
    </div>
  );

  const toggleRow = toggleName ? (
    <div className="mt-3">
      <SwitchField
        name={toggleName}
        label={toggleLabel}
        description={toggleDescription}
        size="sm"
        showBorder={false}
      />
    </div>
  ) : null;

  // IMPORTANT NOTE: configuration stays mounted in every toggle state so disabling a feature never
  // unmounts a field and drops its saved value from the flushed inputKeys; hidden is CSS-only.
  return (
    <Card>
      <CardHeader className="space-y-0 p-4">
        {header}
        {toggleRow}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={cn("space-y-3 pt-3", !showBody && "hidden")}>{children}</div>
      </CardContent>
    </Card>
  );
};
