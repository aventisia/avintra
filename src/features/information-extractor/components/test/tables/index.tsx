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
  form: UseFormReturn<z.infer<typeof infoExtractorTestFormZodSchema>>;
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
        <div>
          <Tabs
            value={activeTab}
            defaultValue={"Table 1"}
            className="!mt-0.5 w-full"
            onValueChange={(val) => setActiveTab(val)}
          >
            <div className="mb-3 grid">
              <ScrollArea>
                <TabsList className="w-full justify-start !py-6">
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
                        {form.watch(`tables.${tableIndex}.name`)}
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
                    <div className="inline-block bg-accent rounded-t-lg border-b w-full px-1 py-4">
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
                                name={`tables.${tableIndex}.headers.${colIndex}.values.${rowIndex}`}
                                render={({ field }) => (
                                  <InputField
                                    {...field}
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    onKeyDown={(e) => {
                                      e.preventDefault();
                                      if (e.key === "Enter") {
                                        handleAddRow(tableIndex, rowIndex);
                                      }
                                    }}
                                  />
                                )}
                              />
                              {colIndex === table.headers.length - 1 &&
                                // Check if there's more than one row before showing delete button
                                table.headers[0].values.length > 1 && (
                                  <Button
                                    type="button"
                                    className="m-0 p-0"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteRow(tableIndex, rowIndex)
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          ))}
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
