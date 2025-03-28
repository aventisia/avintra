export const OverviewDetails = () => {
  return (
    <div>
      <p className="text-md mb-2 border-b-2 pb-2">Overview</p>
      <div className="mt-4 flex flex-col gap-2 text-sm font-light">
        <div className="flex justify-between">
          <p>Unit Cost:</p>
          <p className="font-medium">$480.00</p>
        </div>
        <div className="flex justify-between">
          <p>Billed:</p>
          <p className="font-medium">Monthly</p>
        </div>
        <div className="flex justify-between">
          <p>Current Allocated Units:</p>
          <p className="font-medium">19</p>
        </div>
      </div>
    </div>
  );
};
