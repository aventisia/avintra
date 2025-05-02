import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";

import { Button } from "@aventisia/ui/buttons";

const UpgradeCard = () => {
  const { sidebarExpand } = useBaseLayoutStore();

  return (
    <div
      className={`mb-3 mt-6 items-center justify-center overflow-hidden rounded-lg bg-slate-100 shadow-sm ${
        sidebarExpand ? "mx-4 flex" : "mx-3 hidden"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-3 px-6 py-6">
        <div className="w-[10rem] text-center text-base font-medium">
          Upgrade to PRO
        </div>
        <p className="w-[10rem] overflow-hidden text-center text-2xs">
          Ready to go beyond this free plan? Upgrade for premium features.
        </p>
        <Button className="mt-3 h-9 rounded-lg">Upgrade</Button>
      </div>
    </div>
  );
};

export { UpgradeCard };
