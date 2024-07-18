/**
 * Renders the description for the ATS (Activity To Select) component.
 *
 * @param {string} description - The description of the activity.
 */
export const ATSDescription = ({ description }: { description: string }) => {
  return (
    <p className="w-[90%] truncate text-2xs text-muted-foreground">
      {description}
    </p>
  );
};
