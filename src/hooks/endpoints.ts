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
  url: string;
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
const WOWHEAD_API_URL = "https://us.api.blizzard.com/data/wow/search/item";
const CLIENT_ID = "102260639990475c9acc9e4041468f54";
const CLIENT_SECRET = "4ZWDYav5a1hT38pVnsLw4kBby0ci9Vct";
const TOKEN_URL = "https://us.battle.net/oauth/token";

// Our backend stores item names in English. Given a set of item ids, ask
// Blizzard for their names in `locale` and return an id → localized-name map.
// Uses the item search's `id` OR-filter (`id=1||2||3`), chunked to the API's
// 100-results-per-page ceiling.
const fetchLocalizedItemNames = async (
  ids: number[],
  locale: BlizzardLocale
): Promise<Record<number, string>> => {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return {};

  const accessToken =
    localStorage.getItem("wow-token") || (await getBlizzardToken());
  const map: Record<number, string> = {};

  const CHUNK_SIZE = 100;
  for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
    const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
    const url = `${WOWHEAD_API_URL}?namespace=static-us&id=${chunk.join(
      "||"
    )}&orderby=id&_pageSize=${CHUNK_SIZE}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) continue; // Leave names untranslated rather than fail.

    const data = await response.json();
    for (const item of data.results ?? []) {
      const name: Partial<Record<BlizzardLocale, string>> = item.data.name;
      const localized = name[locale] ?? name.en_US;
      if (localized) map[item.data.id] = localized;
    }
  }

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

const getBlizzardToken = async () => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  return data.access_token;
};

export const useFetchBlizzardToken = () => {
  return useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const response = await getBlizzardToken();
      localStorage.setItem("wow-token", response);

      return response;
    },
  });
};

export const useGetItemsMutation = () => {
  return useMutation({
    mutationKey: ["items"],
    mutationFn: async (search: GetItemsPageConfig): Promise<LootItemsTable> => {
      const accessToken =
        localStorage.getItem("wow-token") || (await getBlizzardToken());
      // Search in and display item names in the requested locale. The user
      // types in their own language, so we query the matching name field.
      const locale: BlizzardLocale = search.locale ?? "en_US";
      const url = `${WOWHEAD_API_URL}?namespace=static-us&name.${locale}=${encodeURIComponent(
        search.querySearch
      )}&orderby=id&_page=${search.page}&_pageSize=100`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      const result: LootItemsTable = {
        ...data,
        results: data.results.map(
          (item: {
            key: { href: string };
            data: { id: number; name: Partial<Record<BlizzardLocale, string>> };
          }): WowheadItem => ({
            url: item.key.href,
            id: item.data.id,
            // Fall back to English if this item has no translation for the locale.
            name: item.data.name[locale] ?? item.data.name.en_US ?? "",
            nameEn: item.data.name.en_US ?? item.data.name[locale] ?? "",
          })
        ),
      };

      return result;
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
