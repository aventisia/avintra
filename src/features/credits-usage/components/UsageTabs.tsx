import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

const usersDummyData = [
  {
    id: window.crypto.randomUUID(),
    name: "Gaurav Kumar",
    creditsUsed: 10,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Rahmat Ali",
    creditsUsed: 20,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Chirag Agrawal",
    creditsUsed: 22,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Kaushal Agrawal",
    creditsUsed: 30,
  },
];

const UsageTabs = () => {
  return (
    <div className="border-l bg-white py-2">
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

        {/* Tabs Content for Users */}
        <TabsContent value="users" className="space-y-4 px-4 py-2">
          {usersDummyData.map((user) => {
            return (
              <div className="flex items-center justify-between" key={user.id}>
                <div className="flex items-center gap-3">
                  <Avatar className="flex h-7 w-7">
                    <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
                      {user.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("") ?? "--"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{user.name}</p>
                </div>
                <p className="text-sm">{user.creditsUsed}</p>
              </div>
            );
          })}
        </TabsContent>

        {/* Tabs Content for AI Models */}
        <TabsContent value="aiModels" className="space-y-4 px-4 py-2">
          {usersDummyData.map((user) => {
            return (
              <div className="flex items-center justify-between" key={user.id}>
                <div className="flex items-center gap-3">
                  <Avatar className="flex h-7 w-7">
                    <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
                      {user.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("") ?? "--"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{user.name}</p>
                </div>
                <p className="text-sm">{user.creditsUsed}</p>
              </div>
            );
          })}
        </TabsContent>

        {/* Tabs Content for Agents */}
        <TabsContent value="agents" className="space-y-4 px-4 py-2">
          {usersDummyData.map((user) => {
            return (
              <div className="flex items-center justify-between" key={user.id}>
                <div className="flex items-center gap-3">
                  <Avatar className="flex h-7 w-7">
                    <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
                      {user.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("") ?? "--"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{user.name}</p>
                </div>
                <p className="text-sm">{user.creditsUsed}</p>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageTabs;
