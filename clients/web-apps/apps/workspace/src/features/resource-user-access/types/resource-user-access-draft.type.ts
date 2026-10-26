import { ResourceUserAccessDto } from "../dtos/resource-user-access.dto";
import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";

export type SharePerson = {
  userId: string;
  name: string;
  email: string;
};

export type ShareInvite = {
  person: SharePerson;
  role: ResourceAccessTypeEnum;
};

export type ShareChange = "kept" | "added" | "edited" | "removed";

export type ShareRow = {
  key: string;
  person: SharePerson;
  role: ResourceAccessTypeEnum;
  change: ShareChange;
  isYou: boolean;
  share?: ResourceUserAccessDto;
};
