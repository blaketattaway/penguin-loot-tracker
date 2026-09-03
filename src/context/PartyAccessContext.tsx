import { PropsWithChildren, useEffect, useState } from "react";

import {
  PARTY_TOKEN_EXPIRATION_KEY,
  PARTY_TOKEN_KEY,
} from "../hooks/endpoints";
import { PartyAccessContext } from "../hooks/usePartyAccess";

/**
 * Holds whether this browser has unlocked the party section.
 *
 * The token is the gate, not this flag: the backend serves no party data — and
 * no photo url — without it, so flipping this in devtools reveals an empty
 * page. Kept separate from AuthContext because the two grants are different
 * things: the party code is shared with the whole guild and only ever reads,
 * while the officer login writes loot.
 */
export const PartyAccessProvider = ({ children }: PropsWithChildren) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const checkPartyAccess = () => {
    const token = localStorage.getItem(PARTY_TOKEN_KEY);
    const expiration = localStorage.getItem(PARTY_TOKEN_EXPIRATION_KEY);

    setIsUnlocked(!!token && !!expiration && new Date(expiration) > new Date());
  };

  const lock = () => {
    localStorage.removeItem(PARTY_TOKEN_KEY);
    localStorage.removeItem(PARTY_TOKEN_EXPIRATION_KEY);
    setIsUnlocked(false);
  };

  useEffect(() => {
    checkPartyAccess();

    // Unlocking in one tab should open the section in the others.
    const handleStorageChange = () => checkPartyAccess();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <PartyAccessContext.Provider value={{ isUnlocked, checkPartyAccess, lock }}>
      {children}
    </PartyAccessContext.Provider>
  );
};
