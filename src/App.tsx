import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotFoundPage, RedirectPage } from "@/react-toolkit/pages";
import { AuthUILayout } from "@/components/layout";
import { CreateAccountPage, LogInPage } from "@/pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AuthUILayout />}>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/page-not-found" element={<NotFoundPage />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Route>
          <Route path="/redirect" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
