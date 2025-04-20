import { Paper, Stack, Title, Group, Indicator, Text } from "@mantine/core";

import { Player } from "../../../interfaces/player.interface";
import ItemList from "../LootList/LootList";

interface LootPerPlayerTooltipProps {
  payload: Player | null;
}

const LootPerPlayerTooltip = ({ payload }: LootPerPlayerTooltipProps) => {
  if (!payload) return null;

  return (
    <Paper miw={200} px="md" py="sm" withBorder shadow="md" radius="md">
      <Stack gap="xs">
        <Title order={4}>{payload.name}'s Loot</Title>
        <Group px="5px" justify="space-between">
          <Group>
            <Indicator />
            <Text>Total Loot</Text>
          </Group>
          <Text>{payload.lootedCount}</Text>
        </Group>
        <Stack gap="0">
          <Title order={4} mb="xs">
            Items
          </Title>
          <ItemList items={payload.lootedItems} anchor={false} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default LootPerPlayerTooltip;
