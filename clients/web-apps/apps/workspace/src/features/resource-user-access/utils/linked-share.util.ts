import { LinkedShareCandidateDto } from "../dtos/resource-user-access.dto";
import { ResourceTypeEnum } from "../enums/resource-type-enum";

const LINKED_ITEM_GROUPS: { resourceType: ResourceTypeEnum; label: string }[] = [
  { resourceType: ResourceTypeEnum.Queue, label: "Queues" },
  { resourceType: ResourceTypeEnum.ConfigStore, label: "Key stores" },
  { resourceType: ResourceTypeEnum.Tool, label: "Tools" },
  { resourceType: ResourceTypeEnum.KnowledgeBase, label: "Knowledge bases" },
  { resourceType: ResourceTypeEnum.Skill, label: "Skills" },
];

/**
 * Splits the linked items into the credentials block and the other item groups.
 */
export const groupLinkedShareCandidates = (candidates: LinkedShareCandidateDto[]) => ({
  credentials: candidates.filter(
    ({ resourceType }) => resourceType === ResourceTypeEnum.VaultCredential,
  ),
  groups: LINKED_ITEM_GROUPS.map(({ resourceType, label }) => ({
    label,
    rows: candidates.filter((candidate) => candidate.resourceType === resourceType),
  })).filter(({ rows }) => rows.length > 0),
});
