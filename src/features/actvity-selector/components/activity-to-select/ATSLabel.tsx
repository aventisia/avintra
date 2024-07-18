/**
 * Renders a label for the ATS (Activity To Select) component.
 *
 * @param label - The text to be displayed as the label.
 */
export const ATSLabel = ({ label }: { label: string }) => {
  return (
    <h2 className="flex items-center text-xs font-medium text-foreground">
      {label}
    </h2>
  );
};
