import { LoadingOverlay, Paper, Stack, Text, Title } from "@mantine/core";

import { useGetPlayersQuery } from "../../hooks/endpoints";
import LootPerPlayerChart from "./LootPerPlayerChart/LootPerPlayerChart";
import PriorirtyTrackerTable from "./PriorirtyTrackerTable/PriorirtyTrackerTable";

const Statistics = () => {
  const { data, status, error } = useGetPlayersQuery();

  if (status === "pending") return <LoadingOverlay visible />;

  return (
    <Paper>
      <Stack>
        <Title order={2}>Loots per player</Title>
        {status === "error" && (
          <Text>
            {error.name}: {error.message}
          </Text>
        )}
        {status === "success" && <LootPerPlayerChart data={data} />}
      </Stack>
      <Stack>
        <Title order={2}>Priority Tracker</Title>
        {status === "error" && (
          <Text>
            {error.name}: {error.message}
          </Text>
        )}
        {status === "success" && <PriorirtyTrackerTable data={data} />}
      </Stack>
    </Paper>
  );
};

export default Statistics;
