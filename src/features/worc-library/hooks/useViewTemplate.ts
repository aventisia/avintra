/**
 * Custom hook to handle opening a template in a new tab.
 *
 * @returns A function to handle opening the template.
 */
export const useViewTemplate = () => {
  // Handle open flow action
  const handleViewTemplate = (id: string) => {
    // View  in a new tab
    const url = `/library?t=${id}`;
    window.open(url, "_blank");
  };

  // Return the handle open flow action function
  return handleViewTemplate;
};
