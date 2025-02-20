import {
  Bar,
  BarChart,
  Cell,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Player } from "../interfaces/player.interface";
import React, { useState } from "react";
import LootModal from "./lootmodal";
import { playerData } from "../data/loot";

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
      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ color: "white" }}
      >
        <BarChart layout="vertical" width={150} height={40} data={playerData}>
          <Tooltip
            cursor={{
              fill: "transparent",
            }}
            wrapperStyle={{
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const lootValue = Number(payload[0].value);

                if (lootValue > 0) {
                  return (
                    <div
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }}
                    >
                      <strong>{payload[0].payload.name}</strong> <br />
                      <strong>Total Loot:</strong> {payload[0].value}
                    </div>
                  );
                }
              }
              return null;
            }}
          />
          <Bar
            dataKey={(entry) => entry.lootedItems.length}
            activeBar={<Rectangle fill="#dbe4d0" />}
          >
            {playerData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="#87ceeb"
                onMouseOver={(
                  e: React.MouseEvent<SVGRectElement, MouseEvent>
                ) => {
                  if (entry.lootedItems.length > 0)
                    e.currentTarget.style.fill = "#f4a261";
                }}
                onMouseOut={(
                  e: React.MouseEvent<SVGRectElement, MouseEvent>
                ) => {
                  if (entry.lootedItems.length > 0)
                    e.currentTarget.style.fill = "#87ceeb";
                }}
                onClick={() => handleBarClick(entry)}
              />
            ))}
          </Bar>
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "white" }}
            tickLine={false}
            textAnchor="end"
            width={150}
          />
          <XAxis type="number" allowDecimals={false} tick={{ fill: "white" }} />
        </BarChart>
      </ResponsiveContainer>
      <LootModal selectedPlayer={selectedPlayer} />
    </>
  );
};

export default Chart;
