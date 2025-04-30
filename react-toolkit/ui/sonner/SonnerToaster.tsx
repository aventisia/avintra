import "@/react-toolkit/ui/sonner/sonner.css";

import { Toaster } from "sonner";

export const SonnerToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      richColors={true}
      expand={false}
      visibleToasts={5}
      closeButton={false}
      gap={10}
      toastOptions={{
        className: "sonner-toaster",
        duration: 5000,
      }}
    />
  );
};
