import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";

interface LootSearcherProps {
  onFormSubmit: (searchValue: string) => void;
  searchQuery: string;
}

const LootSearcher = ({ onFormSubmit, searchQuery }: LootSearcherProps) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      searchValue: searchQuery,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        onFormSubmit(values.searchValue);
      })}
    >
      <Group justify="apart" mb="md">
        <TextInput
          key={form.key("searchValue")}
          size="xs"
          placeholder="Item's name..."
          leftSection={<IconSearch size={18} />}
          {...form.getInputProps("searchValue", { type: "input" })}
        />
        <Button type="submit" variant="outline" size="xs">
          Search
        </Button>
      </Group>
    </form>
  );
};

export default LootSearcher;
