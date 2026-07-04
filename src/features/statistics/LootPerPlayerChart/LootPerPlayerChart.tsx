import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Modal, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import LootPerPlayerTooltip from "../LootPerPlayerTooltip/LootPerPlayerTooltip";
import ItemList from "../LootList/LootList";
import { Player } from "../../../hooks/endpoints";

interface LootPerPlayerChartProps {
  data: Player[];
}

const LootPerPlayerChart = ({ data }: LootPerPlayerChartProps) => {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleBarClick = (player: Player) => {
    setSelectedPlayer(player);
    open();
  };

  return (
    <>
      {selectedPlayer && (
        <Modal
          opened={opened}
          onClose={() => {
            close();
            setSelectedPlayer(null);
          }}
          centered
          title={<Text size="lg" fw="bold" >{`${selectedPlayer?.name}'s Loot`}</Text>}
        >
          <ItemList items={selectedPlayer.lootedItems} anchor />
        </Modal>
      )}
      <ResponsiveContainer width="100%" height={540}>
        <BarChart
          onClick={(e) =>
            e?.activePayload && handleBarClick(e.activePayload[0].payload)
          }
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 15 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke={theme.colors.dark[4]}
            strokeDasharray="4 4"
          />
          <XAxis
            interval={1}
            type="number"
            domain={[0, "dataMax"]}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: theme.colors.gray[6] }}
            tickCount={data.length}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={75}
            tick={{
              fontSize: 12,
              textAnchor: "end",
              fill: theme.colors.gray[5],
            }}
            interval={0}
          />
          <Tooltip
            cursor={{
              fill: theme.colors.gold[6],
              fillOpacity: 0.1,
            }}
            animationDuration={0}
            content={(props) => (
              <LootPerPlayerTooltip
                payload={props.payload ? props.payload[0]?.payload : null}
              />
            )}
          />
          <Bar
            dataKey="lootedCount"
            fill={theme.colors.gold[6]}
            barSize={14}
            radius={[0, 6, 6, 0]}
            style={{ cursor: "pointer" }}
            activeBar={{ fill: theme.colors.gold[4] }}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default LootPerPlayerChart;
