import { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import { IconTile, type IconTileProps } from "@avplatform/ui/icon-tile";
import { DesktopIcon, LinuxLogoIcon, WindowsLogoIcon } from "@phosphor-icons/react";

const OS_ICONS = {
  [OsTypesEnum.Windows]: WindowsLogoIcon,
  [OsTypesEnum.Linux]: LinuxLogoIcon,
};

type MachineMarkProps = Omit<IconTileProps, "Icon"> & { os?: OsTypesEnum };

/**
 * Tile with the machine's operating system logo, or a desktop when the OS is unknown.
 */
export const MachineMark = ({ os, ...props }: MachineMarkProps) => (
  <IconTile Icon={(os && OS_ICONS[os]) || DesktopIcon} {...props} />
);
