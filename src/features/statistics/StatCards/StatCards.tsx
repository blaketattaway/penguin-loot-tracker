import { useMemo } from "react";
import { Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconCrown,
  IconSparkles,
  IconScale,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { Player } from "../../../hooks/endpoints";

interface StatCardsProps {
  data: Player[];
}

const StatCard = ({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: typeof IconUsers;
}) => (
  <Card className="plt-card-hover">
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
          {label}
        </Text>
        <Text fz={30} fw={800} lh={1.1} mt={4}>
          {value}
        </Text>
      </div>
      <ThemeIcon size={46} radius="md" variant="light" color={color}>
        <Icon size={24} stroke={1.6} />
      </ThemeIcon>
    </Group>
  </Card>
);

const StatCards = ({ data }: StatCardsProps) => {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const players = data.length;
    const totalLoot = data.reduce((sum, p) => sum + p.lootedCount, 0);
    const avg = players ? (totalLoot / players).toFixed(1) : "0";
    const top = data.reduce<Player | null>(
      (best, p) => (!best || p.lootedCount > best.lootedCount ? p : best),
      null
    );
    return { players, totalLoot, avg, top };
  }, [data]);

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} className="plt-stagger">
      <StatCard
        label={t("statCards.players")}
        value={stats.players}
        color="blue"
        icon={IconUsers}
      />
      <StatCard
        label={t("statCards.totalLoot")}
        value={stats.totalLoot}
        color="gold"
        icon={IconSparkles}
      />
      <StatCard
        label={t("statCards.avgPerPlayer")}
        value={stats.avg}
        color="teal"
        icon={IconScale}
      />
      <StatCard
        label={t("statCards.topLooter")}
        value={stats.top?.name ?? "—"}
        color="arcane"
        icon={IconCrown}
      />
    </SimpleGrid>
  );
};

export default StatCards;
