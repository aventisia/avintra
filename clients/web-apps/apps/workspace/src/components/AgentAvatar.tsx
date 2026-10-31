import { IconTile, type IconTileProps } from "@avplatform/ui/icon-tile";

import NewAgentIcon from "@/components/NewAgentIcon";

type AgentAvatarProps = Omit<IconTileProps, "Icon"> & {
  Icon?: IconTileProps["Icon"];
};

/**
 * Agent tile using the sidebar's agent icon on a light tint of the primary color.
 */
export const AgentAvatar = ({ Icon = NewAgentIcon, ...props }: AgentAvatarProps) => (
  <IconTile Icon={Icon} {...props} />
);
