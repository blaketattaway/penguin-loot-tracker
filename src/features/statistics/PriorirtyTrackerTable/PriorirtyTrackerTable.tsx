import { useMemo } from "react";
import { Table } from "@mantine/core";

import { Player } from "../../../interfaces/player.interface";
import { calculatePriority } from "../../../utils";

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
        <Table.Td>{element.priority}</Table.Td>
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

  return (
    <Table striped withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={100}>Priority</Table.Th>
          <Table.Th>Players</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderRows()}</Table.Tbody>
    </Table>
  );
};

export default PriorirtyTrackerTable;
