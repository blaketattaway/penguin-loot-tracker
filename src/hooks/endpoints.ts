import { useMutation, useQuery } from "@tanstack/react-query";

export interface Item {
  tableId?: string;
  id: number;
  name: string;
}

// Locales available on Blizzard's US API host (us.api.blizzard.com,
// namespace=static-us). Spanish here is es_MX (Latin American); es_ES (Spain)
// only exists on the EU host, so it's intentionally not an option.
export type BlizzardLocale = "en_US" | "es_MX";

export interface GetItemsPageConfig {
  page: number;
  pageCount: number;
  querySearch: string;
  locale?: BlizzardLocale;
}

export interface AddPlayerResult {
  success: boolean;
  message: string;
}

export interface Token {
  token: string;
  expiration: Date;
}

export interface Login {
  accessCode: string;
}

export interface WowheadItem {
  id: number;
  // Localized name for display, in the searched locale.
  name: string;
  // Canonical English name — this is what we persist to our own backend so the
  // stored data stays language-independent.
  nameEn: string;
}

// Maps our UI language codes to Blizzard's US-host locales.
export const toBlizzardLocale = (lng?: string): BlizzardLocale =>
  lng?.toLowerCase().startsWith("es") ? "es_MX" : "en_US";

export interface LootItemsTable {
  results: WowheadItem[];
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface Player {
  id?: string;
  name: string;
  lootedItems: Item[];
  lootedCount: number;
}

export interface AssignedItem {
  player: Player;
  item: Item;
}

const HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};
const API_URL = "https://penguin-loot-tracker.azurewebsites.net/api";

// Our backend stores item names in English. Given a set of item ids, ask our own
// API to resolve their names in `locale` and return an id → localized-name map.
// The backend proxies Blizzard so the OAuth secret never reaches the client.
const fetchLocalizedItemNames = async (
  ids: number[],
  locale: BlizzardLocale
): Promise<Record<number, string>> => {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return {};

  const url = `${API_URL}/item/localize?ids=${uniqueIds.join(
    ","
  )}&locale=${locale}`;
  const response = await fetch(url);
  if (!response.ok) return {}; // Leave names untranslated rather than fail.

  // Backend returns a { "<id>": "<localized name>" } object.
  const data: Record<string, string> = await response.json();
  const map: Record<number, string> = {};
  for (const [id, name] of Object.entries(data)) map[Number(id)] = name;

  return map;
};

export const useGetPlayersQuery = (locale: BlizzardLocale = "en_US") => {
  return useQuery({
    // Locale is part of the key so switching language refetches localized names.
    queryKey: ["players", locale],
    queryFn: async (): Promise<Player[]> => {
      const response = await fetch(`${API_URL}/player/getplayers`);
      const result = await response.json();

      const players: Player[] = result.map((player: Player) => ({
        id: player.id,
        name: player.name,
        lootedItems: player.lootedItems,
        lootedCount: player.lootedItems.length,
      }));

      // English is the stored language, so nothing to translate.
      if (locale === "en_US") return players;

      const allIds = players.flatMap((p) =>
        p.lootedItems.map((item) => item.id)
      );
      const nameMap = await fetchLocalizedItemNames(allIds, locale);

      return players.map((player) => ({
        ...player,
        lootedItems: player.lootedItems.map((item) => ({
          ...item,
          name: nameMap[item.id] ?? item.name,
        })),
      }));
    },
  });
};

export const useGetItemsMutation = () => {
  return useMutation({
    mutationKey: ["items"],
    mutationFn: async (search: GetItemsPageConfig): Promise<LootItemsTable> => {
      // Item search is proxied by our backend (which holds the Blizzard secret and
      // narrows Blizzard's broad leading-token matches by the full query). The user
      // types in their own language, so we pass the matching locale.
      const locale: BlizzardLocale = search.locale ?? "en_US";
      const url = `${API_URL}/item/search?query=${encodeURIComponent(
        search.querySearch
      )}&locale=${locale}&limit=100`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      // Backend returns WowheadItem[] ({ id, name, nameEn }) already localized.
      const results: WowheadItem[] = await response.json();

      return {
        results,
        page: search.page,
        pageSize: 100,
        pageCount: search.pageCount,
      };
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (login: Login): Promise<Token> => {
      const url = `${API_URL}/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(login),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export const useAddPlayerMutation = () => {
  return useMutation({
    mutationKey: ["addPlayer"],
    mutationFn: async (player: Player): Promise<AddPlayerResult> => {
      const url = `${API_URL}/player/add`;

      const rHeaders = {
        ...HEADERS,
        Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: rHeaders,
        body: JSON.stringify(player),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export interface GuildCharacter {
  playerId?: string;
  playerName?: string;
  name: string;
  realm: string;
  // Blizzard snapshot — powers the roster's class colors, avatars, and hover cards.
  classId: number;
  className?: string;
  race?: string;
  faction?: string;
  level: number;
  avatarUrl?: string;
}

export interface LinkCharacterInput {
  playerId: string;
  name: string;
  realm: string;
}

// Blizzard validation result used for the link preview.
export interface CharacterProfile {
  found: boolean;
  message?: string;
  name: string;
  realm: string;
  realmSlug?: string;
  level: number;
  classId: number;
  className?: string;
  race?: string;
  faction?: string;
  guild?: string;
  avatarUrl?: string;
}

export const useLookupCharacterMutation = () => {
  return useMutation({
    mutationKey: ["lookupCharacter"],
    mutationFn: async (input: {
      name: string;
      realm: string;
    }): Promise<CharacterProfile> => {
      const url = `${API_URL}/character/lookup?name=${encodeURIComponent(
        input.name
      )}&realm=${encodeURIComponent(input.realm)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

// The character ↔ person map. A person (guild nickname) can have many characters
// (main + alts); priority follows the person, so a roll from any of them resolves here.
export const useGetCharactersQuery = () => {
  return useQuery({
    queryKey: ["characters"],
    queryFn: async (): Promise<GuildCharacter[]> => {
      const response = await fetch(`${API_URL}/character/getcharacters`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export const useLinkCharacterMutation = () => {
  return useMutation({
    mutationKey: ["linkCharacter"],
    mutationFn: async (input: LinkCharacterInput): Promise<AddPlayerResult> => {
      const url = `${API_URL}/character/link`;

      const rHeaders = {
        ...HEADERS,
        Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: rHeaders,
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export const useAssignItemMutation = () => {
  return useMutation({
    mutationKey: ["assignItem"],
    mutationFn: async (items: AssignedItem[]): Promise<AddPlayerResult> => {
      const url = `${API_URL}/lootassigner/assign`;

      const rHeaders = {
        ...HEADERS,
        Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: rHeaders,
        body: JSON.stringify(items),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};
