import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aventisia/ui/cards";
import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { onPremModelTypes } from "../../constants/onprem-models-types";

const ScratchTemplate = () => {
  const { setStepState } = useLabelDataStore(
    useShallow((state) => ({
      setStepState: state.setStepState,
    })),
  );
  const navigate = useNavigate();
  const location = useLocation();

  const moveToNextStep = (modelLibraryType: string) => {
    const params = new URLSearchParams(location.search);
    params.set("ml", modelLibraryType);

    navigate(`${location.pathname}?${params.toString()}`);
    setStepState(1);
  };

  return (
    <div className="mt-8">
      <p className="px-2">Start from scratch:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {onPremModelTypes.map((item) => {
          return (
            <Card
              key={item.id}
              onClick={() => moveToNextStep(item.type)}
              className="cursor-pointer shadow-none hover:shadow-md border-primary-100"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={item.icon} alt="" />
                    <CardTitle className="font-normal">{item.name}</CardTitle>
                  </div>
                  <Button
                    variant="link"
                    className="text-foreground !mt-0"
                    onClick={() => moveToNextStep(item.type)}
                  >
                    <ArrowRight className="w-5- h-5" />
                  </Button>
                </div>
                <CardDescription className="text-muted-foreground">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Badge
                  className="border-primary-500 text-primary-500"
                  variant={"outline"}
                >
                  {item.model}
                </Badge>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ScratchTemplate;
