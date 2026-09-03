import { Navigate, Route, Routes } from "react-router-dom";

import Welcome from "../Welcome/Welcome";
import Statistics from "../../statistics/Statistics";
import LootAssigner from "../../lootAssigner/LootAssigner";
import CharacterLinker from "../../characters/CharacterLinker";
import PartyTracker from "../../partyTracker/PartyTracker";

const Router = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/loot-assigner" element={<LootAssigner />} />
      <Route path="/characters" element={<CharacterLinker />} />
      {/* Penguin Party Tracker. Not linked from the nav until unlocked — the
          route itself is the invitation, and the code is what opens it. */}
      <Route path="/party" element={<PartyTracker />} />
      <Route path="/party/:year" element={<PartyTracker />} />
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
