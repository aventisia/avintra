import { Button } from "@/react-toolkit/ui/buttons/Button";

const TrainingDialogTrigger = ({
  isPdfAvailable,
}: {
  isPdfAvailable: boolean;
}) => {
  return (
    <Button disabled={!isPdfAvailable} size={"xs"}>
      Train
    </Button>
  );
};

export default TrainingDialogTrigger;
