import React, { useEffect, useRef } from "react";
import { Player } from "../interfaces/player.interface";

interface LootModalProps {
  selectedPlayer: Player | null;
}

declare global {
  interface Window {
    bootstrap: any;
  }
}

const LootModal: React.FC<LootModalProps> = ({ selectedPlayer }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const openModal = () => {
    if (modalRef.current) {
      const modal = new window.bootstrap.Modal(modalRef.current);
      modal.show();
    }
  };

  useEffect(() => {
    if (selectedPlayer) {
      openModal();
    }
  }, [selectedPlayer]);

  return (
    <div
      className="modal fade"
      id="lootModal"
      ref={modalRef}
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Loot de {selectedPlayer?.name}</h5>
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
              <p>Este jugador no tiene loot.</p>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-outline-light"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootModal;
