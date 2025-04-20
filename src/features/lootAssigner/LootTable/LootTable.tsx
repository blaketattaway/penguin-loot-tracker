import { Anchor, Group, Pagination, Stack, Table, Button } from "@mantine/core";

import useAuth from "../../../hooks/useAuth";

import { WowheadItem } from "../../../hooks/endpoints";

interface LootTableProps {
  items: WowheadItem[];
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onAssignItemClick: (item: WowheadItem) => void;
}

const LootTable = ({
  items,
  page,
  pageCount,
  onPageChange,
  onAssignItemClick,
}: LootTableProps) => {
  const { isValid } = useAuth();

  const renderRows = () => {
    return items.map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Anchor
            data-wowhead={`item=${item.id}`}
            href={item.url}
            target="_blank"
          >
            {item.name}
          </Anchor>
        </Table.Td>
        {isValid && (
          <Table.Td>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onAssignItemClick(item)}
            >
              Assign
            </Button>
          </Table.Td>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Stack>
      <Table striped highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            {isValid && <Table.Th w={100}>Actions</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderRows()}</Table.Tbody>
      </Table>
      {page && (
        <Group justify="center">
          <Pagination total={pageCount} value={page} onChange={onPageChange} />
        </Group>
      )}
    </Stack>
  );
};

export default LootTable;
