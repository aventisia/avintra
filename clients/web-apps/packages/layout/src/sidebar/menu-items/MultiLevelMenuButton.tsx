import { AccordionTrigger } from "@avplatform/ui/accordion";
import type { IconProps } from "@avplatform/ui/types";

interface MultiLevelMenuButtonProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
}

/**
 * A React component that renders a button for a multi-level menu with an icon and a label.
 * This component is styled to include hover effects and supports customization through props.
 *
 * @param {MultiLevelMenuButtonProps} props - The properties for the component.
 * @param {React.ComponentType} props.Icon - The icon component to display in the button.
 * @param {string} props.name - The name or label to display next to the icon.
 * @returns {JSX.Element} The rendered multi-level menu button component.
 */
const MultiLevelMenuButton = ({ Icon, name }: MultiLevelMenuButtonProps) => {
  return (
    <AccordionTrigger className="h-control-sm gap-2.5 rounded-sm px-2 py-0 text-body-sm font-normal text-ink-2 transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink hover:no-underline focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none [&>svg]:text-muted-foreground">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground" />
        <span className="truncate">{name}</span>
      </div>
    </AccordionTrigger>
  );
};

export { MultiLevelMenuButton };
