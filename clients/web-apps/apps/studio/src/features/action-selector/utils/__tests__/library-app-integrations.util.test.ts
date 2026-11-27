import { describe, expect, it } from "vitest";

import { PrimaryCategoryType } from "../../types/primary-category-type";
import { filterLibraryAppIntegrations } from "../library-app-integrations.util";

const action = (name: string) => ({
  type: "cloudConnectorNode" as const,
  name,
  label: name,
  description: name,
});

const buildCategories = (): PrimaryCategoryType[] => [
  {
    label: "App Integrations",
    description: "Apps",
    actionCategories: [
      {
        label: "SendGrid actions",
        description: "",
        actions: [action("Camel/SendGrid/SendConnector")],
      },
      { label: "Slack", description: "", actions: [action("Corsair/Slack/PostMessageConnector")] },
      { label: "Gmail", description: "", actions: [action("Corsair/Gmail/SendEmailConnector")] },
      {
        label: "Excel",
        description: "",
        actions: [action("ExcelConnector"), action("Corsair/Excel/WorksheetConnector")],
      },
      { label: "Notion", description: "", actions: [] },
    ],
  },
  {
    label: "AI Integrations",
    description: "AI",
    actionCategories: [
      { label: "AI", description: "", actions: [action("Corsair/Ai/ChatConnector")] },
    ],
  },
];

const appIntegrations = (categories: PrimaryCategoryType[]) =>
  categories.find((primary) => primary.label === "App Integrations")!;

describe("filterLibraryAppIntegrations", () => {
  it("keeps built-in categories and drops every library integration while none is enabled", () => {
    const filtered = filterLibraryAppIntegrations(buildCategories(), new Set());
    const categories = appIntegrations(filtered).actionCategories;

    expect(categories.map((category) => category.label)).toEqual(["SendGrid actions", "Excel"]);
    expect(categories[1].actions?.map((entry) => entry.name)).toEqual(["ExcelConnector"]);
  });

  it("keeps the library integrations whose tool name is enabled, ignoring case and spacing", () => {
    const filtered = filterLibraryAppIntegrations(buildCategories(), new Set([" slack ", "EXCEL"]));
    const categories = appIntegrations(filtered).actionCategories;

    expect(categories.map((category) => category.label)).toEqual([
      "SendGrid actions",
      "Slack",
      "Excel",
    ]);
    expect(categories[2].actions?.map((entry) => entry.name)).toEqual([
      "ExcelConnector",
      "Corsair/Excel/WorksheetConnector",
    ]);
  });

  it("leaves the other groups untouched", () => {
    const categories = buildCategories();

    expect(filterLibraryAppIntegrations(categories, new Set())[1]).toBe(categories[1]);
  });
});
