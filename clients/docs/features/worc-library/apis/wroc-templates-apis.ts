"use client";
import { toast } from "sonner";
import { UseTemplateDTO } from "../dtos/use-template-dto";
import { WorcTemplatesDto } from "../dtos/worc-templates-dtos";

/**
 * Retrieves list of templates.
 */
const getAgentTemplates = async (): Promise<WorcTemplatesDto[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_WORC_API_URL + "/template/trending"
  );
  if (!response.ok) {
    toast.error("Failed to fetch posts");
  }
  const result = await response.json();
  return result?.data;
};

const getAgentTemplateById = async (
  id: string
): Promise<{ data: UseTemplateDTO }> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_WORC_API_URL + "/template?ptid=" + id
  );

  if (!response.ok) {
    toast.error("Failed to fetch template");
  }
  return response.json();
};

export { getAgentTemplates, getAgentTemplateById };
