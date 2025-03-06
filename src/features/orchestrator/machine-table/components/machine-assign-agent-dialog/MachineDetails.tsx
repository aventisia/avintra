import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/react-toolkit/ui/card/card";
import type { MachineDto } from "../../dtos/machine-dto";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/react-toolkit/ui/badge";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

export const MachineDetails = (details: Partial<MachineDto>) => {
  const statusColor: { [key in MachineStatusTypesEnum]: string } = {
    [MachineStatusTypesEnum.Active]: "red",
    [MachineStatusTypesEnum.Inactive]: "green",
    [MachineStatusTypesEnum.Idle]: "blue",
  };

  return (
    <div className="mb-2 flex flex-col">
      <Card className="!border-none !shadow-none">
        <CardHeader>
          <CardTitle>
            <span className="flex">
              {`${details.name} (${details.type})`}
              <span className="text-md ms-auto text-muted-foreground">
                <Badge
                  className={
                    `bg-${statusColor[details.status ?? MachineStatusTypesEnum.Idle]}-500`
                  }
                >
                  {details.status}
                </Badge>
              </span>
            </span>
          </CardTitle>
          <CardDescription>{`Published by ${details.createdBy} ${formatDistanceToNow(details.lastModifiedOn!.toString())} ago`}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="space-y-1 border-b p-1 hover:bg-gray-50 md:grid md:grid-cols-2 md:space-y-0">
            <p className="text-gray-600">ID</p>
            <p className="truncate transition-all hover:whitespace-normal hover:text-primary">
              {details.id}
            </p>
          </div>
          <div className="space-y-1 border-b p-1 hover:bg-gray-50 md:grid md:grid-cols-2 md:space-y-0">
            <p className="text-gray-600">Host name</p>
            <p>{details.hostname}</p>
          </div>
          <div className="space-y-1 border-b p-1 hover:bg-gray-50 md:grid md:grid-cols-2 md:space-y-0">
            <p className="text-gray-600">IP Address</p>
            <p>{details.ipAddress}</p>
          </div>
          <div className="space-y-1 border-b p-1 hover:bg-gray-50 md:grid md:grid-cols-2 md:space-y-0">
            <p className="text-gray-600">Environment</p>
            <p>{details.environment}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
