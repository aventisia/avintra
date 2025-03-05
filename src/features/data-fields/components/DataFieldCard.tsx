import { getObjectByName } from "@/features/pdf-previewer/utils";
import { Badge } from "@/react-toolkit/ui/badge";
import { DataFiledEditAction } from "./data-field-actions/DataFieldEditAction";
import ImageDisplay from "./ImageDisplay";
import { DeleteDataField } from "./data-field-actions/DeleteDataField";
import { DataFieldsDto } from "../dtos/data-fields-dtos";
import { Input } from "@/react-toolkit/ui/input";
import { useEffect, useState } from "react";

interface DataFieldCardProps {
  currAnnotationObj: string;
  item: DataFieldsDto;
}

const DataFieldCard = ({ item, currAnnotationObj }: DataFieldCardProps) => {
  //Get image path and value for data field
  const imgPath = getObjectByName(currAnnotationObj, item.name)?.imgPath || "";
  const inputVal = getObjectByName(currAnnotationObj, item.name)?.value || "";

  //Get set value for input field
  const [value, setValue] = useState("");

  //Update input value from annotation obj
  useEffect(() => {
    setValue(inputVal);
  }, [inputVal]);

  return (
    <div key={item.id} className="mb-4 rounded-lg border last:mb-0">
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
        <div className="flex items-center">
          <DataFiledEditAction id={item.id || ""} />
          <DeleteDataField id={item.id || ""} />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {imgPath && <ImageDisplay imagePath={imgPath} />}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fieldSize="sm"
        />
      </div>
    </div>
  );
};

export default DataFieldCard;
