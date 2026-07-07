// Iconic WoW class colors, keyed by Blizzard's stable class id.
const CLASS_COLORS: Record<number, string> = {
  1: "#C69B6D", // Warrior
  2: "#F48CBA", // Paladin
  3: "#AAD372", // Hunter
  4: "#FFF468", // Rogue
  5: "#FFFFFF", // Priest
  6: "#C41E3A", // Death Knight
  7: "#0070DD", // Shaman
  8: "#3FC7EB", // Mage
  9: "#8788EE", // Warlock
  10: "#00FF98", // Monk
  11: "#FF7C0A", // Druid
  12: "#A330C9", // Demon Hunter
  13: "#33937F", // Evoker
};

export const classColor = (classId?: number): string | undefined =>
  classId ? CLASS_COLORS[classId] : undefined;

export type Faction = "HORDE" | "ALLIANCE" | string | undefined;

export const factionColor = (faction: Faction): string | undefined => {
  if (faction === "HORDE") return "#C8102E";
  if (faction === "ALLIANCE") return "#2F6FE0";
  return undefined;
};
