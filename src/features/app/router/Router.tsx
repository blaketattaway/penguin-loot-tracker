import { Navigate, Route, Routes } from "react-router-dom";

import Statistics from "../../statistics/Statistics";
import LootAssigner from "../../lootAssigner/LootAssigner";

const Router = () => {
  return (
    <Routes>
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/loot-assigner" element={<LootAssigner />} />
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
