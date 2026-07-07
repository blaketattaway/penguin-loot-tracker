import { Navigate, Route, Routes } from "react-router-dom";

import Welcome from "../Welcome/Welcome";
import Statistics from "../../statistics/Statistics";
import LootAssigner from "../../lootAssigner/LootAssigner";
import CharacterLinker from "../../characters/CharacterLinker";

const Router = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/loot-assigner" element={<LootAssigner />} />
      <Route path="/characters" element={<CharacterLinker />} />
      {/* Redirect the old misspelled route so existing bookmarks keep working. */}
      <Route
        path="/loot-asigner"
        element={<Navigate to="/loot-assigner" replace />}
      />
      <Route path="*" element={<Navigate to="/statistics" />} />
    </Routes>
  );
};

export default Router;
