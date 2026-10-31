/**
 * Registry for in-app documentation guides.
 *
 * Each guide is a standalone Markdown file in `guides/` plus a metadata entry
 * below. The help panel opens the guide whose `routes` match the current page;
 * a `HelpButton` can open any guide by its stable `id`. `docsSiteUrl` provides
 * the hybrid "View full docs" link to the external docs site.
 */
import { isRouteWithin } from "@avplatform/ui/utils";

// Guides are imported statically (as raw strings) so they are bundled with the
// app and render instantly.
import agentRiskRegistry from "./guides/agent-risk-registry.md?raw";
import agents from "./guides/agents.md?raw";
import apiKeys from "./guides/api-keys.md?raw";
import assistAgents from "./guides/assist-agents.md?raw";
import assistChats from "./guides/assist-chats.md?raw";
import assistQueues from "./guides/assist-queues.md?raw";
import configstore from "./guides/config-store.md?raw";
import conversations from "./guides/conversations.md?raw";
import creditPlans from "./guides/credit-plans.md?raw";
import emailTriggers from "./guides/email-triggers.md?raw";
import getStarted from "./guides/get-started.md?raw";
import jobs from "./guides/jobs.md?raw";
import knowledgeBases from "./guides/knowledge-bases.md?raw";
import library from "./guides/library.md?raw";
import machines from "./guides/machines.md?raw";
import messageTriggers from "./guides/message-triggers.md?raw";
import models from "./guides/models.md?raw";
import onPremTenants from "./guides/on-prem-tenants.md?raw";
import publishedAgents from "./guides/published-agents.md?raw";
import queues from "./guides/queues.md?raw";
import skills from "./guides/skills.md?raw";
import spaces from "./guides/spaces.md?raw";
import subscriptionPlans from "./guides/subscription-plans.md?raw";
import support from "./guides/support.md?raw";
import tenantNotifications from "./guides/tenant-notifications.md?raw";
import tenant from "./guides/tenant.md?raw";
import tenants from "./guides/tenants.md?raw";
import timeTriggers from "./guides/time-triggers.md?raw";
import tools from "./guides/tools.md?raw";
import triggers from "./guides/triggers.md?raw";
import usage from "./guides/usage.md?raw";
import users from "./guides/users.md?raw";
import vault from "./guides/vault.md?raw";
import webhookTriggers from "./guides/webhook-triggers.md?raw";
import type { HelpGuideContent } from "./types";

