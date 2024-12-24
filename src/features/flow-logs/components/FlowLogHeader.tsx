import { useLocation } from "react-router-dom";

const FlowLogHeader = () => {
  const { search } = useLocation();
  return (
    <a
      href={`/flow-logs${search}`}
      className={
        "flex h-6 items-center justify-center gap-2 text-sm font-semibold"
      }
    >
      <span>Logs</span>
    </a>
  );
};

export default FlowLogHeader;
