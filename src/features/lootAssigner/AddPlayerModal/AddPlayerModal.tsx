import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";

import { useAddPlayerMutation } from "../../../hooks/endpoints";

interface AddPlayerModalProps {
  onClose: () => void;
}

const AddPlayerModal = ({ onClose }: AddPlayerModalProps) => {
  const { mutateAsync: addPlayerAsync, isPending } = useAddPlayerMutation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      playerName: "",
    },
    validate: {
      playerName: (value) =>
        value.trim().length ? null : "Player name is required",
    },
    mode: "uncontrolled",
  });

  return (
    <Modal title="Add player" onClose={onClose} opened={true}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          try {
            await addPlayerAsync({
              name: values.playerName.trim(),
              lootedItems: [],
              lootedCount: 0,
            });
            await queryClient.invalidateQueries({ queryKey: ["players"] });
            notifications.show({
              title: "Player added",
              message: `${values.playerName.trim()} joined the roster.`,
              color: "gold",
            });
            onClose();
          } catch (error) {
            notifications.show({
              title: "Couldn't add player",
              message: (error as Error).message,
              color: "red",
            });
          }
        })}
      >
        <Text size="sm" c="dimmed" mb="sm">
          Add a character to the guild roster so they can receive loot.
        </Text>
        <TextInput
          label="Player name"
          placeholder="Character name"
          data-autofocus
          {...form.getInputProps("playerName", { type: "input" })}
        />
        <Group gap="xs" justify="right" mt="lg">
          <Button onClick={onClose} variant="default">
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Add player
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AddPlayerModal;
