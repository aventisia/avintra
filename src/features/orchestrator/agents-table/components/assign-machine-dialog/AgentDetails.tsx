import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/react-toolkit/ui/card/card";
import { formatDistanceToNow } from "date-fns";
import type { AgentsTableDto } from "../../dtos/agents-table-dto";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { Badge } from "@/react-toolkit/ui/badge";

export const AgentDetails = (details: Partial<AgentsTableDto>) => {
  return (
    <div className="mb-2 flex flex-col">
      <Card className="!border-none !shadow-none">
        <CardHeader>
          <CardTitle>
            <span className="flex">
              {details.name}
              <span className="text-md ms-auto text-muted-foreground">
                <Badge>{`v${details.versionNumber}`}</Badge>
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
            <p className="text-gray-600">Flow ID</p>
            <p className="truncate transition-all hover:whitespace-normal hover:text-primary">
              {details.flowId}
            </p>
          </div>
          <div className="space-y-1 p-1 hover:bg-gray-50 md:grid md:grid-cols-2 md:space-y-0">
            <AutherCard
              createdBy={details.createdBy ?? ""}
              createdOn={details.createdOn ?? new Date()}
              lastModifiedBy={details.lastModifiedBy ?? ""}
              lastModifiedOn={details.lastModifiedOn ?? new Date()}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
