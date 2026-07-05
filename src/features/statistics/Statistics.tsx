import { ReactNode } from "react";
import {
  Alert,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconChartBar,
  IconMoodEmpty,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react";

import { useGetPlayersQuery } from "../../hooks/endpoints";
import LootPerPlayerChart from "./LootPerPlayerChart/LootPerPlayerChart";
import PriorirtyTrackerTable from "./PriorirtyTrackerTable/PriorirtyTrackerTable";
import StatCards from "./StatCards/StatCards";

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof IconChartBar;
  children: ReactNode;
}) => (
  <Card h="100%">
    <Group gap="xs" mb="md">
      <ThemeIcon variant="light" color="gold" radius="md" size="md">
        <Icon size={18} stroke={1.6} />
      </ThemeIcon>
      <Title order={4}>{title}</Title>
    </Group>
    {children}
  </Card>
);

const Statistics = () => {
  const { data, status, refetch, isFetching } = useGetPlayersQuery();

  if (status === "pending") {
    return (
      <Center h="60vh">
        <Loader color="gold" type="bars" />
      </Center>
    );
  }

  if (status === "error") {
    return (
      <Alert
        variant="light"
        color="red"
        radius="lg"
        icon={<IconAlertTriangle />}
        title="Couldn't load the guild roster"
      >
        <Stack gap="sm" align="flex-start">
          <Text size="sm">
            We couldn't reach the loot vault. Check your connection and try
            again.
          </Text>
          <Button
            variant="light"
            color="red"
            size="xs"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Stack>
      </Alert>
    );
  }

  const isEmpty = data.length === 0;

  return (
    <Stack gap="lg" className="plt-enter">
      <div>
        <Title order={2}>Statistics</Title>
        <Text c="dimmed" size="sm">
          Loot distribution and pickup priority across the guild.
        </Text>
      </div>

      {isEmpty ? (
        <Card>
          <Center py="xl">
            <Stack align="center" gap="xs">
              <ThemeIcon variant="light" color="gray" size={56} radius="xl">
                <IconMoodEmpty size={30} />
              </ThemeIcon>
              <Text fw={700}>No players yet</Text>
              <Text c="dimmed" size="sm" ta="center" maw={320}>
                Add players from the Loot Assigner to start tracking who looted
                what.
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <>
          <StatCards data={data} />
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <SectionCard title="Loot per player" icon={IconChartBar}>
                <LootPerPlayerChart data={data} />
              </SectionCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <SectionCard title="Priority tracker" icon={IconTrophy}>
                <PriorirtyTrackerTable data={data} />
              </SectionCard>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Stack>
  );
};

export default Statistics;
