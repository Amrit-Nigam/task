import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ExplorerPage } from "@/pages/ExplorerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The detail panel is a URL, so any Pokémon can be linked directly. */}
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/pokemon/:name" element={<ExplorerPage />} />
        <Route path="*" element={<ExplorerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
