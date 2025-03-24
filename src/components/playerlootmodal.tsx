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
    const modalElement = modalRef.current;

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);

      modalElement.addEventListener("shown.bs.modal", () => {
        modalElement.removeAttribute("aria-hidden");
      });

      modal.show();
      setIsModalOpen(true);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";

    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) return "";

    const utcMinus6 = new Date(parsedDate.getTime() - 6 * 60 * 60 * 1000);

    const day = String(utcMinus6.getDate()).padStart(2, "0");
    const month = String(utcMinus6.getMonth() + 1).padStart(2, "0");
    const year = utcMinus6.getFullYear();

    const hours = String(utcMinus6.getHours()).padStart(2, "0");
    const minutes = String(utcMinus6.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (selectedPlayer) {
      openModal();
    }
  }, [selectedPlayer]);

  useEffect(() => {
    if (!modalRef.current) return;

    const modalElement = modalRef.current;

    const handleClose = () => {
      modalElement.setAttribute("aria-hidden", "true");
      setIsModalOpen(false);
    };

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
      <div className="modal-dialog modal-lg">
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
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Assigned By</th>
                  <th>Date of Assignment</th>
                </tr>
              </thead>
              <tbody>
                {selectedPlayer?.lootedItems.length ? (
                  selectedPlayer.lootedItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <a href="#" data-wowhead={`item=${item.id}`}>
                          {item.name}
                        </a>
                      </td>
                      <td>{item.assignedBy}</td>
                      <td>{formatDate(item.assignDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>Player without loot</td>
                  </tr>
                )}
              </tbody>
            </table>
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
