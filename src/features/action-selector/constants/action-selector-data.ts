import { PrimaryCategoryType } from "../types/primary-category-type";
import { aiIntegrationActions } from "./ai-integrations/ai-integrations-action-categories";
import { appIntegrationActions } from "./app-integrations/app-integrations-action-categoires";
import { dataTransformationsActions } from "./data-transformations/data-transformations-action-categories";
import { uiAutomationAndUserActions } from "./ui-interface-automations/ui-interface-automations-action-categories";
import { workFlowLogicsActions } from "./workflow-logics/workflow-logics-action-categories";

export const actionSelectorData: PrimaryCategoryType[] = [
  {
    name: "workFlowLogics",
    label: "Workflow Logics",
    description: "Core actions to build the foundation of any automation flow",
    icon: "AutomationEssentialsIcon",
    actionCategories: workFlowLogicsActions,
  },
  {
    name: "dataTransformations",
    label: "Data Transformations",
    description: "Clean, transform, and structure your data with ease",
    icon: "DataTransformationsIcon",
    actionCategories: dataTransformationsActions,
  },
  {
    name: "uiInterfaceAutomations",
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
    actionCategories: appIntegrationActions,
  },
  {
    name: "aiIntegrations",
    label: "AI Integrations",
    description: "AI-powered advanced actions for smarter, dynamic automation",
    icon: "IntelligentAutomationIcon",
    actionCategories: aiIntegrationActions,
  },
];
