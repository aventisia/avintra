/**
 * Represents a data transfer object (DTO) for a user.
 */
export interface UsersTableDto {
    /**
     * Gets or sets the primary key of the user record.
     *
     * Not making it required because same DTO is used for insert and update.
     */
    id?: string;
  
    /**
     * Gets or sets the firstName of the user. Max-255
     */
    firstName: string;
  
    /**
     * Gets or sets the lastName of the user. Max-255
     */
    lastName: string;
  
    /**
     * Gets or sets the email of the user. Max-500
     */
    email: string;
  
    /**
     * Gets or sets a flag indicating whether two-factor authentication is enabled for the user.
     */
    twoFactorEnabled: boolean;
  
    /**
     * Gets or sets the roles assigned to the user.
     */
    userRoles: string[];
  
    /**
     * Gets or sets a flag indicating whether the user record is disabled.
     *
     * Not making it required because same DTO is used for insert and update.
     *
     * Its important to have this property nullable because we need to differentiate between true, false and null.
     */
    isDisabled?: boolean;
  
    /**
     * Gets or sets the username of the user who created the user record. Max-254
     */
    createdBy?: string;
  
    /**
     * Gets or sets the date and time when the user record was created.
     */
    createdOn?: Date;
  
    /**
     * Gets or sets the username of the user who last modified the user record. Max-254
     */
    lastModifiedBy?: string;
  
    /**
     * Gets or sets the date and time when the user record was last modified.
     */
    lastModifiedOn?: Date;
  }
  