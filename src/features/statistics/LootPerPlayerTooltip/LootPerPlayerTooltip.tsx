import { Paper, Stack, Title, Group, Indicator, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

import ItemList from "../LootList/LootList";
import { Player } from "../../../hooks/endpoints";

interface LootPerPlayerTooltipProps {
  payload: Player | null;
}

const LootPerPlayerTooltip = ({ payload }: LootPerPlayerTooltipProps) => {
  const { t } = useTranslation();
  if (!payload) return null;

  return (
    <Paper miw={200} px="md" py="sm" withBorder shadow="md" radius="md">
      <Stack gap="xs">
        <Title order={4}>
          {t("lootTooltip.playersLoot", { name: payload.name })}
        </Title>
        <Group px="5px" justify="space-between">
          <Group>
            <Indicator color="gold" />
            <Text>{t("lootTooltip.totalLoot")}</Text>
          </Group>
          <Text>{payload.lootedCount}</Text>
        </Group>
        <Stack gap="0">
          <Title order={4} mb="xs">
            {t("lootTooltip.items")}
          </Title>
          <ItemList items={payload.lootedItems} anchor={false} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default LootPerPlayerTooltip;
