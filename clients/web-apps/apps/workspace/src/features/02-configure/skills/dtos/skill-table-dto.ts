import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ComponentTypeEnum } from "../enums/component-type-enum";

/**
 * Represents a data transfer object (DTO) for a Skill entry.
 */
export interface SkillTableDto {
  id?: string;

  /**
   * Name of the skill (max 255 chars).
   */
  name: string;

  /**
   * Description of the skill.
   */
  description?: string;

   /**
     * Component type of the skill. Always Custom for user-created skills.
     */
    type: ComponentTypeEnum;

  /**
   * Access level of the skill record.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the skill is accessible to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Flag indicating whether the skill record is disabled.
   */
  isDisabled?: boolean;

  /**
   * Username of the user who created the skill record.
   */
  createdBy?: string;

  /**
   * Date and time when the skill record was created.
   */
  createdOn?: string;

  /**
   * Username of the user who last modified the skill record.
   */
  lastModifiedBy?: string;

  /**
   * Date and time when the skill record was last modified.
   */
  lastModifiedOn?: string;

  /**
   * Total number of files registered for this skill.
   */
  fileCount?: number;

  /**
   * Globally provided by the platform.
   */
  isGlobal?: boolean;

  /**
   * Active and available for use.
   */
  isActive?: boolean;
}
