// import { Button } from "@avplatform/ui/buttons";
// import { Plus, SquarePen, Trash2 } from "lucide-react";
// import { usePaymentMethodsDialogStore } from "@/features/05-tenant-admin/store/payment-methods/payment-methods-dialog-store";
import { DotSeparator } from "@avplatform/ui";

import { PaymentMethodDTO } from "@/features/05-tenant-admin/tenant/dtos/payment-methods-dto.ee";
import { useFetchPaymentMethods } from "@/features/05-tenant-admin/tenant/hooks/useFetchPaymentMethods.ee";

import PaymentMethodsDialog from "./PaymentMethodsDialog.ee";

const PaymentMethods = () => {
  // const { setOpen } = usePaymentMethodsDialogStore();
  const { data } = useFetchPaymentMethods();
  return (
    <>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-heading text-ink">Payment Methods</p>
          {/* <Button
            className="flex items-center gap-1 bg-selected text-primary-text"
            variant={"ghost"}
            size={"sm"}
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Payment Method
          </Button> */}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          {data?.data && data?.data?.length > 0 ? (
            data?.data
              .filter((v) => v?.type == "Card")
              .map((value: PaymentMethodDTO) => (
                //TODO: Update Icon and name
                <div className="col-span-1 flex items-center justify-between rounded-lg border px-4 py-4">
                  <div className="flex items-center gap-4">
                    {/* <img src={VisaIcon} alt="" /> */}
                    <div>
                      {/* Currently showing card name */}
                      <p className="text-md font-medium">{value.cardType + " " + value.type}</p>
                      <p className="flex items-center text-sm text-muted-foreground">
                        Ending {value.cardLast4} <DotSeparator /> Expires 12/2026{" "}
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-2">
              <p className="mr-2 rounded-sm bg-black px-2.5 text-sm font-medium text-white">
                Primary
              </p>
              <Button variant={"ghost"} size={"icon5"}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button variant={"ghost"} size={"icon5"}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div> */}
                </div>
              ))
          ) : (
            <div className="col-span-2 text-center text-sm">No results.</div>
          )}
        </div>
      </div>
      <PaymentMethodsDialog />
    </>
  );
};

export default PaymentMethods;
