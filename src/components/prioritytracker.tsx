import { useState } from "react";
import { playerData } from "../data/loot";
import { Player, PriorityEntry } from "../interfaces/player.interface";

const PriorityTracker = () => {
  const [players] = useState<Player[]>(playerData);

  const calculatePriority = (players: Player[]): PriorityEntry[] => {
    const sortedPlayers = [...players].sort(
      (a, b) => a.lootedItems.length - b.lootedItems.length
    );

    let priority = 1;
    let previousLootCount = sortedPlayers[0]?.lootedItems.length ?? 0;
    const priorityList: PriorityEntry[] = [];

    sortedPlayers.forEach((player, index) => {
      if (index > 0 && player.lootedItems.length > previousLootCount) {
        priority++;
      }

      if (
        priorityList.length === 0 ||
        priorityList[priorityList.length - 1].priority !== priority
      ) {
        priorityList.push({ players: [player.name], priority });
      } else {
        priorityList[priorityList.length - 1].players.push(player.name);
      }

      previousLootCount = player.lootedItems.length;
    });

    return priorityList;
  };

  const priorityData = calculatePriority(players);

  return (
    <div className="container mt-4">
      <div className="card bg-dark text-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center">🎯 Loot Priority</h2>

          <div className="table-responsive">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Players</th>
                </tr>
              </thead>
              <tbody>
                {priorityData.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.priority}</td>
                    <td>{entry.players.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityTracker;
