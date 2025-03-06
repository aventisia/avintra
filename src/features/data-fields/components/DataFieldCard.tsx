import {
  addUpdateInString,
  getObjectByName,
} from "@/features/pdf-previewer/utils";
import { Badge } from "@/react-toolkit/ui/badge";
import { Input } from "@/react-toolkit/ui/input";
import { useEffect, useState } from "react";
import { DataFieldsDto } from "../dtos/data-fields-dtos";
import { DataFiledEditAction } from "./data-field-actions/DataFieldEditAction";
import { DeleteDataField } from "./data-field-actions/DeleteDataField";
import ImageDisplay from "./ImageDisplay";
import { Annotation } from "@/features/pdf-previewer/components/PdfPreviewer";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useShallow } from "zustand/react/shallow";

interface DataFieldCardProps {
  item: DataFieldsDto;
}

const DataFieldCard = ({ item }: DataFieldCardProps) => {
  const { currAnnotationObj, setAnnotationObject, setIsSavePending } =
    useAnnotationDataStore(
      useShallow((state) => ({
        currAnnotationObj: state.currAnnotationObj,
        setAnnotationObject: state.setAnnotationObject,
        setIsSavePending: state.setIsSavePending,
      })),
    );

  //Get image path and value for data field
  const imgPath = getObjectByName(currAnnotationObj, item.name)?.imgPath || "";
  const inputVal = getObjectByName(currAnnotationObj, item.name)?.value || "";

  //Get set value for input field
  const [value, setValue] = useState(inputVal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Update local state
    setValue(newValue);
    const newAnnotation: Annotation = {
      fieldId: item.id || "",
      fieldName: item.name,
      value: newValue,
      pageNumber: 0,
      position: { x: 0, y: 0, width: 0, height: 0 },
    };
    setAnnotationObject(
      addUpdateInString(currAnnotationObj || "", newAnnotation),
    );
  };
  //Update input value from annotation obj
  useEffect(() => {
    setValue(inputVal);
    setIsSavePending(true);
  }, [inputVal]);

  return (
    <div key={item.id} className="mb-4 rounded-lg border last:mb-0">
      <div className="flex items-center justify-between border-b bg-blue-50 px-3 py-1">
        <div className="flex gap-3">
          <div className={`mt-1 h-4 w-4 rounded-full bg-white`}>
            <div
              className={`h-4 w-4 rounded-full opacity-40 bg-${item.color}-500`}
            />
          </div>
          <p className="mt-0.5 text-sm font-medium">{item.name}</p>
          <Badge
            variant={"secondary"}
            className={`w-auto truncate px-2.5 py-0 font-medium capitalize`}
          >
            {item.type}
          </Badge>
        </div>
        <div className="flex items-center">
          <DataFiledEditAction id={item.id || ""} />
          <DeleteDataField id={item.id || ""} />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {imgPath && <ImageDisplay imagePath={imgPath} />}
        <Input value={value} onChange={handleInputChange} fieldSize="sm" />
      </div>
    </div>
  );
};

export default DataFieldCard;
