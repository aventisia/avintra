import { useSearchParams } from "react-router-dom";

const crudActionMapper: Record<string, string> = {
  update: "edit",
  read: "view",
};

export function useDataTableQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read data table crud action and row id. Possible values are "create", "edit", "view"
  const crudActionParam = searchParams.get("ca"); // ca means crud action
  const rowIdParam = searchParams.get("rid"); // rid means row/record id

  // Set CRUD action query param
  const setCrudAction = (action: string) => {
    setSearchParams((params) => {
      params.set("ca", crudActionMapper[action] ?? action);
      return params;
    });
  };

  // Set row id query param
  const setRowId = (id: string) => {
    setSearchParams((params) => {
      params.set("rid", id);
      return params;
    });
  };

  // Remove ca and rid params
  const clearCrudParams = () => {
    setSearchParams((params) => {
      params.delete("ca");
      params.delete("rid");
      return params;
    });
  };

  return {
    crudActionParam,
    rowIdParam,
    setCrudAction,
    setRowId,
    clearCrudParams,
    searchParams,
    setSearchParams,
  };
}
