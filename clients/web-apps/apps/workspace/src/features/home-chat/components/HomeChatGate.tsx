import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { type ReactNode, Suspense } from "react";

import { useIsHomeChatAvailable } from "../hooks/useIsHomeChatAvailable.hook";
import { HomeChatSkeleton } from "./HomeChatSkeleton";

/** Shows a Home chat page once the user's roles resolve: a skeleton until then and while its code loads, nothing for users Home is not available to. */
export const HomeChatGate = ({ label, children }: { label: string; children: ReactNode }) => {
  const areRolesSelected = useBaseLayoutStore((state) => state.selectedRoles.length > 0);
  const isHomeChatAvailable = useIsHomeChatAvailable();
  const skeleton = <HomeChatSkeleton label={label} />;

  if (!areRolesSelected) return skeleton;
  if (!isHomeChatAvailable) return null;
  return <Suspense fallback={skeleton}>{children}</Suspense>;
};
