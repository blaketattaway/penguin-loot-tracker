import { useEffect, useRef, useState } from "react";
import { Player } from "../interfaces/player.interface";
import * as bootstrap from "bootstrap";

interface PlayerLootModalProps {
  selectedPlayer: Player | null;
}

const PlayerLootModal = ({ selectedPlayer }: PlayerLootModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (modalRef.current) {
      const modal = new bootstrap.Modal(modalRef.current);
      modal.show();
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (selectedPlayer) {
      openModal();
    }
  }, [selectedPlayer]);

  useEffect(() => {
    if (!modalRef.current) return;

    const modalElement = modalRef.current;

    const handleClose = () => setIsModalOpen(false);
    modalElement.addEventListener("hidden.bs.modal", handleClose);

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleClose);
    };
  }, []);

  return (
    <div
      className="modal fade"
      ref={modalRef}
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
                {selectedPlayer.lootedItems.map((item) => (
                  <li key={item.tableId} className="mt-2">
                    <a href="#" data-wowhead={`item=${item.id}`}>
                      {item.name}
                    </a>
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

export default PlayerLootModal;
