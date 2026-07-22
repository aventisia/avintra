import { type CrudActionType } from "@/ui/types";

interface IOptimisticMutation<T> {
  payload: T;
  crudAction: CrudActionType;
}

export { type IOptimisticMutation };
