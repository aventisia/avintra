import { useNavigation, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { CrudActionTypeLong } from "../constants";
import { useDTCrudDialogStore } from "../stores/dt-crud-dialog-store";

export const useDtCrudQueryAction = <TData extends { id?: string }>(
  data: TData[] | undefined,
) => {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  // const navigate = useNavigate();

  useDTCrudDialogStore.subscribe(
    (state) => state,
    () => {
      // navigate({ pathname: navigation.location?.pathname ,});
      console.log(navigation.location?.pathname);
    },
  );

  const { setShowDialog, setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );
  const id = searchParams.get("id");
  const action = searchParams.get("a");
  if (
    !!id &&
    !!action &&
    !!CrudActionTypeLong[action] &&
    !!data?.some((x) => x.id == id)
  ) {
    setCrudDialogOptions({
      rowId: id ?? window.crypto.randomUUID(),
      crudAction: CrudActionTypeLong[action],
      showDialog: true,
    });
    setShowDialog(true);
  }
};
