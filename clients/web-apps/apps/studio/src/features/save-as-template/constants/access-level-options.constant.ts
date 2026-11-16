import { BuildingsIcon, GlobeHemisphereWestIcon, type Icon } from "@phosphor-icons/react";

import { AccessTypeEnum } from "./access-type-enums ";

type AccessLevelOption = {
  value: keyof typeof AccessTypeEnum;
  title: string;
  description: string;
  Icon: Icon;
};

export const ACCESS_LEVEL_OPTIONS: AccessLevelOption[] = [
  {
    value: "TenantLevel",
    title: "Organization",
    description: "Only people in your organization can use it.",
    Icon: BuildingsIcon,
  },
  {
    value: "Public",
    title: "Public",
    description: "Listed for every organization once approved.",
    Icon: GlobeHemisphereWestIcon,
  },
];
