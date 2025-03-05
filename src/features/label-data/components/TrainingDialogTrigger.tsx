import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const TrainingDialogTrigger = ({
  isPdfAvailable,
}: {
  isPdfAvailable: boolean;
}) => {
  return (
    <Tooltip content="Train" side="left">
      <Button
        disabled={!isPdfAvailable}
        size={"xs"}
        className="group -mr-[4rem] h-[5rem] w-[5rem] justify-start rounded-full opacity-40 shadow hover:-mr-[3.2rem] hover:opacity-100"
      >
        <ArrowRightIcon className="-ml-1.5 flex h-4 w-4 items-center group-hover:-ml-1 group-hover:h-6 group-hover:w-6" />
      </Button>
    </Tooltip>
  );
};

export default TrainingDialogTrigger;
