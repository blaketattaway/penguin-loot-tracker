import { useMutation, useQuery } from "@tanstack/react-query";

export interface Item {
  tableId: string;
  id: number;
  name: string;
}

export interface GetItemsPageConfig {
  page: number;
  pageCount: number;
  querySearch: string;
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
  name: string;
  url: string;
}

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

const HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};
const API_URL = "https://penguin-loot-tracker.azurewebsites.net/api";
const WOWHEAD_API_URL = "https://us.api.blizzard.com/data/wow/search/item";
const CLIENT_ID = "102260639990475c9acc9e4041468f54";
const CLIENT_SECRET = "4ZWDYav5a1hT38pVnsLw4kBby0ci9Vct";
const TOKEN_URL = "https://us.battle.net/oauth/token";

export const useGetPlayersQuery = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: async (): Promise<Player[]> => {
      const response = await fetch(`${API_URL}/player/getplayers`);
      const result = await response.json();

      return result.map((player: Player) => ({
        id: player.id,
        name: player.name,
        lootedItems: player.lootedItems,
        lootedCount: player.lootedItems.length,
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
      const url = `${WOWHEAD_API_URL}?namespace=static-us&name.en_US=${search.querySearch}&orderby=id&_page=${search.page}&_pageSize=15`;
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
            data: { id: number; name: { en_US: string } };
          }): WowheadItem => ({
            url: item.key.href,
            id: item.data.id,
            name: item.data.name.en_US,
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
    mutationFn: async (item: Item): Promise<AddPlayerResult> => {
      const url = `${API_URL}/lootassigner/assign`;

      const rHeaders = {
        ...HEADERS,
        Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: rHeaders,
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    },
  });
};
