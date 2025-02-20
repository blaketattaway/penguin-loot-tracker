import { BlizzardApiResponse } from "../interfaces/blizzard.interface";

const CLIENT_ID = "102260639990475c9acc9e4041468f54";
const CLIENT_SECRET = "4ZWDYav5a1hT38pVnsLw4kBby0ci9Vct";
const TOKEN_URL = "https://us.battle.net/oauth/token";
const API_URL = "https://us.api.blizzard.com/data/wow/search/item";

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

export const fetchBlizzardItems = async (searchTerm: string): Promise<BlizzardApiResponse> => {
  try {
    const accessToken = await getBlizzardToken();
    const url = `${API_URL}?namespace=static-us&name.en_US=${searchTerm}&orderby=id&_page=1&_pageSize=1000`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
};
