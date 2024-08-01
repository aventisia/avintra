/**
 * Renders the description for the Node component.
 *
 * @param {string} description - The description of the activity.
 */
export const NodeDescription = ({ description }: { description: string }) => {
  return (
    <div className="grow truncate text-left text-sm text-muted-foreground">
      {description}
    </div>
  );
};
