import {
  Alert,
  Button,
  Center,
  Group,
  List,
  Loader,
  Modal,
  MultiSelect,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "@mantine/form";

import {
  AssignedItem,
  useAssignItemMutation,
  useGetPlayersQuery,
  WowheadItem,
} from "../../../hooks/endpoints";

interface AssignItemModalProps {
  onClose: () => void;
  data: WowheadItem;
}

type SelectedPlayer = { id: string; name: string };

const AssignItemModal = ({ onClose, data }: AssignItemModalProps) => {
  const { data: players, status } = useGetPlayersQuery();
  const { mutateAsync: assignItemAsync, isPending } = useAssignItemMutation();
  const queryClient = useQueryClient();
  // Assigning loot is irreversible from the UI (there is no unassign endpoint),
  // so we gate the write behind an explicit confirmation of exactly what's recorded.
  const [pending, setPending] = useState<SelectedPlayer[] | null>(null);
  const form = useForm<{ selectedPlayers: string[] }>({
    initialValues: {
      selectedPlayers: [],
    },
    validate: {
      selectedPlayers: (value) =>
        value?.length ? null : "Select at least one player",
    },
    mode: "uncontrolled",
  });
  const playerOptions = useMemo(
    () =>
      players?.map((player) => ({
        value: player.id || "",
        label: player.name || "",
      })),
    [players]
  );

  const commitAssign = async (selected: SelectedPlayer[]) => {
    const itemsToAssign: AssignedItem[] = selected.map(({ id, name }) => ({
      player: { id, name, lootedCount: 0, lootedItems: [] },
      item: { id: data.id, name: data.name },
    }));

    try {
      await assignItemAsync(itemsToAssign);
      await queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        title: "Loot assigned",
        message: `${data.name} → ${selected.map((p) => p.name).join(", ")}.`,
        color: "gold",
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: "Couldn't assign loot",
        message: (error as Error).message,
        color: "red",
      });
    }
  };

  return (
    <Modal title="Assign item" onClose={onClose} opened>
      {status === "pending" ? (
        <Center py="lg">
          <Loader color="gold" />
        </Center>
      ) : pending ? (
        <Stack gap="md">
          <Alert
            variant="light"
            color="gold"
            icon={<IconAlertTriangle size={18} />}
            title="Confirm this loot record"
          >
            This can't be undone from the app. Double-check before recording.
          </Alert>
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              Recording{" "}
              <Text span fw={700} c="gold.4">
                {data.name}
              </Text>{" "}
              as looted by:
            </Text>
            <List size="sm" withPadding>
              {pending.map((p) => (
                <List.Item key={p.id}>{p.name}</List.Item>
              ))}
            </List>
          </div>
          <Group justify="right" gap="xs">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => setPending(null)}
              disabled={isPending}
            >
              Back
            </Button>
            <Button loading={isPending} onClick={() => commitAssign(pending)}>
              Confirm assign
            </Button>
          </Group>
        </Stack>
      ) : (
        <form
          onSubmit={form.onSubmit((values) => {
            const selected: SelectedPlayer[] = values.selectedPlayers.map(
              (id) => ({
                id,
                name: playerOptions?.find((p) => p.value === id)?.label ?? "",
              })
            );
            setPending(selected);
          })}
        >
          <Text size="sm" c="dimmed" mb="sm">
            Assigning{" "}
            <Text span fw={700} c="gold.4">
              {data.name}
            </Text>
            . Pick who looted it.
          </Text>
          <MultiSelect
            label="Player(s)"
            placeholder="Select player(s)..."
            searchable
            data={playerOptions}
            data-autofocus
            {...form.getInputProps("selectedPlayers", { type: "input" })}
          />
          <Group mt="lg" justify="right" gap="xs">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Review</Button>
          </Group>
        </form>
      )}
    </Modal>
  );
};

export default AssignItemModal;
