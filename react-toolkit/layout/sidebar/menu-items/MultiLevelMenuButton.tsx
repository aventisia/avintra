import { IconProps } from "@/react-toolkit/types/icon-props";
import { AccordionTrigger } from "@/react-toolkit/ui/accordion";

interface MultiLevelMenuButtonProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
}

const MultiLevelMenuButton = ({ Icon, name }: MultiLevelMenuButtonProps) => {
  return (
    <AccordionTrigger className="mx-3 h-9 overflow-hidden rounded-lg pr-1.5 hover:bg-slate-100 hover:no-underline">
      <div className="flex items-center">
        <div className="mr-1 flex h-9 w-[2.5rem] items-center justify-center">
          <Icon className="h-5 w-5 stroke-[1.5] text-[--icon-color]" />
        </div>
        <span className="whitespace-nowrap text-sm font-medium capitalize">
          {name}
        </span>
      </div>
    </AccordionTrigger>
  );
};

export { MultiLevelMenuButton };
