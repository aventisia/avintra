import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";
import { UpdateBanner } from "./UpdateBanner";

const banners: Record<string, React.ReactNode> = {
  update: <UpdateBanner />,
  warning: <div>warning</div>, // TODO: Replace with actual warning banner component
  info: <div>info</div>, // TODO: Replace with actual info banner component
};

const AppHeader: React.FC = () => {
  const { appBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      appBanner: state.appBanner,
    })),
  );

  return typeof appBanner === "string" ? (banners[appBanner] ?? null) : null;
};

export default AppHeader;
