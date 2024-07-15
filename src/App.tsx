import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudioUILayout } from "@/components/layout";
import { NotFoundPage, RedirectPage } from "@/react-toolkit/pages";
import { FlowPage } from "./pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<StudioUILayout />}>
            <Route path="/" element={<Navigate to="/flow" />} />
            <Route path="/flow" element={<FlowPage />} />
            <Route path="/page-not-found" element={<NotFoundPage />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Route>
          <Route path="/redirect" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
