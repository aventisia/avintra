import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useState } from "react";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";

const UsageTabs = () => {
  const [selectedTab, setSelectedTab] = useState("totalCredits");

  const { data } = useFetchCreditUsageSummary();
  const users = data?.data.users || [];
  const agents = data?.data.agents || [];

  const renderRow = (label: string, value: string | undefined) => (
    <div key={label + value} className="flex items-center justify-between gap-1 text-sm">
      <div className="w-4/5">{label}</div>
      <div className="w-1/5 text-end">{value}</div>
    </div>
  );

  return (
    <div className="rounded-lg rounded-tl-none border-l bg-white pb-2">
      <Tabs value={selectedTab} className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="w-full">
          <TabsTrigger value="totalCredits" className="w-full">
            Credits
          </TabsTrigger>
          <TabsTrigger value="totalTransactions" className="w-full">
            Executions
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-white px-3 text-base">
          <TabsTrigger value="users" className="rounded-none data-[state=active]:border-b-black">
            Users
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-none data-[state=active]:border-b-black">
            Agents
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content for Users */}
        <TabsContent value="users" className="space-y-4 px-4 py-2">
          {users.map((user) => {
            const fullName = user.firstName + " " + user.lastName;
            return (
              <div className="flex items-center justify-between gap-1" key={user.username}>
                <div className="flex w-4/5 items-center gap-3">
                  <Avatar className="flex h-7 w-7">
                    <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
                      {fullName
                        .split(" ")
                        .map((word) => word[0])
                        .join("") ?? "--"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{fullName}</p>
                </div>
                <p className="w-1/5 text-end text-sm">
                  {selectedTab == "totalCredits"
                    ? user.totalCredits.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })
                    : user.totalTransactions.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                </p>
              </div>
            );
          })}
        </TabsContent>

        {/* Tabs Content for Agents */}
        <TabsContent value="agents" className="space-y-4 px-4 py-2">
          {agents.map((user) => {
            return renderRow(
              user.agentName,
              selectedTab == "totalCredits"
                ? user.totalCredits.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })
                : user.totalTransactions.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  }),
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageTabs;
