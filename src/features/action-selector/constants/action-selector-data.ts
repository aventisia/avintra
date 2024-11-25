import { PrimaryCategoryType } from "../types/primary-category-type";
import { uiAutomationAndUserActions } from "./ui-automation-n-user-actions/ui-automation-action-categories";

export const actionSelectorData: PrimaryCategoryType[] = [
  {
    name: "automationEssentials",
    label: "Workflow Logics",
    description: "Core actions to build the foundation of any automation flow",
    icon: "AutomationEssentialsIcon",
    actionCategories: [],
  },
  {
    name: "dataTransformations",
    label: "Data Transformations",
    description: "Clean, transform, and structure your data with ease",
    icon: "DataTransformationsIcon",
    actionCategories: [],
  },
  {
    name: "uiAutomationAndUserActions",
    label: "UI Interface Automations",
    description:
      "Automate your desktop with actions that mimic user interactions, from mouse clicks to keyboard entries",
    icon: "UIAutomationAndUserActionsIcon",
    actionCategories: uiAutomationAndUserActions,
  },
  {
    name: "appIntegrations",
    label: "App Integrations",
    description:
      "Seamlessly integrate with apps and services such as Twilio, Slack, and more",
    icon: "AppIntegrationsIcon",
    actionCategories: [],
  },
  {
    name: "intelligentAutomation",
    label: "AI Integrations",
    description: "AI-powered advanced actions for smarter, dynamic automation",
    icon: "IntelligentAutomationIcon",
    actionCategories: [],
  },
];
