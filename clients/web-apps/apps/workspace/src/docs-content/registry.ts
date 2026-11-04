/**
 * Registry for in-app documentation guides.
 *
 * Each guide is a standalone Markdown file in `guides/` plus a metadata entry
 * below. Guides are keyed by a stable `id` that is referenced from the page
 * headings via the `HelpButton` component. `docsSiteUrl` provides the hybrid
 * "View full docs" link to the external docs site.
 */
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
    title: "Get Started",
    summary:
      "The five-step setup for new tenants: users, spaces, vault, models, and your first agent.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    related: ["users", "spaces", "vault", "models", "agents"],
    content: getStarted,
  },
  {
    id: "agents",
    title: "Agents",
    summary: "Build, edit, and manage your AI agents.",
    section: "build",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu/agents",
    related: ["get-started"],
    content: agents,
  },
  {
    id: "library",
    title: "Library",
    summary: "Start agents quickly from reusable templates.",
    section: "build",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu",
    content: library,
  },
  // Configure
  {
    id: "queues",
    title: "Queues",
    summary: "Create and manage queues that hold work items for your agents.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/queues",
    content: queues,
  },
  {
    id: "triggers",
    title: "Triggers",
    summary: "Start agents automatically on time, email, message, or webhook events.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: triggers,
  },
  {
    id: "time-triggers",
    title: "Time Triggers",
    summary: "Run an agent on a schedule.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: timeTriggers,
  },
  {
    id: "email-triggers",
    title: "Email Triggers",
    summary: "Start an agent when an email is received.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: emailTriggers,
  },
  {
    id: "message-triggers",
    title: "Message Triggers",
    summary: "Start an agent when a message arrives in a channel.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: messageTriggers,
  },
  {
    id: "webhook-triggers",
    title: "Webhook Triggers",
    summary: "Start an agent when an external system calls a webhook URL.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/triggers",
    content: webhookTriggers,
  },
  {
    id: "configstore",
    title: "Key Store",
    summary: "Manage API keys and configuration values referenced by agents.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/config-store",
    content: configstore,
  },
  {
    id: "vault",
    title: "Vault",
    summary: "Store and manage encrypted secrets that are protected and audited.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/vault",
    related: ["get-started"],
    content: vault,
  },
  {
    id: "knowledge-bases",
    title: "Knowledge Bases",
    summary: "Create corpora of documents your agents can search and retrieve from.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: knowledgeBases,
  },
  {
    id: "skills",
    title: "Skills",
    summary: "Create reusable units of capability that agents can call.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: skills,
  },
  {
    id: "tools",
    title: "Tools",
    summary: "Connect agents to external systems and APIs.",
    section: "configure",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: tools,
  },
  // Orchestrator
  {
    id: "agent-risk-registry",
    title: "Agent Risk Registry",
    summary: "Assess, review, and govern the AI agents published in your workspace.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: agentRiskRegistry,
  },
  {
    id: "published-agents",
    title: "Published Agents",
    summary: "Manage the agents that are live in production.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: publishedAgents,
  },
  {
    id: "machines",
    title: "Machines",
    summary: "Register and monitor the machines that execute your agents.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/machines",
    content: machines,
  },
  {
    id: "jobs",
    title: "Jobs",
    summary: "Track agent executions, their status, and retry or cancel them.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator/executions",
    content: jobs,
  },
  {
    id: "conversations",
    title: "Conversations",
    summary: "Review the interactions your agents have with end users.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: conversations,
  },
  {
    id: "api-keys",
    title: "API Keys",
    summary: "Generate and manage API keys used to call agent endpoints.",
    section: "orchestrator",
    docsSiteUrl: "https://docs.aventisia.com/workspace/orchestrator",
    content: apiKeys,
  },
  // Assist
  {
    id: "assist-agents",
    title: "Assist — Agents",
    summary: "Interact with the agents available to you.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistAgents,
  },
  {
    id: "assist-queues",
    title: "Assist — Queues",
    summary: "Process the work items assigned to you.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistQueues,
  },
  {
    id: "assist-chats",
    title: "Assist — Chats",
    summary: "Review and continue your conversations with agents.",
    section: "assist",
    docsSiteUrl: "https://docs.aventisia.com/workspace",
    content: assistChats,
  },
  // Tenant Admin
  {
    id: "tenant",
    title: "Tenant",
    summary: "Manage your tenant's profile, plan, and billing.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/tenant",
    content: tenant,
  },
  {
    id: "users",
    title: "Users",
    summary: "Invite, manage, and remove users and assign roles.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/users",
    related: ["get-started"],
    content: users,
  },
  {
    id: "spaces",
    title: "Spaces",
    summary: "Organize users and resources into spaces.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    related: ["get-started"],
    content: spaces,
  },
  {
    id: "models",
    title: "Models",
    summary: "Configure the model providers used by your agents.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    related: ["get-started"],
    content: models,
  },
  {
    id: "usage",
    title: "Usage",
    summary: "Monitor your tenant's consumption and credits.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin/licenses-credits",
    content: usage,
  },
  {
    id: "support",
    title: "Support",
    summary: "Raise and track support tickets.",
    section: "tenant-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/main-menu/support",
    content: support,
  },
  {
    id: "tenant-notifications",
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
    title: "Tenants",
    summary: "View and manage all tenants in the deployment.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: tenants,
  },
  {
    id: "subscription-plans",
    title: "Subscription Plans",
    summary: "Define the plans available to tenants.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: subscriptionPlans,
  },
  {
    id: "credit-plans",
    title: "Credit Plans",
    summary: "Manage credit plans and pricing.",
    section: "super-admin",
    docsSiteUrl: "https://docs.aventisia.com/workspace/admin",
    content: creditPlans,
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
