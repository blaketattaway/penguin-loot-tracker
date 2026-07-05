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
import { Box, Modal, Select, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";

import LootPerPlayerTooltip from "../LootPerPlayerTooltip/LootPerPlayerTooltip";
import ItemList from "../LootList/LootList";
import { Player } from "../../../hooks/endpoints";

interface LootPerPlayerChartProps {
  data: Player[];
}

const LootPerPlayerChart = ({ data }: LootPerPlayerChartProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleBarClick = (player: Player) => {
    setSelectedPlayer(player);
    open();
  };

  const openPlayerById = (id: string | null) => {
    const player = data.find((p) => (p.id ?? p.name) === id);
    if (player) handleBarClick(player);
  };

  // Accessible, screen-reader-friendly summary of the visual chart.
  const chartSummary =
    t("lootChart.summary") +
    data
      .map((p) => `${p.name} ${p.lootedCount}`)
      .join(", ");

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
          title={
            <Text size="lg" fw="bold">
              {t("lootChart.playersLoot", { name: selectedPlayer?.name })}
            </Text>
          }
        >
          <ItemList items={selectedPlayer.lootedItems} anchor />
        </Modal>
      )}

      {/* Keyboard- and screen-reader-accessible path to a player's loot history:
          the chart bars are mouse-only, so this Select is the equal-footing route. */}
      <Select
        label={t("lootChart.selectLabel")}
        placeholder={t("lootChart.selectPlaceholder")}
        searchable
        clearable
        mb="md"
        value={null}
        data={data.map((p) => ({ value: p.id ?? p.name, label: p.name }))}
        onChange={openPlayerById}
        comboboxProps={{ withinPortal: true }}
      />

      <Box role="img" aria-label={chartSummary}>
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
            tick={{ fontSize: 12, fill: theme.colors.gray[5] }}
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
      </Box>
    </>
  );
};

export default LootPerPlayerChart;
