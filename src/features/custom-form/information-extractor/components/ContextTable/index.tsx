// components/ContextTablesSection.tsx
import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  headerNameProps,
  instructionsProps,
  tableContextProps,
  tableNameProps,
  typeProps,
} from "../../constants/info-extractor-form-field-props";
import { z } from "zod";
import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";
import { Tabs, TabsList, TabsTrigger } from "@/react-toolkit/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";
import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { TabsActionsTrigger } from "./TabsActionsTrigger";
import { TabsDeleteAction } from "./TabsActions/TabsDeleteAction";
import { TabsRenameAction } from "./TabsActions/TabsRenameAction";
import { useInformationExtractorTableStore } from "../../stores/info-extractor-table-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/react-toolkit/ui/alert-dialog";
import { buttonVariants } from "@aventisia/ui/buttons";

type Table = NonNullable<
  z.infer<typeof addInfoExtractorFormZodSchema>["tables"]
>[number];
type TableDataItem = Table["tableData"][number];

type ContextTablesProps = {
  form: UseFormReturn<z.infer<typeof addInfoExtractorFormZodSchema>>;
  tableFields: {
    id: string;
    tableContext?: string;
    tableName?: string;
    tableData: TableDataItem[];
  }[];
  addTableHandler: () => void;
  removeTableHandler: (index: number | null) => void;
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
  const {
    activeTab,
    setActiveTab,
    showDeleteTableAlertDialog,
    setShowDeleteTableAlertDialog,
    tableToDeleteIndex,
    tableToEditNameIndex,
    setTableToEditNameIndex,
  } = useInformationExtractorTableStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      showDeleteTableAlertDialog: state.showDeleteTableAlertDialog,
      setShowDeleteTableAlertDialog: state.setShowDeleteTableAlertDialog,
      tableToDeleteIndex: state.tableToDeleteIndex,
      tableToEditNameIndex: state.tableToEditNameIndex,
      setTableToEditNameIndex: state.setTableToEditNameIndex,
    })),
  );

  return (
    <div className="space-y-4">
      {tableFields && tableFields.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-base">Tables</p>
            <Button
              variant="ghost"
              size="icon8"
              onClick={addTableHandler}
              type="button"
            >
              <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
            </Button>
          </div>
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
                      className="flex items-center gap-0 rounded-xl bg-transparent px-3"
                    >
                      {tableIndex === tableToEditNameIndex ? (
                        <Controller
                          control={control}
                          name={`tables.${tableIndex}.tableName`}
                          render={({ field }) => (
                            <InputField
                              {...tableNameProps}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={() => {
                                field.onBlur();
                                setTableToEditNameIndex(null);
                              }}
                              name={field.name}
                              autoFocus
                            />
                          )}
                        />
                      ) : (
                        <Button
                          size="xs"
                          type="button"
                          variant="ghost"
                          className="p-0 text-sm hover:bg-transparent"
                          onDoubleClick={() =>
                            setTableToEditNameIndex(tableIndex)
                          }
                        >
                          {form.watch(`tables.${tableIndex}.tableName`)}
                        </Button>
                      )}

                      <DropdownMenu>
                        <TabsActionsTrigger />
                        <DropdownMenuContent
                          align="end"
                          className="mt-2 w-[8rem] min-w-[6rem]"
                        >
                          <TabsRenameAction idx={tableIndex} />
                          <TabsDeleteAction idx={tableIndex} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {tableFields.map((table, tableIndex) => {
              const tabValue = `Table ${tableIndex + 1}`;
              return (
                <TabsContent key={tableIndex} value={tabValue}>
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
                      <div className="grid grid-cols-3 bg-accent px-1 py-3 text-sm">
                        <div className="px-3">Header Name</div>
                        <div className="px-3">Type</div>
                        <div className="px-3">Instructions</div>
                      </div>

                      {table.tableData.map((_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`justify-left grid grid-cols-3 gap-2 ${
                            rowIndex !== table.tableData.length - 1 &&
                            "border-b"
                          } p-2.5`}
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

                          <div className="flex items-center gap-1">
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
                                variant="ghost"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Header Button */}
                    <Button
                      size="xs"
                      variant="outline"
                      className="w-full space-x-0.5 bg-muted text-sm text-primary hover:text-primary"
                      type="button"
                      onClick={() => addTableHeaderHandler(tableIndex)}
                    >
                      <PlusIcon className="h-4 w-4 stroke-2 text-primary" />
                      <span>Add Header</span>
                    </Button>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </>
      )}

      {/* Add Table Button */}
      {!tableFields ||
        (tableFields.length === 0 && (
          <Button
            onClick={addTableHandler}
            type="button"
            variant="outline"
            size="xs"
            className="w-full space-x-0.5 border-dashed bg-transparent py-6 text-sm font-normal text-muted-foreground"
          >
            <PlusIcon className="h-4 w-4 stroke-2" />
            <span>Add Table</span>
          </Button>
        ))}

      <AlertDialog
        open={showDeleteTableAlertDialog}
        onOpenChange={setShowDeleteTableAlertDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              table ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => removeTableHandler(tableToDeleteIndex)}
            >
              Yes, delete table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContextTables;
