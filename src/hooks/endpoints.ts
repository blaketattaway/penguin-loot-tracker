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

/* ============================================================================
   Penguin Party Tracker
   ----------------------------------------------------------------------------
   The guild's yearly party: where it was, who came, which pet they drew, the
   year's running jokes, and the photo album.

   Access model — two tokens, two jobs:
   · `plt-party-token` comes from the single code the whole guild shares. It is
     the ONLY thing that makes party data readable, photos included: the backend
     serves nothing without it, and photo urls are short-lived SAS links to a
     private container, so a copied link dies within the hour.
   · `plt-token` (the officer login) is still what's required to WRITE. Knowing
     the party code lets you look at the album, never change it.
   ============================================================================ */

export const PARTY_TOKEN_KEY = "plt-party-token";
export const PARTY_TOKEN_EXPIRATION_KEY = "plt-party-token-expiration";

/**
 * Carries the HTTP status so the UI can tell "your code is no longer good"
 * (401) apart from "the server is having a bad day" (anything else). Without
 * it every failure looks the same on screen, and blaming the code for a 500
 * sends the reader off to fix something that was never broken.
 */
export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`Error: ${status}`);
    this.name = "ApiError";
  }
}

/**
 * Retry policy for party reads.
 *
 * A rejected token is a settled answer, not a hiccup — retrying it three times
 * on a backoff only makes the reader stare at a spinner for eight seconds
 * before being told something the first response already knew. Genuine
 * flakiness (a dropped connection, a 5xx) still gets one more chance.
 */
const retryPartyRead = (failureCount: number, error: Error): boolean => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403))
    return false;

  return failureCount < 1;
};

export interface PartyAttendee {
  name: string;
  /** Blizzard item id of the TCG pet, or null for the organizer. */
  petItemId: number | null;
  /** English pet name as stored; localized for display via the item proxy. */
  petName: string | null;
  isOrganizer: boolean;
}

export interface PartyGag {
  id: string;
  title: string;
  body: string;
  iconUrl: string | null;
  emoji: string | null;
  sort: number;
}

export interface Party {
  year: number;
  title: string;
  city: string;
  country: string;
  venue: string | null;
  latitude: number;
  longitude: number;
  heldOn: string | null;
  isUpcoming: boolean;
  coverUrl: string | null;
  attendees: PartyAttendee[];
  gags: PartyGag[];
  photoCount: number;
}

export interface PartyPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  caption: string | null;
  uploadedOn: string;
}

// Reads of party data take either token — the API's PartyAccess policy accepts
// the party claim or the officer one, so an officer who is already logged in
// doesn't get asked for the code as well. Party token first: it's the one every
// guild member has, and the officer token is the fallback.
const partyHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${
    localStorage.getItem(PARTY_TOKEN_KEY) ?? localStorage.getItem("plt-token")
  }`,
});

const officerHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
});

/** Exchanges the shared guild code for a party token. */
export const usePartyUnlockMutation = () => {
  return useMutation({
    mutationKey: ["partyUnlock"],
    mutationFn: async (code: string): Promise<Token> => {
      const response = await fetch(`${API_URL}/party/unlock`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

/**
 * Every edition, newest first. Pet names arrive in English (that's how they're
 * stored, language-independent) and get localized here through the same item
 * proxy the raid loot uses.
 */
export const useGetPartiesQuery = (
  enabled: boolean,
  locale: BlizzardLocale = "en_US"
) => {
  return useQuery({
    queryKey: ["parties", locale],
    enabled,
    retry: retryPartyRead,
    queryFn: async (): Promise<Party[]> => {
      const response = await fetch(`${API_URL}/party/list`, {
        headers: partyHeaders(),
      });

      if (!response.ok) throw new ApiError(response.status);
      const parties: Party[] = await response.json();

      if (locale === "en_US") return parties;

      const petIds = parties.flatMap((party) =>
        party.attendees
          .map((attendee) => attendee.petItemId)
          .filter((id): id is number => !!id)
      );

      const nameMap = await fetchLocalizedItemNames(petIds, locale);

      return parties.map((party) => ({
        ...party,
        attendees: party.attendees.map((attendee) => ({
          ...attendee,
          petName: attendee.petItemId
            ? nameMap[attendee.petItemId] ?? attendee.petName
            : attendee.petName,
        })),
      }));
    },
  });
};

/**
 * A year's photos. The SAS urls inside expire, so this refetches on mount
 * rather than serving a cached page of links that would 403 on render.
 */
export const useGetPartyPhotosQuery = (year: number | null, enabled: boolean) => {
  return useQuery({
    queryKey: ["partyPhotos", year],
    enabled: enabled && year !== null,
    retry: retryPartyRead,
    // Comfortably inside the backend's SAS window, so a link never dies on screen.
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<PartyPhoto[]> => {
      const response = await fetch(`${API_URL}/party/${year}/photos`, {
        headers: partyHeaders(),
      });

      if (!response.ok) throw new ApiError(response.status);
      return await response.json();
    },
  });
};

export interface PartyPhotoUpload {
  year: number;
  file: File;
  /** Downscaled copy rendered in the browser; keeps the grid light and the server simple. */
  thumbnail: Blob | null;
  width: number;
  height: number;
  caption?: string;
}

export const useUploadPartyPhotoMutation = () => {
  return useMutation({
    mutationKey: ["uploadPartyPhoto"],
    mutationFn: async (upload: PartyPhotoUpload): Promise<AddPlayerResult> => {
      const body = new FormData();
      body.append("file", upload.file);
      if (upload.thumbnail)
        body.append("thumbnail", upload.thumbnail, `thumb-${upload.file.name}`);
      body.append("width", String(upload.width));
      body.append("height", String(upload.height));
      if (upload.caption) body.append("caption", upload.caption);

      // No Content-Type here on purpose: the browser must set the multipart boundary.
      const response = await fetch(`${API_URL}/party/${upload.year}/photos`, {
        method: "POST",
        headers: officerHeaders(),
        body,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export const useDeletePartyPhotoMutation = () => {
  return useMutation({
    mutationKey: ["deletePartyPhoto"],
    mutationFn: async (input: {
      year: number;
      photoId: string;
    }): Promise<AddPlayerResult> => {
      const response = await fetch(
        `${API_URL}/party/${input.year}/photos/${input.photoId}`,
        { method: "DELETE", headers: officerHeaders() }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};

export const useUploadGagIconMutation = () => {
  return useMutation({
    mutationKey: ["uploadGagIcon"],
    mutationFn: async (input: {
      year: number;
      gagId: string;
      file: File;
    }): Promise<AddPlayerResult> => {
      const body = new FormData();
      body.append("file", input.file);

      const response = await fetch(
        `${API_URL}/party/${input.year}/gags/${input.gagId}/icon`,
        { method: "POST", headers: officerHeaders(), body }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};