/** Full guide definitions (metadata merged with Markdown body). */
const guides: HelpGuideContent[] = [
  // Build
  {
    id: "get-started",
    routes: ["/tenant/get-started"],
    title: "Get started",
    summary:
      "The five-step setup for new tenants: users, spaces, vault, models, and your first agent.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    related: ["users", "spaces", "vault", "models", "agents"],
    content: getStarted,
  },
  {
    id: "agents",
    routes: ["/agents"],
    title: "Agents",
    summary: "Build, edit, and manage your AI agents.",
    section: "build",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu/agents",
    related: ["get-started"],
    content: agents,
  },
  {
    id: "library",
    routes: ["/library"],
    title: "Library",
    summary: "Start agents quickly from reusable templates.",
    section: "build",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu",
    content: library,
  },
  // Configure
  {
    id: "queues",
    routes: ["/configure/queues"],
    title: "Queues",
    summary: "Create and manage queues that hold work items for your agents.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/queues",
    content: queues,
  },
  {
    id: "triggers",
    routes: ["/configure/triggers"],
    title: "Triggers",
    summary: "Start agents automatically on time, email, message, or webhook events.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: triggers,
  },
  {
    id: "time-triggers",
    routes: ["/configure/triggers/time"],
    title: "Time triggers",
    summary: "Run an agent on a schedule.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: timeTriggers,
  },
  {
    id: "email-triggers",
    routes: ["/configure/triggers/email"],
    title: "Email triggers",
    summary: "Start an agent when an email is received.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: emailTriggers,
  },
  {
    id: "message-triggers",
    routes: ["/configure/triggers/message"],
    title: "Message triggers",
    summary: "Start an agent when a message arrives in a channel.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: messageTriggers,
  },
  {
    id: "webhook-triggers",
    routes: ["/configure/triggers/webhook"],
    title: "Webhook triggers",
    summary: "Start an agent when an external system calls a webhook URL.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: webhookTriggers,
  },
  {
    id: "configstore",
    routes: ["/configure/configstore"],
    title: "Key store",
    summary: "Manage API keys and configuration values referenced by agents.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/config-store",
    content: configstore,
  },
  {
    id: "vault",
    routes: ["/configure/vault"],
    title: "Vault",
    summary: "Store and manage encrypted secrets that are protected and audited.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/vault",
    related: ["get-started"],
    content: vault,
  },
  {
    id: "knowledge-bases",
    routes: ["/configure/knowledge-base"],
    title: "Knowledge bases",
    summary: "Create corpora of documents your agents can search and retrieve from.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: knowledgeBases,
  },
  {
    id: "skills",
    routes: ["/configure/skill-registry"],
    title: "Skills",
    summary: "Create reusable units of capability that agents can call.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: skills,
  },
  {
    id: "tools",
    routes: ["/configure/tools"],
    title: "Tools",
    summary: "Connect agents to external systems and APIs.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: tools,
  },
  // Orchestrator
  {
    id: "agent-risk-registry",
    routes: ["/orchestrator/agent-risk-registry"],
    title: "Agent risk registry",
    summary: "Assess, review, and govern the AI agents published in your workspace.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: agentRiskRegistry,
  },
  {
    id: "published-agents",
    routes: ["/orchestrator/published-agents"],
    title: "Published agents",
    summary: "Manage the agents that are live in production.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: publishedAgents,
  },
  {
    id: "machines",
    routes: ["/orchestrator/machines"],
    title: "Machines",
    summary: "Register and monitor the machines that execute your agents.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/machines",
    content: machines,
  },
  {
    id: "jobs",
    routes: ["/orchestrator/jobs"],
    title: "Jobs",
    summary: "Track agent executions, their status, and retry or cancel them.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/executions",
    content: jobs,
  },
  {
    id: "conversations",
    routes: ["/orchestrator/conversations"],
    title: "Conversations",
    summary: "Review the interactions your agents have with end users.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: conversations,
  },
  {
    id: "api-keys",
    routes: ["/orchestrator/api-keys"],
    title: "API keys",
    summary: "Generate and manage API keys used to call agent endpoints.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: apiKeys,
  },
  // Assist
  {
    id: "assist-agents",
    routes: ["/assist/agents"],
    title: "Assist — agents",
    summary: "Interact with the agents available to you.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistAgents,
  },
  {
    id: "assist-queues",
    routes: ["/assist/queues"],
    title: "Assist — queues",
    summary: "Process the work items assigned to you.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistQueues,
  },
  {
    id: "assist-chats",
    routes: ["/assist/chats"],
    title: "Assist — chats",
    summary: "Review and continue your conversations with agents.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistChats,
  },
  // Tenant Admin
  {
    id: "tenant",
    routes: ["/tenant/overview"],
    title: "Tenant",
    summary: "Manage your tenant's profile, plan, and billing.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/tenant",
    content: tenant,
  },
  {
    id: "users",
    routes: ["/tenant/users"],
    title: "Users",
    summary: "Invite, manage, and remove users and assign roles.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/users",
    related: ["get-started"],
    content: users,
  },
  {
    id: "spaces",
    routes: ["/tenant/spaces"],
    title: "Spaces",
    summary: "Organize users and resources into spaces.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    related: ["get-started"],
    content: spaces,
  },
  {
    id: "models",
    routes: ["/tenant/model-providers"],
    title: "Models",
    summary: "Configure the model providers used by your agents.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    related: ["get-started"],
    content: models,
  },
  {
    id: "usage",
    routes: ["/tenant/usage"],
    title: "Usage",
    summary: "Monitor your tenant's consumption and credits.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/licenses-credits",
    content: usage,
  },
  {
    id: "support",
    routes: ["/tenant/support", "/sa/support"],
    title: "Support",
    summary: "Raise and track support tickets.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu/support",
    content: support,
  },
  {
    id: "tenant-notifications",
    routes: ["/tenant/notifications", "/sa/notifications"],
    title: "Notifications",
    summary:
      "Broadcast manual notifications and configure automatic notifications for your tenant.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: tenantNotifications,
  },
  // Super Admin
  {
    id: "tenants",
    routes: ["/sa/tenants"],
    title: "Tenants",
    summary: "View and manage all tenants in the deployment.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: tenants,
  },
  {
    id: "subscription-plans",
    routes: ["/sa/subscription-plans"],
    title: "Subscription plans",
    summary: "Define the plans available to tenants.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: subscriptionPlans,
  },
  {
    id: "credit-plans",
    routes: ["/sa/credit-plans"],
    title: "Credit plans",
    summary: "Manage credit plans and pricing.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: creditPlans,
  },
  // Global Admin
  {
    id: "on-prem-tenants",
    routes: ["/ga/on-prem-tenants"],
    title: "On-prem tenants",
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

/** Returns the guide for the page at `pathname`, matching its most specific route. */
export function getGuideForPath(pathname: string): HelpGuideContent | undefined {
  let match: { guide: HelpGuideContent; length: number } | undefined;
  for (const guide of guides) {
    for (const route of guide.routes ?? []) {
      if (isRouteWithin(pathname, route) && route.length > (match?.length ?? 0))
        match = { guide, length: route.length };
    }
  }
  return match?.guide;
}
