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
import React, { useEffect, useState } from "react";
import PlayerLootModal from "./playerlootmodal";
import { fetchPlayersData } from "../services/penguinLootTrackerService";
import LoadingIndicator from "./loadingindicator";

const Chart: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerData, setPlayerData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBarClick = (player: Player) => {
    if (selectedPlayer?.name === player.name) {
      setSelectedPlayer(null);
      setTimeout(() => setSelectedPlayer(player), 50); // If we want to reopen the modal for the same player
    } else {
      setSelectedPlayer(player);
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchPlayersData().then((players: Player[]) => {
      const chartData = players.map((player: Player) => ({
        id: player.id,
        name: player.name,
        lootedItems: player.lootedItems,
      }));

      setPlayerData(chartData);

      localStorage.setItem('penguin-loot-tracker-players', JSON.stringify(chartData));

      setLoading(false);
    });
  }, []);

  return (
    <>
      {loading ? (
        <LoadingIndicator
          size="lg"
          color="#87ceeb"
          message="Obtaining data..."
        />
      ) : (
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
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: "white" }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      <PlayerLootModal selectedPlayer={selectedPlayer} />
    </>
  );
};

export default Chart;
