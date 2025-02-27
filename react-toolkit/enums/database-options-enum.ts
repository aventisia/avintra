/**
 * Represents the options for the database configuration in a multi-tenant application.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum DatabaseOptionsEnum {
  /**
   * Tenants share a common database infrastructure. Suitable for low-resource tenants or those not requiring high isolation.
   */
  Shared = "Shared",

  /**
   * Tenants have their own database schema within a shared infrastructure. Offers a balance between cost and isolation.
   */
  Isolated = "Isolated",

  /**
   * Tenants have their own dedicated database server. Provides the highest performance and complete isolation, but comes at a higher cost.
   */
  DedicatedServer = "DedicatedServer",
}
