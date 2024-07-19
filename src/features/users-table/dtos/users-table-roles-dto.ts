/**
 * Represents the data transfer object for user roles.
 */
export interface UsersTableRolesDto {
    /**
     * The label of the user role.
     */
    label: string;
  
    /**
     * The value of the user role.
     */
    value: string;
  
    /**
     * The description of the user role.
     */
    description: string;
  
    /**
     * Indicates whether the user role is disabled.
     */
    disable?: boolean;
  
    /**
     * Indicates whether the user role is fixed.
     */
    fixed?: boolean;
  }
  