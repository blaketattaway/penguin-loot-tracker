import { Player } from "../interfaces/player.interface";

const API_URL = "https://penguin-loot-tracker.azurewebsites.net/api/";

const HEADERS: HeadersInit = {
    Authorization: `Bearer ${localStorage.getItem("plt-token")}`,
    "Content-Type": "application/json",
}

export const fetchPlayersData = async (): Promise<Player[]> => {
  try {
    const url = `${API_URL}Player/GetPlayers`;

    const response = await fetch(url, {
      method: "GET",
      headers: HEADERS,
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