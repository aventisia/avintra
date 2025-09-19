import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import { useState } from "react";

const UsageTabs = () => {
  const [selectedTab, setSelectedTab] = useState("totalCredits");

  const { data } = useFetchCreditUsageSummary();
  const users = data?.data.users || [];
  const aiModels = data?.data.aiModels || [];
  const agents = data?.data.agents || [];

  return (
    <div className="rounded-lg border-l bg-white py-2">
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-white px-3 text-base">
          <TabsTrigger
            value="users"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="aiModels"
            className="rounded-none data-[state=active]:border-b-black"
          >
            AI Models
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Agents
          </TabsTrigger>
        </TabsList>
        <div className="flex justify-end p-1">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="rounded-full py-1">
              <TabsTrigger
                value="totalCredits"
                className="rounded-full px-4 py-1 text-xs"
              >
                Credits
              </TabsTrigger>
              <TabsTrigger
                value="totalTransactions"
                className="rounded-full px-4 py-1 text-xs"
              >
                Transactions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Tabs Content for Users */}
        <TabsContent value="users" className="space-y-4 px-4 py-2">
          {users.map((user) => {
            const fullName = user.firstName + " " + user.lastName;
            return (
              <div
                className="flex items-center justify-between"
                key={user.username}
              >
                <div className="flex items-center gap-3">
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
                <p className="text-sm">
                  {selectedTab == "totalCredits"
                    ? user.totalCredits
                    : user.totalTransactions}
                </p>
              </div>
            );
          })}
        </TabsContent>

        {/* Tabs Content for AI Models */}
        <TabsContent value="aiModels" className="space-y-4 px-4 py-2">
          {aiModels.map((user) => {
            return (
              <div
                className="flex items-center justify-between"
                key={user.modelName + user.totalCredits}
              >
                <p className="text-sm">{user.modelName}</p>
                <p className="text-sm">
                  {selectedTab == "totalCredits"
                    ? user.totalCredits
                    : user.totalTransactions}
                </p>
              </div>
            );
          })}
        </TabsContent>

        {/* Tabs Content for Agents */}
        <TabsContent value="agents" className="space-y-4 px-4 py-2">
          {agents.map((user) => {
            return (
              <div
                className="flex items-center justify-between"
                key={user.agentName + user.totalCredits}
              >
                <p className="text-sm">{user.agentName}</p>
                <p className="text-sm">
                  {selectedTab == "totalCredits"
                    ? user.totalCredits
                    : user.totalTransactions}
                </p>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageTabs;
