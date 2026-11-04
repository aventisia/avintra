import onPremTenants from "./guides/on-prem-tenants.ee.md?raw";
import type { HelpGuideContent } from "./types.ee";

const guides: HelpGuideContent[] = [
  {
    id: "on-prem-tenants",
    title: "On-prem Tenants",
    summary: "View and manage on-premises tenant instances and their data.",
    section: "global-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: onPremTenants,
  },
];

/** Returns a single guide (metadata + content) by id, or undefined. */
export function getGuide(id: string): HelpGuideContent | undefined {
  return guides.find((guide) => guide.id === id);
}

/** Returns all guides (metadata + content). */
export function getAllGuides(): HelpGuideContent[] {
  return guides;
}
