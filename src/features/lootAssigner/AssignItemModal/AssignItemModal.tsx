import { Button, Center, Group, Loader, Modal, MultiSelect, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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

const AssignItemModal = ({ onClose, data }: AssignItemModalProps) => {
  const { data: players, status } = useGetPlayersQuery();
  const { mutateAsync: assignItemAsync, isPending } = useAssignItemMutation();
  const queryClient = useQueryClient();
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

  return (
    <Modal title="Assign item" onClose={onClose} opened>
      {status === "pending" ? (
        <Center py="lg">
          <Loader color="gold" />
        </Center>
      ) : (
        <form
          onSubmit={form.onSubmit(async (values) => {
            const itemsToAssign: AssignedItem[] = values.selectedPlayers.map(
              (id) => {
                const match = playerOptions?.find((p) => p.value === id);
                return {
                  player: {
                    id,
                    name: match?.label ?? "",
                    lootedCount: 0,
                    lootedItems: [],
                  },
                  item: { id: data.id, name: data.name },
                };
              }
            );

            try {
              await assignItemAsync(itemsToAssign);
              await queryClient.invalidateQueries({ queryKey: ["players"] });
              notifications.show({
                title: "Loot assigned",
                message: `${data.name} assigned to ${itemsToAssign.length} player(s).`,
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
            <Button type="submit" loading={isPending}>
              Assign
            </Button>
          </Group>
        </form>
      )}
    </Modal>
  );
};

export default AssignItemModal;
