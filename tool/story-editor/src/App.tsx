import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "./store/editorStore";
import Dashboard from "./components/Dashboard/Dashboard";
import EditorLayout from "./components/Layout/EditorLayout";
import ConfigEditor from "./components/ConfigEditor/ConfigEditor";
import "./index.css";

// Vite natively supports importing JSON as an ES module.
// This embeds the data at build time — no fetch or running game server required.
import storyJson from "../../../public/assets/Story.ja.json";

// Component to handle auto-loading of story data
const AutoLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { storyData } = useSnapshot(editorStore);

  useEffect(() => {
    if (!storyData) {
      editorActions.loadStory(storyJson as any);
    }
  }, [storyData]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AutoLoader>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:chapterIndex" element={<EditorLayout />} />
          <Route path="/config" element={<ConfigEditor />} />
        </Routes>
      </AutoLoader>
    </BrowserRouter>
  );
};

export default App;
