import { ProjectTemplateTypesEnum } from "../constants/template-types-enum";

export function transformTemplateType(templateType: string | undefined): string | undefined {
    switch (templateType) {
      case ProjectTemplateTypesEnum.Agent:
        return "Automation Agent";
      case ProjectTemplateTypesEnum.ChatAgent:
        return "Chat Agent";
      default:
        return templateType;
    }
}