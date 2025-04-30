import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

/**
 * Renders a dropdown menu component and StopPropagationWrapper around it.
 */
export const DropdownMenu = ({
  children,
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) => {
  return (
    <StopPropagationWrapper>
      <DropdownMenuPrimitive.Root>{children}</DropdownMenuPrimitive.Root>
    </StopPropagationWrapper>
  );
};
