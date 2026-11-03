import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import { Button } from "@/ui/components/buttons";

type UpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Full title shown in the upgrade dialog. */
  title?: string;
  /** Full description shown in the upgrade dialog. */
  description?: string;
  pricingUrl?: string;
  /** In-app route to open instead of the external pricing page. */
  upgradePath?: string;
};

export const UpgradeDialog = ({
  open,
  onOpenChange,
  title = "Upgrade to unlock",
  description = "Upgrade now to access this feature and unlock more capabilities.",
  pricingUrl,
  upgradePath,
}: UpgradeDialogProps) => {
  const navigate = useNavigate();
  const [showPricingFallback, setShowPricingFallback] = useState(false);
  const hasPricingUrl = Boolean(pricingUrl && /^https?:\/\//i.test(pricingUrl));

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setShowPricingFallback(false);
    onOpenChange(nextOpen);
  };

  const handleUpgrade = () => {
    if (upgradePath) {
      onOpenChange(false);
      navigate(upgradePath);
      return;
    }

    if (!pricingUrl) {
      return;
    }

    try {
      const pricingWindow = window.open(pricingUrl, "_blank");

      if (pricingWindow) {
        pricingWindow.opener = null;
        onOpenChange(false);
        return;
      }
    } catch {
      setShowPricingFallback(true);
      return;
    }

    setShowPricingFallback(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className=" gap-5">
        <Button
          type="button"
          variant="ghost"
          size="icon8"
          className="absolute right-3 top-3"
          aria-label="Close upgrade dialog"
          onClick={() => onOpenChange(false)}
        >
          <XIcon aria-hidden="true" className="h-4 w-4" />
        </Button>
        <AlertDialogHeader className="pr-7">
          <AlertDialogTitle className="break-words">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {showPricingFallback && hasPricingUrl && (
          <p role="status" className="break-all text-sm text-muted-foreground">
            Pricing did not open. Visit{" "}
            <a href={pricingUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {pricingUrl}
            </a>
            .
          </p>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Not now</AlertDialogCancel>
          {(hasPricingUrl || Boolean(upgradePath)) && (
            <Button type="button" onClick={handleUpgrade}>
              Upgrade
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
