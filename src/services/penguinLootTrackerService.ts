import { Login } from "../interfaces/login.interface";
import { Player } from "../interfaces/player.interface";
import { Token } from "../interfaces/token.interface";

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

export const login = async (login: Login): Promise<Token> => {
  try {
    const url = `${API_URL}Login`;

    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(login),
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