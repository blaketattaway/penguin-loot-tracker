import { useEffect, useRef, useState } from "react";
import * as bootstrap from "bootstrap";
import { createPlayer } from "../services/penguinLootTrackerService";
import { Result } from "../interfaces/result.interface";
import { toast } from "react-toastify";

const PlayerModal = () => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [lastPlayerName, setLastPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (modalRef.current) {
      const modal = new bootstrap.Modal(modalRef.current);
      modal.show();
      setIsModalOpen(true);
    }
  };

  const handleCreatePlayer = () => {
    if (playerName.trim() !== "" && playerName !== lastPlayerName) {
      setLoading(true);
      try {
        createPlayer({ name: playerName, lootedItems: [] }).then(
          (result: Result) => {
            if (result.success) {
              toast(result.message);
            } else {
              toast.warn(result.message);
            }
          }
        );

        setPlayerName("");
        setLastPlayerName("");

        if (modalRef.current) {
          const modalInstance = bootstrap.Modal.getInstance(modalRef.current);
          modalInstance?.hide();
        }
      } catch {
        console.error();
      }
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreatePlayer();
    }
  };

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
    <>
      <button className="btn btn-outline-light float-end" onClick={openModal}>
        <i className="bi bi-plus-circle-dotted"></i> Create Player
      </button>

      <div
        className="modal fade"
        ref={modalRef}
        id="playerModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Create Player</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control bg-secondary text-white password-input"
                    placeholder="Type player's name..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button
                    className="btn btn-outline-light toggle-password"
                    type="button"
                    onClick={() => handleCreatePlayer}
                  >
                    Add
                  </button>
                </div>
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
    </>
  );
};

export default PlayerModal;
