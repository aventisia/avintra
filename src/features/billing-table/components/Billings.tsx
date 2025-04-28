import { Separator } from "@/react-toolkit/ui/separator";

import { AddressTable } from "./address-table/AddressTable";
import { InovicesTable } from "./InovicesTable";

export const Billings = () => {
  return (
    <div className="mt-6">
      <h2 className="ml-1 flex w-full items-center truncate text-2xl font-bold tracking-wide text-foreground">
        Billings
      </h2>
      <div className="mt-6 grid grid-flow-row gap-4 rounded-md px-4">
        <AddressTable />
        <Separator className="my-2" />
        <InovicesTable />
      </div>
    </div>
  );
};
