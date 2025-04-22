import {
  Button,
  Group,
  Loader,
  Modal,
  MultiSelect,
} from "@mantine/core";
import { AssignedItem, useAssignItemMutation, useGetPlayersQuery, WowheadItem } from "../../../hooks/endpoints";
import { useMemo } from "react";
import { useForm } from "@mantine/form";

interface AddPlayerModalProps {
  onClose: () => void;
  data: WowheadItem;
}

const AssignItemModal = ({ onClose, data }: AddPlayerModalProps) => {
  const { data: players, status } = useGetPlayersQuery();
  const { mutateAsync: assignItemAsync } = useAssignItemMutation();
  const form = useForm<{selectedPlayers: string[]}>({
    initialValues: {
      selectedPlayers: [],
    },
    validate: {
      selectedPlayers: (value) => (value?.length ? null : "Player is required"),
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

  if (status === "pending") return <Loader />;
  return (
    players && (
      <Modal title="Assign Item" centered onClose={onClose} opened>
        <form onSubmit={form.onSubmit(async (values) => {

          const itemsToAssign: AssignedItem[] = values.selectedPlayers.map((id) => {

            const match = playerOptions?.find(p => p.value === id);
            
            return {
              player: {
                id,
                name: match?.label ?? "",
                lootedCount: 0,
                lootedItems: []
              },
              item: {
                id: data.id,
                name: data.name
              }
            }
          });

          await assignItemAsync(itemsToAssign);

          onClose();
        })}>
          <MultiSelect
            label="Player(s)"
            placeholder="Select player(s)..."
            searchable
            data={playerOptions}
            {...form.getInputProps("selectedPlayers", { type: "input" })}
          />
          <Group mt="md" justify="right" gap="xs">
            <Button variant="outline" size="xs" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="fill" size="xs">
              Assign
            </Button>
          </Group>
        </form>
      </Modal>
    )
  );
};

export default AssignItemModal;
