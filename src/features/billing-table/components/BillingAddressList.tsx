import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";

export const BillingAddressList = () => {
  return (
    <div className="my-4">
      <div className="flex justify-between p-4">
        <p>My Addresses</p>
        <DTCreateButton buttonText="Add Address" />
      </div>
      <ul>
        <li>
          <div className="flex content-between justify-between rounded-md border p-4 px-8 align-middle">
            <div className="flex flex-col gap-2">
              <p>Billing Address #1</p>
              <div className="flex flex-col space-y-1 text-muted-foreground">
                <p>address</p>
                <p>pincode city</p>
                <p>state country</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button className="bg-primary-100" variant="outline">
                Edit
              </Button>
            </div>
          </div>
        </li>
        <li>
          <div className="flex content-between justify-between rounded-md border p-4 px-8 align-middle">
            <div className="flex flex-col gap-2">
              <p>Billing Address #1</p>
              <div className="flex flex-col space-y-1 text-muted-foreground">
                <p>address</p>
                <p>pincode city</p>
                <p>state country</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button className="bg-primary-100" variant="outline">
                Edit
              </Button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};
