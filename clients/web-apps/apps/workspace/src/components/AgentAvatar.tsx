import { cn } from "@avplatform/ui/lib";

import NewAgentIcon from "@/components/NewAgentIcon";

const SIZES = {
  xs: "size-6 rounded-md [&>svg]:size-3.5",
  sm: "size-7 rounded-lg [&>svg]:size-4",
  md: "size-8 rounded-[10px] [&>svg]:size-[18px]",
  lg: "size-9 rounded-xl [&>svg]:size-5",
  xl: "size-10 rounded-xl [&>svg]:size-[22px]",
} as const;

interface AgentAvatarProps {
  size?: keyof typeof SIZES;
  className?: string;
  Icon?: React.ComponentType;
}

/**
 * Agent tile using the sidebar's agent icon on a light tint of the primary color.
 */
export const AgentAvatar = ({ size = "md", className, Icon = NewAgentIcon }: AgentAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-grid shrink-0 place-items-center bg-sunken text-ink-2 ring-1 ring-inset ring-line",
      SIZES[size],
      className,
    )}
  >
    <Icon />
  </span>
);
