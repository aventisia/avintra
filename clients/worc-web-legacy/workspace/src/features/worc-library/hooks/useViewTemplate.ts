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
    const url = `library?t=${id}`;
    window.location.href = url;
  };

  return handleViewTemplate;
};
