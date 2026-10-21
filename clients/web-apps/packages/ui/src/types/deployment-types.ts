/**
 * The DeploymentType can be "Commercial", "Enterprise", or "Community".
 * Community is a single-tenant, self-hosted edition with no GlobalAdmin synchronization.
 * Use this type when you need to specify the deployment type of the platform.
 */
export type DeploymentType = "Commercial" | "Enterprise" | "Community";
