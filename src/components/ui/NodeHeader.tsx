interface NodeHeaderProps {
  iconSrc: string;
  label: string;
}

/**
 * Renders a icon and label for the Node component.
 *
 * @param iconSrc - The source URL of the icon image.
 * @param label - The text to be displayed as the label.
 */
export const NodeHeader = ({ iconSrc, label }: NodeHeaderProps) => {
  return (
    <div className="flex grow items-center gap-3">
      {/* Node icon */}
      <img className="h-3.5" src={iconSrc} />

      {/* Node label */}
      <h2 className="text-left text-sm font-medium text-slate-900">{label}</h2>
    </div>
  );
};
