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
      <Group gap="sm" align="flex-end" wrap="nowrap">
        <TextInput
          key={form.key("searchValue")}
          style={{ flex: 1 }}
          placeholder="e.g. Thunderfury, Blessed Blade..."
          leftSection={<IconSearch size={18} />}
          {...form.getInputProps("searchValue", { type: "input" })}
        />
        <Button type="submit" leftSection={<IconSearch size={18} />}>
          Search
        </Button>
      </Group>
    </form>
  );
};

export default LootSearcher;
