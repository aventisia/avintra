import { Toaster } from "sonner";

type SonnerToasterProps = {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
};

const SonnerToaster = ({ position = "bottom-right" }: SonnerToasterProps) => {
  return (
    <Toaster
      position={position}
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

export { SonnerToaster };
