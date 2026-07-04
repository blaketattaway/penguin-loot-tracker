import { useMemo } from "react";
import { Badge, Table, Text } from "@mantine/core";

import { calculatePriority } from "../../../utils";
import { Player } from "../../../hooks/endpoints";

interface PriorirtyTrackerTableProps {
  data: Player[];
}

const PriorirtyTrackerTable = ({ data }: PriorirtyTrackerTableProps) => {
  const playersPriortyEntris = useMemo(() => {
    if (data) return calculatePriority(data, (player) => player.lootedCount);
    return [];
  }, [data]);

  const renderRows = () => {
    return playersPriortyEntris.map((element) => (
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
          {element.items.map((item, index) => (
            <span key={index}>
              {index > 0 && ", "}
              {item.name}
            </span>
          ))}
        </Table.Td>
      </Table.Tr>
    ));
  };

  if (playersPriortyEntris.length === 0) {
    return (
      <Text c="dimmed" size="sm" py="md">
        No priority data yet.
      </Text>
    );
  }

  return (
    <Table verticalSpacing="sm" highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={90}>Priority</Table.Th>
          <Table.Th>Players</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderRows()}</Table.Tbody>
    </Table>
  );
};

export default PriorirtyTrackerTable;
