import { Anchor, Group, Pagination, Stack, Table, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import useAuth from "../../../hooks/useAuth";
import { wowheadData, wowheadUrl } from "../../../utils";

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
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;
  const { isValid } = useAuth();

  const renderRows = () => {
    return items.map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Anchor
            key={lng}
            data-wowhead={wowheadData(item.id, lng)}
            href={wowheadUrl(item.id, lng)}
            target="_blank"
          >
            {item.name}
          </Anchor>
        </Table.Td>
        {isValid && (
          <Table.Td>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => onAssignItemClick(item)}
            >
              {t("lootTable.assign")}
            </Button>
          </Table.Td>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Stack>
      <Table striped highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("lootTable.item")}</Table.Th>
            {isValid && <Table.Th w={100}>{t("lootTable.actions")}</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderRows()}</Table.Tbody>
      </Table>
      {pageCount > 1 && (
        <Group justify="center">
          <Pagination total={pageCount} value={page} onChange={onPageChange} />
        </Group>
      )}
    </Stack>
  );
};

export default LootTable;
