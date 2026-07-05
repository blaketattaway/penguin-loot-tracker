import { useMemo } from "react";
import { Badge, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { calculatePriority } from "../../../utils";
import { Player } from "../../../hooks/endpoints";

interface PriorirtyTrackerTableProps {
  data: Player[];
}

const PriorirtyTrackerTable = ({ data }: PriorirtyTrackerTableProps) => {
  const { t } = useTranslation();
  const playerPriorityEntries = useMemo(() => {
    if (data) return calculatePriority(data, (player) => player.lootedCount);
    return [];
  }, [data]);

  const renderRows = () => {
    return playerPriorityEntries.map((element) => (
      <Table.Tr key={element.priority}>
        <Table.Td>
          <Badge
            size="lg"
            radius="sm"
            variant={element.priority === 1 ? "filled" : "light"}
            color="gold"
          >
            #{element.priority}
          </Badge>
        </Table.Td>
        <Table.Td>
          {element.items.map((player, index) => (
            <span key={player.id ?? player.name}>
              {index > 0 && ", "}
              {player.name}
            </span>
          ))}
        </Table.Td>
      </Table.Tr>
    ));
  };

  if (playerPriorityEntries.length === 0) {
    return (
      <Text c="dimmed" size="sm" py="md">
        {t("priorityTable.empty")}
      </Text>
    );
  }

  return (
    <Table verticalSpacing="sm" highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={90}>{t("priorityTable.priority")}</Table.Th>
          <Table.Th>{t("priorityTable.players")}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderRows()}</Table.Tbody>
    </Table>
  );
};

export default PriorirtyTrackerTable;
