import { Suspense, lazy } from "react";

const MyInterfacesLayout = lazy(() =>
  import("@/features/04-assist/my-interfaces/components/MyInterfacesLayout").then((module) => ({
    default: module.MyInterfacesLayout,
  })),
);

/**
 * Renders the UserInterfacesPage component.
 * @returns JSX element representing the UserInterfacesPage component.
 */
export const UserInterfacesPage = () => {
  return (
    <Suspense>
      <MyInterfacesLayout />
    </Suspense>
  );
};
