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
    <AccordionTrigger className="mx-3 h-9 overflow-hidden rounded-lg pr-1.5 hover:bg-slate-100 hover:no-underline">
      <div className="flex items-center">
        <div className="mr-1 flex h-9 w-[2.5rem] items-center justify-center">
          <Icon className="h-5 w-5 stroke-[1.5] text-[--icon-color]" />
        </div>
        <span className="whitespace-nowrap text-sm font-medium capitalize">{name}</span>
      </div>
    </AccordionTrigger>
  );
};

export { MultiLevelMenuButton };
