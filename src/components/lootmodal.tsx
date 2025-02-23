import { useEffect, useState } from "react";
import { Player } from "../interfaces/player.interface";

interface LootModalProps {
  selectedPlayer: Player | null;
}

const LootModal = ({ selectedPlayer } : LootModalProps) => {
  const [modalTriggered, setModalTriggered] = useState<boolean>(false);

  const openModal = () => {
    setModalTriggered(true);
  };

  useEffect(() => {
    if (selectedPlayer) {
      openModal();
    }
  }, [selectedPlayer]);

  return (
    <div
      className={`modal fade ${modalTriggered ? "show" : "hide"}`}
      id="lootModal"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">{selectedPlayer?.name}'s Loot</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {selectedPlayer?.lootedItems.length ? (
              <ul className="loot-list">
                {selectedPlayer.lootedItems.map((item, index) => (
                  <li key={index} className="mt-2">
                    <a href="#" data-wowhead={`item=${item.id}`}>{item.name}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Player without loot.</p>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-outline-light"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootModal;
