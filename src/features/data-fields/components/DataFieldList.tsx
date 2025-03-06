import { PackageOpenIcon } from "lucide-react";
import { useFetchDataFields } from "../hooks/useFetchDataFields";
import DataFieldCard from "./DataFieldCard";

const DataFieldList = () => {
  const { data } = useFetchDataFields();

  return (
    <>
      {!data?.data.length ? (
        <div className="flex h-[calc(100vh-12rem)] w-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <PackageOpenIcon className="h-16 w-16 stroke-[1.5] opacity-40" />
          <span>No fields added</span>
        </div>
      ) : (
        data?.data.map((item) => <DataFieldCard item={item} />)
      )}
    </>
  );
};

export default DataFieldList;
