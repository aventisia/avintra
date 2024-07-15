import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StudioUILayout } from "@/components/layout";
import { NotFoundPage, RedirectPage } from "@/react-toolkit/pages";
import { Page1 } from "./pages";
import { Page2 } from "./pages";

function App() {
  return (
    // IN VITE: basePath --base=<path> is set to env variable as BASE_URL when we run npm run dev/build
    <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route element={<StudioUILayout />}>
        <Route path="/" element={<Navigate to="/page1" />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page-not-found" element={<NotFoundPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Route>
      <Route path="/redirect" element={<RedirectPage />} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
