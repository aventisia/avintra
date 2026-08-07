import ServiceUrlPage from "./ServiceUrlPage";
import { TauriAppFooter } from "./TuariAppFooter";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-violet-50">
      <ServiceUrlPage />

      <footer>
        <TauriAppFooter />
      </footer>
    </div>
  );
}

export default App;
