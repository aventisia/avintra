import { Button } from "@avplatform/ui/buttons";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

/**
 * `UpgradeCard` is a React functional component that displays a promotional card
 * encouraging users to upgrade to a premium plan. The card's visibility and layout
 * are dynamically controlled based on the `sidebarExpand` state from the `useBaseLayoutStore`.
 *
 * @returns A JSX element representing the upgrade card, which includes:
 * - A title prompting the user to upgrade.
 * - A description of the benefits of upgrading.
 * - An "Upgrade" button for initiating the upgrade process.
 *
 * The card is styled with Tailwind CSS classes and adjusts its layout based on the
 * `sidebarExpand` state.
 */
const UpgradeCard = () => {
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  return (
    <div
      className={`mb-3 mt-6 hidden overflow-hidden rounded-lg border border-line bg-surface ${
        sidebarExpand ? "mx-2 flex" : "mx-2 hidden"
      }`}
    >
      <div className="flex w-full flex-col gap-1 p-4">
        <div className="text-body font-semibold text-ink">Upgrade to PRO</div>
        <p className="text-hint text-muted-foreground">
          Ready to go beyond this free plan? Upgrade for premium features.
        </p>
        <Button className="mt-3 h-control-md w-full">Upgrade</Button>
      </div>
    </div>
  );
};

export { UpgradeCard };
