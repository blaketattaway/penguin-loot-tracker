import { Login } from "../interfaces/login.interface";
import { Player } from "../interfaces/player.interface";
import { Result } from "../interfaces/result.interface";
import { Token } from "../interfaces/token.interface";

const API_URL = "https://penguin-loot-tracker.azurewebsites.net/api/";

const HEADERS: HeadersInit = {
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

export const createPlayer = async (player: Player): Promise<Result> => {
  try {
    const url = `${API_URL}Player/Add`;

    const rHeaders = {...HEADERS , Authorization: `Bearer ${localStorage.getItem("plt-token")}`,}

    const response = await fetch(url, {
      method: "POST",
      headers: rHeaders,
      body: JSON.stringify(player),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
}