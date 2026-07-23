import { UpdateBanner } from "@avplatform/tauri-utils";
import { IS_TAURI } from "@avplatform/ui/constants";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

const banners: Record<string, React.ReactNode> = {
  update: IS_TAURI ? <UpdateBanner /> : null,
  warning: <div>warning</div>, // TODO: Replace with actual warning banner component
  info: <div>info</div>, // TODO: Replace with actual info banner component
};

const AppBanner: React.FC = () => {
  const { appBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      appBanner: state.appBanner,
    })),
  );

  return typeof appBanner === "string" ? (banners[appBanner] ?? null) : null;
};

export default AppBanner;
