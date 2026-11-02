import { ProjectTemplateTypesEnum } from "../constants/template-types-enum";

export function transformTemplateType(templateType: string | undefined): string | undefined {
  switch (templateType) {
    case ProjectTemplateTypesEnum.Agent:
      return "Automation agent";
    case ProjectTemplateTypesEnum.ChatAgent:
      return "Chat agent";
    case ProjectTemplateTypesEnum.VoiceAgent:
      return "Voice agent";
    default:
      return templateType;
  }
}
