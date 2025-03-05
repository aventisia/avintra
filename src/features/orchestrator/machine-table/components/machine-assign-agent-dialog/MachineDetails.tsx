import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/react-toolkit/ui/card/card";
import { Label } from "@/react-toolkit/ui/label";
import type { MachineDto } from "../../dtos/machine-dto";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/react-toolkit/ui/badge";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

export const MachineDetails = (details: Partial<MachineDto>) => {
  const statusColor =
    details.status === MachineStatusTypesEnum.Inactive
      ? "bg-red-500"
      : details.status === MachineStatusTypesEnum.Active
        ? "bg-green-500"
        : "";
  return (
    <div className="flex flex-col">
      <h4 className="py-1">Machine Details</h4>
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex">
              {`${details.name} (${details.type})`}
              <span className="text-md ms-auto text-muted-foreground">
                {"status: "}
                <Badge className={statusColor}>{details.status}</Badge>
              </span>
            </span>
          </CardTitle>
          <CardDescription>{`created by ${details.createdBy} ${formatDistanceToNow(details.createdOn!.toString())} ago`}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex items-center justify-between space-x-4 rounded-sm border p-2">
            <Label htmlFor="performance" className="flex flex-col space-y-1">
              <span>Host Name</span>
              <span className="text-xs font-normal leading-snug text-muted-foreground">
                {details.hostname}
              </span>
            </Label>
          </div>
          <div className="flex items-center justify-between space-x-4 rounded-sm border p-2">
            <Label htmlFor="performance" className="flex flex-col space-y-1">
              <span>Ip Address</span>
              <span className="text-xs font-normal leading-snug text-muted-foreground">
                {details.ipAddress}
              </span>
            </Label>
          </div>
          <div className="flex items-center justify-between space-x-4 rounded-sm border p-2">
            <Label htmlFor="necessary" className="flex flex-col space-y-1">
              <span>Environment</span>
              <span className="text-sm font-normal leading-snug text-muted-foreground">
                {details.environment}
              </span>
            </Label>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
};
