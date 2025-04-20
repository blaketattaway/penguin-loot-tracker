import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAddPlayerMutation } from "../../../hooks/endpoints";

interface AddPlayerModalProps {
  onClose: () => void;
}

const AddPlayerModal = ({ onClose }: AddPlayerModalProps) => {
  const { mutateAsync: addPlayerAsync } = useAddPlayerMutation();
  const form = useForm({
    initialValues: {
      playerName: "",
    },
    validate: {
      playerName: (value) => (value.length ? null : "Player Name is required"),
    },
    mode: "uncontrolled",
  });

  return (
    <Modal title="Add player" centered onClose={onClose} opened={true}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          await addPlayerAsync({
            name: values.playerName,
            lootedItems: [],
            lootedCount: 0,
          });
        })}
      >
        <Text>Input player name to add player.</Text>
        <TextInput
          label="Player Name"
          placeholder="Player Name"
          mt="sm"
          mb="sm"
          {...form.getInputProps("playerName", { type: "input" })}
        />
        <Group gap="xs" justify="right">
          <Button onClick={onClose} variant="outline" size="xs">
            Cancel
          </Button>
          <Button type="submit" variant="fill" size="xs">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AddPlayerModal;
