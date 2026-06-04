import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";

const RESOURCE_USER_KEY = "RESOURCE";

const resourceAccessOptions: {
  label: string;
  value: ResourceAccessTypeEnum;
  description: string;
}[] = [
  {
    label: "Owner",
    value: ResourceAccessTypeEnum.Owner,
    description: "Full ownership and management access",
  },
  {
    label: "Full Access",
    value: ResourceAccessTypeEnum.FullAccess,
    description: "Can perform all available actions",
  },
  {
    label: "Can View",
    value: ResourceAccessTypeEnum.View,
    description: "Can only view the resource",
  },
  //   {
  //     label: "Create",
  //     value: ResourceAccessTypeEnum.Create,
  //     description: "Can create new content",
  //   },
  {
    label: "Can  Edit",
    value: ResourceAccessTypeEnum.Edit,
    description: "Can modify existing content",
  },
  {
    label: "Can Delete",
    value: ResourceAccessTypeEnum.Delete,
    description: "Can remove content",
  },
];
export { RESOURCE_USER_KEY, resourceAccessOptions };
