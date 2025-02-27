import "@/react-toolkit/styles/sonner.css";
import { Toaster } from "sonner";

export const ToasterExt = () => {
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
