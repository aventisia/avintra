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
      className={`mb-3 mt-6 hidden items-center justify-center overflow-hidden rounded-lg bg-slate-100 shadow-sm ${
        sidebarExpand ? "mx-4 flex" : "mx-3 hidden"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-3 px-6 py-6">
        <div className="w-[10rem] text-center text-base font-medium">Upgrade to PRO</div>
        <p className="w-[10rem] overflow-hidden text-center text-2xs">
          Ready to go beyond this free plan? Upgrade for premium features.
        </p>
        <Button className="mt-3 h-9 rounded-lg">Upgrade</Button>
      </div>
    </div>
  );
};

export { UpgradeCard };
