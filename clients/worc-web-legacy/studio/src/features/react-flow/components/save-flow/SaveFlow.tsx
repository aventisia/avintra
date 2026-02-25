import { Button } from "@aventisia/ui/buttons";
import { useSaveFlow } from "../../hooks/useSaveFlow";
import { Loader2 } from "lucide-react";
import useUnsavedChanges from "../../hooks/useUnSavedChanges";

export default function SaveFlow() {
  const { isPending, saveData, isSavePending } = useSaveFlow();

  useUnsavedChanges({ isDirty: isSavePending });

  return (
    <Button
      disabled={!isSavePending}
      size={"xs"}
      className="mr-2.5 min-w-16 text-xs"
      onClick={() => saveData()}
    >
      {isPending ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        "Save"
      )}
    </Button>
  );
}
