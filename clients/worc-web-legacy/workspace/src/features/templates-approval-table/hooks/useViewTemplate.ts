/**
 * Custom hook to view a template.
 *
 * The template is displayed at the `/library` route.
 *
 * @returns A function that takes a template ID and opens the template in a new tab.
 */
export const useViewTemplate = () => {
  // Function to open the template
  const handleViewTemplate = (id: string) => {
    const url = `${import.meta.env.VITE_WORC_PATH}library?t=${id}`;
    window.open(url, "_blank");
  };

  return handleViewTemplate;
};
