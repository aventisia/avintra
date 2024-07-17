import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NotFoundPage, RedirectPage } from "@/react-toolkit/pages";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route>
          <Route path="/" element={<Navigate to="/Page1" />} />
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

const Page1 = () => {
  return <div>Page1</div>;
};

const Page2 = () => {
  return <div>Page2</div>;
};
