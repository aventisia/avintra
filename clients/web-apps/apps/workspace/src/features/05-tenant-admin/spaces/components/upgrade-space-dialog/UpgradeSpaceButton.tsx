import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { UpgradeSpaceDialog } from "./UpgradeSpaceDialog";

/**
 * Spaces toolbar button for community deployments.
 *
 * Mirrors the shared DTCreateButton exactly (icon, size, styling, and label) so it sits
 * identically in the toolbar, but its action opens the upgrade dialog instead of the
 * create-space dialog.
 */
export const UpgradeSpaceButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        size={"xs"}
        className={cn("gap-2 text-sm tracking-wide")}
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusIcon className="h-4 w-4" />
        Create Space
      </Button>

      <UpgradeSpaceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};
