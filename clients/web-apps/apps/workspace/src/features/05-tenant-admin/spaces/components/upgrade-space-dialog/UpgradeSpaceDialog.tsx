import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader, DialogFooter } from "@avplatform/ui/dialog";

/** Marketing pricing page reached by the community upgrade CTA. */
const UPGRADE_PRICING_URL = `${import.meta.env.VITE_MARKETING_URL}/pricing`;

interface UpgradeSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog shown to community deployments when they try to create an additional space.
 * Explains that more spaces require a paid plan and routes the CTA to the pricing page.
 */
export const UpgradeSpaceDialog = ({ open, onOpenChange }: UpgradeSpaceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogDefaultHeader
          heading="Upgrade to create more spaces"
          description="Your community edition includes a single Central space."
        />

        {/* Explanation of why the upgrade is required */}
        <div className="space-y-2 p-3 text-sm text-muted-foreground">
          <p>
            Spaces let you scope resources, users, and agents across your organization. Upgrade to a
            paid plan to create additional spaces.
          </p>
        </div>

        {/* Dialog actions */}
        <DialogFooter className="flex gap-2 p-3 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <a
            href={UPGRADE_PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants()}
            onClick={() => onOpenChange(false)}
          >
            Upgrade
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
