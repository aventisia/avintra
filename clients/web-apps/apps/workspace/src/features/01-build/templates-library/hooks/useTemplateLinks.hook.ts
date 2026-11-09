import { useSearchParams } from "react-router-dom";

const TEMPLATE_PARAM = "t";

/**
 * Links between the library and a template's page (`/library?t={id}`). The library's page,
 * sorting and filters stay in the URL, so going back restores the list as it was.
 */
export const useTemplateLinks = () => {
  const [searchParams] = useSearchParams();

  const withTemplate = (templateId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (templateId) params.set(TEMPLATE_PARAM, templateId);
    else params.delete(TEMPLATE_PARAM);
    return { pathname: "/library", search: params.toString() };
  };

  return {
    templateId: searchParams.get(TEMPLATE_PARAM) ?? "",
    getTemplateLink: (templateId: string) => withTemplate(templateId),
    libraryLink: withTemplate(null),
  };
};
