import { useFetchDataFields } from "../hooks/useFetchDataFields";
import { PackageOpenIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import DataFieldCard from "./DataFieldCard";

const DataFieldList = () => {
  const { data } = useFetchDataFields();

  const { currAnnotationObj } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
    })),
  );

  return (
    <>
      {!data?.data.length ? (
        <div className="flex h-[calc(75vh-6rem)] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <PackageOpenIcon size={96} className="opacity-40" />
          <span>No fields added</span>
        </div>
      ) : (
        data?.data.map((item) => (
          <DataFieldCard currAnnotationObj={currAnnotationObj} item={item} />
        ))
      )}
    </>
  );
};

export default DataFieldList;
