import ServiceUrlPage from "./ServiceUrlPage";
import "./App.css";
import { TauriAppFooter } from "./TuariAppFooter";
function App() {
  return (
    <div className="app-page">
      <ServiceUrlPage />

      <footer>
        <TauriAppFooter />
      </footer>
    </div>
  );
}

export default App;
