import { LicenseTypesEnum } from '@/react-toolkit/enums/license-types-enum';

/**
 * Represents a data transfer object (DTO) for a license.
 */
export interface LicensesTableDto {
  /**
   * Gets or sets the primary key of the license record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the type of the license.
   */
  type: LicenseTypesEnum; // TODO: Update enum values

  /**
   * Gets or sets the name of the license. Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the license. Max-500
   */
  description?: string;

  /**
   * Gets or sets the number of flows in the license.
   */
  flowCount?: number;

  /**
   * Gets or sets a flag indicating whether the license record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the license record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the license record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the license record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the license record was last modified.
   */
  lastModifiedOn?: Date;
}
