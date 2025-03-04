import { Badge } from "@/react-toolkit/ui/badge";
import { useFetchDataFields } from "../hooks/useFetchDataFields";
import { DeleteDataField } from "./data-field-actions/DeleteDataField";
import { PackageOpenIcon } from "lucide-react";
import { DataFiledEditAction } from "./data-field-actions/DataFieldEditAction";
import { useShallow } from "zustand/react/shallow";
import ImageDisplay from "./ImageDisplay";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";

const DataFieldCard = () => {
  const { data } = useFetchDataFields();

  const { currAnnotationObj } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
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
        data?.data.map((item, index) => {
          return (
            <div
              key={index + "sdgsd"}
              className="mb-4 rounded-lg border last:mb-0"
            >
              <div className="flex items-center justify-between border-b bg-blue-50 p-2">
                <div className="flex gap-4">
                  <div className={`mt-1 h-4 w-4 rounded-full bg-white`}>
                    <div
                      className={`h-4 w-4 rounded-full opacity-40 bg-${item.color}-500`}
                    />
                  </div>
                  <p className="mt-0.5 text-md font-medium">{item.name}</p>
                  <Badge
                    variant={"secondary"}
                    className={`w-auto truncate px-1.5 py-0 font-medium capitalize`}
                  >
                    <p className="text-sm">{item.type}</p>
                  </Badge>
                </div>
                <DataFiledEditAction id={item.id || ""} />
              </div>
              <div className="flex items-center justify-between p-2">
                <ImageDisplay
                  imagePath={
                    JSON.parse(currAnnotationObj || "{}")[item.name || 0]
                      ?.imgPath
                  }
                />
                <DeleteDataField id={item.id || ""} />
              </div>
            </div>
          );
        })
      )}
    </>
  );
};

export default DataFieldCard;
