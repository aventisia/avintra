import { Outlet } from "react-router-dom";

const AuthUILayout = () => {
  return (
    <main className="flex h-screen justify-center">
      <div className="flex h-fit min-h-screen w-full space-x-2 overflow-auto p-3">
        <Outlet />
      </div>
    </main>
  );
};

export { AuthUILayout };
