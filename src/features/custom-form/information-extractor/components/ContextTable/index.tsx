// components/ContextTablesSection.tsx
import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Plus } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  headerNameProps,
  instructionsProps,
  tableContextProps,
  typeProps,
} from "../../constants/info-extractor-form-field-props";
import { z } from "zod";
import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";

type Table = NonNullable<
  z.infer<typeof addInfoExtractorFormZodSchema>["tables"]
>[number];
type TableDataItem = Table["tableData"][number];

type ContextTablesProps = {
  form: UseFormReturn<z.infer<typeof addInfoExtractorFormZodSchema>>;
  tableFields: { id: string; tableData: TableDataItem[] }[];
  addTableHandler: () => void;
  removeTableHandler: (index: number) => void;
  addTableHeaderHandler: (index: number) => void;
  removeTableHeaderHandler: (tableIndex: number, rowIndex: number) => void;
};

const ContextTables = ({
  form,
  tableFields,
  addTableHandler,
  removeTableHandler,
  addTableHeaderHandler,
  removeTableHeaderHandler,
}: ContextTablesProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      {tableFields &&
        tableFields.length > 0 &&
        tableFields.map((table, tableIndex) => (
          <div key={table.id} className="space-y-4">
            {/* Table context */}
            <Controller
              control={control}
              name={`tables.${tableIndex}.tableContext`}
              render={({ field }) => (
                <InputField
                  {...tableContextProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />

            {/* Table Headers */}
            <div className="inline-block rounded-lg border">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] text-center text-sm">
                <div className="border-b border-r p-2">Header Name</div>
                <div className="border-b border-r p-2">Type</div>
                <div className="border-b p-2">Instructions</div>
                <div className="border-b p-2"></div>
              </div>

              {table.tableData.map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid grid-cols-[1fr_1fr_1fr_auto] justify-center gap-2 ${
                    rowIndex !== table.tableData.length - 1 && "border-b"
                  } p-2`}
                >
                  {/* Header Name */}
                  <Controller
                    control={control}
                    name={`tables.${tableIndex}.tableData.${rowIndex}.headerName`}
                    render={({ field }) => (
                      <InputField
                        {...headerNameProps}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />

                  {/* Type */}
                  <Controller
                    control={control}
                    name={`tables.${tableIndex}.tableData.${rowIndex}.type`}
                    render={({ field }) => (
                      <SelectField
                        {...typeProps}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />

                  {/* Instructions */}
                  <Controller
                    control={control}
                    name={`tables.${tableIndex}.tableData.${rowIndex}.instructions`}
                    render={({ field }) => (
                      <InputField
                        {...instructionsProps}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />

                  {/* Delete button */}
                  {table.tableData.length > 1 && (
                    <Button
                      type="button"
                      onClick={() =>
                        removeTableHeaderHandler(tableIndex, rowIndex)
                      }
                      className="m-0 p-0"
                      variant="caution"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Header Button */}
            <Button
              size="xs"
              variant="outline"
              className="w-full space-x-0.5 bg-muted text-sm text-primary"
              type="button"
              onClick={() => addTableHeaderHandler(tableIndex)}
            >
              <Plus size={18} /> <span>Add Header</span>
            </Button>

            {/* Delete Table */}
            <div className="rounded-lg border text-center">
              <Button
                type="button"
                onClick={() => removeTableHandler(tableIndex)}
                className="m-0 h-8 w-full p-0"
                variant="caution"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}

      {/* Add Table Button */}
      <Button
        onClick={addTableHandler}
        type="button"
        size="xs"
        className="mt-2 w-full space-x-0.5 text-sm"
      >
        <Plus size={18} /> <span>Add Table</span>
      </Button>
    </div>
  );
};

export default ContextTables;
