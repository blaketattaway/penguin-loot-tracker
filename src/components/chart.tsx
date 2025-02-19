import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Player } from "../interfaces/player.interface";
import React, { useState } from "react";
import LootModal from "./lootmodal";

const data: Player[] = [
  {
    name: "Andrius",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Ángel",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Ashes",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "BB",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Dalrien",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Dingo",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Drack",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Furros",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Kaztu",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "LLuci",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Mugrozond",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Nacus",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Nate",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Picookie",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Racnur",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Razor",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Reno",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Richo",
    totalLoot: 2,
    lootedItems: [
      {
        id: 226810,
        main: false,
        name: "Infiltrator's Shroud",
      },
      {
        id: 226810,
        main: false,
        name: "Infiltrator's Shroud",
      },
    ],
  },
  {
    name: "Strafend",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Tacho",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Tugnar",
    totalLoot: 0,
    lootedItems: [],
  },
  {
    name: "Yuti",
    totalLoot: 0,
    lootedItems: [],
  },
];

const Chart: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleBarClick = (player: Player) => {
    if (selectedPlayer?.name === player.name) {
      setSelectedPlayer(null);
      setTimeout(() => setSelectedPlayer(player), 50); // If we want to reopen the modal for the same player
    } else {
      setSelectedPlayer(player);
    }
  };

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={data}>
          <Bar dataKey="totalLoot" fill="#4a8eb3">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="#4a8eb3"
                onClick={() => handleBarClick(entry)}
              />
            ))}
          </Bar>
          <XAxis dataKey="name" />
          <YAxis />
        </BarChart>
      </ResponsiveContainer>
      <LootModal selectedPlayer={selectedPlayer} />
    </>
  );
};

export default Chart;
