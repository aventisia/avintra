export interface CreateRoleDto {
  featureName: string;

  /**
   * has access of full controll to the feature
   */
  all: boolean;

  /**
   * has access to view
   */
  view: boolean;

  /**
   * has access to create
   */
  create: boolean;

  /**
   * has access to edit
   */
  edit: boolean;

  /**
   * has access to delete
   */
  delete: boolean;
}
