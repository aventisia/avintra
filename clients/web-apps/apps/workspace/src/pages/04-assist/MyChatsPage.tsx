import { Suspense, lazy } from "react";

// Lazy load the MyChatsLayout component.
const MyChatsLayout = lazy(() =>
  import("@/features/04-assist/my-chats/components/MyChatsLayout").then((module) => ({
    default: module.MyChatsLayout,
  })),
);

/**
 * Renders the MyChatsPage component.
 * @returns JSX element representing the MyChatsPage component.
 */
type LayoutMode = "page" | "popover";

export const MyChatsPage = ({ mode = "page" }: { mode?: LayoutMode }) => {
  return (
    <Suspense>
      <MyChatsLayout mode={mode} />
    </Suspense>
  );
};
