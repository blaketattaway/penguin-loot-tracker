import { createContext, useContext } from "react";

import useAuth from "./useAuth";

interface PartyAccessContextType {
  /** True while a non-expired party token is in localStorage. */
  isUnlocked: boolean;
  checkPartyAccess: () => void;
  lock: () => void;
}

const initialContext: PartyAccessContextType = {
  isUnlocked: false,
  checkPartyAccess: () => {},
  lock: () => {},
};

export const PartyAccessContext =
  createContext<PartyAccessContextType>(initialContext);

const usePartyAccess = () => {
  const context = useContext(PartyAccessContext);
  if (!context)
    throw new Error("usePartyAccess should use within <PartyAccessProvider>");
  return context;
};

/**
 * Whether the party section should be visible at all, and how it was earned.
 *
 * Mirrors the API's `PartyAccess` policy, which takes either the party claim or
 * the officer one. Without this the two would disagree: the backend would serve
 * an officer their data while the frontend still showed them the code prompt.
 *
 * · `canView`  — show the nav entry and the section.
 * · `hasCode`  — this browser actually holds a party token, so "lock" means
 *                something. An officer who never typed the code has nothing to
 *                lock; they'd log out instead.
 */
export const usePartyVisibility = () => {
  const { isUnlocked } = usePartyAccess();
  const { isValid: isOfficer } = useAuth();

  return { canView: isUnlocked || isOfficer, hasCode: isUnlocked };
};

export default usePartyAccess;
