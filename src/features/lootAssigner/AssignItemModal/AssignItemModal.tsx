import {
  Button,
  Group,
  Loader,
  Modal,
  Select,
} from "@mantine/core";
import { useAssignItemMutation, useGetPlayersQuery, WowheadItem } from "../../../hooks/endpoints";
import { useMemo } from "react";
import { useForm } from "@mantine/form";

interface AddPlayerModalProps {
  onClose: () => void;
  data: WowheadItem;
}

const AssignItemModal = ({ onClose, data }: AddPlayerModalProps) => {
  const { data: players, status } = useGetPlayersQuery();
  const { mutateAsync: assignItemAsync } = useAssignItemMutation();
  const form = useForm({
    initialValues: {
      player: "",
    },
    validate: {
      player: (value) => (value?.length ? null : "Player is required"),
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
          await assignItemAsync({
            tableId: values.player,
            id: data.id,
            name: data.name,
          });
        })}>
          <Select
            label="Player"
            placeholder="Select player..."
            searchable
            data={playerOptions}
            {...form.getInputProps("player", { type: "input" })}
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
