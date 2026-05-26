// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

// import { RolesTable } from "./tables/roles-table/components/RolesTable";
import { UsersTable } from "./tables/users-table/components/UsersTable";

export const UserManagement = () => {
  return (
    <div className="">
      {/* <p className="py-3 text-2xl font-semibold">User Manager</p> */}
      {/* <div className="w-full rounded border p-5"> */}
      {/* <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList> */}
      {/* <TabsContent value="roles">
            <RolesTable />
          </TabsContent>
          <TabsContent value="users"> */}
      <UsersTable />
      {/* </TabsContent>
        </Tabs> */}
      {/* </div> */}
    </div>
  );
};
