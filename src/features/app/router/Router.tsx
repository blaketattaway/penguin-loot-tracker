import { Navigate, Route, Routes } from "react-router-dom";

import Statistics from "../../statistics/Statistics";
import LootAssigner from "../../lootAssigner/LootAssigner";

const Router = () => {
  return (
    <Routes>
      <Route path="/penguin-loot-tracker/statistics" element={<Statistics />} />

      <Route
        path="/penguin-loot-tracker/loot-asigner"
        element={<LootAssigner />}
      />
      <Route
        path="*"
        element={<Navigate to="/penguin-loot-tracker/statistics" />}
      />
    </Routes>
  );
};

export default Router;
