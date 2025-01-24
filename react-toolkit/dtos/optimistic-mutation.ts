import { CrudActionType } from "@/react-toolkit/types/literal-types";

interface IOptimisticMutation<T> {
  payload: T;
  crudAction: CrudActionType;
}

export { type IOptimisticMutation };
