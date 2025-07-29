import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import { infoExtractorTestFormZodSchema } from "@/features/information-extractor/constants/info-extractor-test-zod-schema";
import { useInformationExtractorTestTableStore } from "@/features/information-extractor/stores/information-extractor-test-table-store";

import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

type FormSchema = z.infer<typeof infoExtractorTestFormZodSchema>;
type Field = NonNullable<FormSchema["tables"]>[number] & { id: string };

type ExtractedTablesDataProps = {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
  tableFields: Field[];
  handleAddRow: (tableIdx: number, rowIdx: number) => void;
  handleDeleteRow: (tableIdx: number, rowIdx: number) => void;
};

const ExtractedTablesData = ({
  form,
  tableFields,
  handleAddRow,
  handleDeleteRow,
}: ExtractedTablesDataProps) => {
  const { control } = form;

  const { activeTab, setActiveTab } = useInformationExtractorTestTableStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    })),
  );
  return (
    <div className="space-y-3">
      <p className="text-base">Tables</p>
      {tableFields && tableFields.length > 0 && (
        <div className="border rounded-lg p-2 bg-slate-50">
          <Tabs
            value={activeTab}
            defaultValue={"Table 1"}
            className="!mt-0.5 w-full"
            onValueChange={(val) => setActiveTab(val)}
          >
            <div className="mb-3">
              <ScrollArea>
                <TabsList className="w-full justify-start !py-6 bg-slate-100">
                  {tableFields.map((_, tableIndex) => (
                    <TabsTrigger
                      value={`Table ${tableIndex + 1}`}
                      key={tableIndex}
                      className="rounded-xl bg-transparent px-4"
                    >
                      <Button
                        size="xs"
                        type="button"
                        variant="ghost"
                        className="p-0 text-sm hover:bg-transparent"
                      >
                        {form.watch(`extraction.tables.${tableIndex}.name`)}
                      </Button>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Tables */}
            {tableFields.map((table, tableIndex) => {
              const tabValue = `Table ${tableIndex + 1}`;
              return (
                <TabsContent key={tableIndex} value={tabValue}>
                  <div
                    key={table.id}
                    className="space-y-4 border-b-0 border rounded-lg"
                  >
                    {/* Table Headers */}
                    <div className="inline-block rounded-t-lg border-b w-full px-1 py-4">
                      <div className="flex text-sm gap-3 ">
                        {table.headers.map((item, rowIndex) => {
                          return (
                            <div
                              key={rowIndex}
                              className="flex-1 px-3 text-left"
                            >
                              {item.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Table Rows */}
                    <div className="!mt-0">
                      {Array.from({
                        length: Math.max(
                          ...table.headers.map((col) => col.values.length),
                        ),
                      }).map((_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex text-sm border-b py-1"
                        >
                          {table.headers.map((_, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex-1 items-center gap-1 px-3 py-1"
                            >
                              <Controller
                                control={control}
                                name={`extraction.tables.${tableIndex}.headers.${colIndex}.values.${rowIndex}`}
                                render={({ field }) => (
                                  <InputField
                                    {...field}
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddRow(tableIndex, rowIndex);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </div>
                          ))}
                          {table.headers[0].values.length > 1 && (
                            <div className="w-6 px-1 flex justify-center items-center">
                              <Button
                                type="button"
                                className="m-0 p-0 mr-3"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteRow(tableIndex, rowIndex)
                                }
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
            {/* <ScrollBar orientation="horizontal" />
            </ScrollArea> */}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ExtractedTablesData;
