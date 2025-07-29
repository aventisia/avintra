import { TemplateListDTO } from "@/features/save-as-template/dtos/template-list-dto";
import { useFetchTemplateList } from "@/features/save-as-template/hooks/useFetchTemplatesList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/select-field/Select";

import { Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aventisia/ui/cards";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Copy } from "lucide-react";
import { useMemo, useState } from "react";

import { useModelLibraryDialogStore } from "../../store/model-library-dialog-store";

const ModelLibrary = () => {
  const { data, isLoading } = useFetchTemplateList();
  const { setOpen, setTemplateToUse } = useModelLibraryDialogStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 🆕

  const items = useMemo(() => data?.data ?? [], [data]);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [currentPage, items, itemsPerPage]);

  if (isLoading || !data || data?.data.length === 0) {
    return null;
  }

  const handleTemplateToUse = (template: TemplateListDTO) => {
    const {
      id,
      name,
      refId,
      type,
      createdBy,
      description,
      accessType,
      tags,
      usagesCount,
    } = template;
    setOpen(true);
    setTemplateToUse({
      id,
      name,
      refId,
      type,
      createdBy,
      description,
      accessType,
      tags,
      usagesCount,
    });
  };

  return (
    <div className="mt-8 pb-4">
      <p className="px-2">Choose from our Model Library:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {currentItems.map((item) => {
          return (
            <Card
              key={item.id}
              className="cursor-pointer shadow-none border-primary-100 hover:shadow-md rounded-3xl"
              onClick={() => handleTemplateToUse(item)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-accent p-2 rounded-lg">
                    <img
                      src={"/brand-img/gemma.svg"}
                      alt=""
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="bg-accent p-2 rounded-lg">
                    <img
                      src={"/brand-img/mistral.svg"}
                      alt=""
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="bg-accent p-2 rounded-lg">
                    <img
                      src={"/brand-img/phi-4.svg"}
                      alt=""
                      className="h-6 w-6"
                    />
                  </div>
                </div>
                <CardTitle className="font-semibold capitalize !mt-5 text-base">
                  {item.name}
                </CardTitle>
                <CardDescription className="line-clamp-4 min-h-[5rem] text-muted-foreground">
                  {item.description || "No description available"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-1">
                <Badge
                  className="border-primary-500 text-primary-500"
                  variant={"outline"}
                >
                  {item.type}
                </Badge>
                <Separator />
              </CardContent>

              <CardFooter className="flex items-center justify-between !pb-3.5">
                <div className="flex items-center gap-2">
                  <Badge className="!rounded-full h-6 w-6 !p-0 flex justify-center text-3xs bg-primary-500">
                    {item?.createdBy &&
                      item?.createdBy
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                  </Badge>
                  <p className="text-xs text-accent-foreground">
                    {item.createdBy}
                  </p>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Button
                    variant={"ghost"}
                    className="p-0 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(`${item.usagesCount}`);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <p>{item.usagesCount}</p>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8 mt-5 justify-end">
        <div className="hidden items-center space-x-2 xs:flex">
          <p className="text-sm font-medium">Model Templates per page</p>
          <Select
            value={`${itemsPerPage}`}
            onValueChange={(value) => {
              const newSize = Number(value);
              setItemsPerPage(newSize);
              setCurrentPage(1); // Optional: Reset to first page when changing size
            }}
          >
            <SelectTrigger className="h-8 w-[4rem]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[4rem]">
              {[6, 12, 20, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelLibrary;
