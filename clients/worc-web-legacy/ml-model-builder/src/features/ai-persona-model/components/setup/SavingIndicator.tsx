import { Badge } from "@aventisia/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SavingIndicatorProps {
  isSaving: boolean;
  successDuration?: number; // Duration to show success icon in ms
}

const SavingIndicator: React.FC<SavingIndicatorProps> = ({
  isSaving,
  successDuration = 1000, // Default to 1 second
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let successTimer: NodeJS.Timeout;

    // When saving completes (isSaving changes from true to false)
    if (!isSaving) {
      // Show success icon
      setShowSuccess(true);

      // Set timer to hide success icon after specified duration
      successTimer = setTimeout(() => {
        setShowSuccess(false);
      }, successDuration);
    }

    // Cleanup timer on unmount or when isSaving changes
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [isSaving, successDuration]);

  // Don't render anything if not saving and success icon has disappeared
  if (!isSaving && !showSuccess) return null;

  return (
    <Badge
      variant={"outline"}
      className={`flex items-center gap-1 ${isSaving ? "bg-gray-100" : "bg-green-100"}`}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs text-muted-foreground">Saving data...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 text-success" />
          <span className="text-xs text-muted-foreground">Saved</span>
        </>
      )}
    </Badge>
  );
};

export default SavingIndicator;
