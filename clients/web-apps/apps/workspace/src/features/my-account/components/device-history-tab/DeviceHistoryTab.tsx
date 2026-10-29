import { LoadingSpinner, Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import Lucide from "@avplatform/ui/components/Lucide";
import { XCircleIcon } from "lucide-react";
import { useState } from "react";

import useGetDeviceHistory from "../../hooks/useGetDeviceHistory";
import { useTerminateSessionMutation } from "../../hooks/useTerminateSessionMutation";
import DeviceHistoryTable from "./DeviceHistoryTable";

export const DeviceHistoryTab = () => {
  const [currTermination, setCurrTermination] = useState<string>("");

  const { isLoading, activeSessions, currentSession, getImageSourceOfBrowser } =
    useGetDeviceHistory();
  const { mutate: terminateSession, isPending } = useTerminateSessionMutation();
  return (
    <div className="box box--stacked flex flex-col p-5">
      {/* <div className="mb-6 flex items-center border-b border-dashed border-line pb-5 text-sm font-medium">
        Device history
      </div> */}
      <div>
        <div className="text-sm text-muted-foreground">
          Access and control your currently connected devices.
        </div>
        <div className="mt-5 rounded-lg border border-line">
          <div className="overflow-auto xl:overflow-visible">
            <DeviceHistoryTable>
              <DeviceHistoryTable.Thead>
                <DeviceHistoryTable.Tr>
                  <DeviceHistoryTable.Td className="whitespace-nowrap border-line bg-sunken py-4 text-sm font-medium text-muted-foreground first:rounded-tl-lg last:rounded-tr-lg">
                    Browser
                  </DeviceHistoryTable.Td>
                  <DeviceHistoryTable.Td className="whitespace-nowrap border-line bg-sunken py-4 text-sm font-medium text-muted-foreground first:rounded-tl-lg last:rounded-tr-lg">
                    Device
                  </DeviceHistoryTable.Td>
                  {/* <DeviceHistoryTable.Td className="whitespace-nowrap border-line bg-sunken py-4 font-medium text-muted-foreground first:rounded-tl-lg last:rounded-tr-lg">
                    Location
                  </DeviceHistoryTable.Td> */}
                  <DeviceHistoryTable.Td className="whitespace-nowrap border-line bg-sunken py-4 text-sm font-medium text-muted-foreground first:rounded-tl-lg last:rounded-tr-lg">
                    Status
                  </DeviceHistoryTable.Td>
                  <DeviceHistoryTable.Td className="whitespace-nowrap border-line bg-sunken py-4 text-sm font-medium text-muted-foreground first:rounded-tl-lg last:rounded-tr-lg">
                    Terminate
                  </DeviceHistoryTable.Td>
                </DeviceHistoryTable.Tr>
              </DeviceHistoryTable.Thead>
              <DeviceHistoryTable.Tbody>
                {(isLoading && (
                  <DeviceHistoryTable.Tr className="[&_td]:last:border-b-0">
                    <DeviceHistoryTable.Td colSpan={4}>
                      <Skeleton className="h-12" />
                    </DeviceHistoryTable.Td>
                  </DeviceHistoryTable.Tr>
                )) ||
                  activeSessions.map((session, index) => (
                    <DeviceHistoryTable.Tr
                      key={session.refreshToken.slice(0, 8).padEnd(index)}
                      className="[&_td]:last:border-b-0"
                    >
                      <DeviceHistoryTable.Td className="border-dashed border-line py-4 text-sm">
                        <div className="flex items-center whitespace-nowrap">
                          <div className="image-fit h-4 w-4 zoom-in">
                            {(getImageSourceOfBrowser(session.browserType) && (
                              <img
                                alt="browser"
                                className="rounded-full ring-2 ring-surface"
                                src={getImageSourceOfBrowser(session.browserType)}
                              />
                            )) || (
                              <Lucide
                                icon="Dog"
                                className="h-5 w-5 rounded-full bg-sunken ring-2 ring-surface"
                              />
                            )}
                          </div>
                          <div className="ml-2 max-w-36 truncate">
                            {session.browserType} on {session.operatingSystem}
                          </div>
                        </div>
                      </DeviceHistoryTable.Td>

                      <DeviceHistoryTable.Td className="border-dashed border-line py-4 text-sm">
                        <div className="flex max-w-md items-center truncate whitespace-nowrap">
                          <Lucide icon="Smartphone" className="mr-1 h-4 w-4 stroke-[1.3]" />
                          <p className="max-w-48 truncate font-mono tabular-nums">
                            {session.deviceId}
                          </p>
                          {session.refreshToken === currentSession?.refreshToken && (
                            <Badge className="ml-3">Current</Badge>
                          )}
                        </div>
                      </DeviceHistoryTable.Td>

                      {/* <DeviceHistoryTable.Td className="border-dashed border-line py-4">
                        <div className="whitespace-nowrap">
                          {session.location}
                        </div>
                      </DeviceHistoryTable.Td> */}

                      <DeviceHistoryTable.Td className="border-dashed border-line py-4 text-sm">
                        <div className="whitespace-nowrap">
                          {session.sessionExpiresOn < new Date() ? "Ended" : "Active"}
                        </div>
                      </DeviceHistoryTable.Td>
                      <DeviceHistoryTable.Td className="flex items-center justify-center border-dashed border-line py-4">
                        <Button
                          onClick={() => {
                            setCurrTermination(session.id);
                            terminateSession([session.id]);
                          }}
                          variant="caution"
                          size="icon7"
                          disabled={isPending && currTermination == session.id}
                        >
                          {isPending && currTermination == session.id ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <XCircleIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </DeviceHistoryTable.Td>
                    </DeviceHistoryTable.Tr>
                  ))}
              </DeviceHistoryTable.Tbody>
            </DeviceHistoryTable>
          </div>
        </div>
      </div>
    </div>
  );
};
