import { getObjectByName } from "@/features/pdf-previewer/utils";
import { Badge } from "@/react-toolkit/ui/badge";
import { DataFiledEditAction } from "./data-field-actions/DataFieldEditAction";
import ImageDisplay from "./ImageDisplay";
import { DeleteDataField } from "./data-field-actions/DeleteDataField";
import { DataFieldsDto } from "../dtos/data-fields-dtos";

interface DataFieldCardProps {
  currAnnotationObj: string;
  item: DataFieldsDto;
}

const DataFieldCard = ({ item, currAnnotationObj }: DataFieldCardProps) => {
  //Get image path for data field
  const imgPath = getObjectByName(currAnnotationObj, item.name)?.imgPath || "";

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
        <DataFiledEditAction id={item.id || ""} />
      </div>
      <div className="flex items-center justify-between p-2">
        <ImageDisplay imagePath={imgPath} />
        <DeleteDataField id={item.id || ""} />
      </div>
    </div>
  );
};

export default DataFieldCard;
