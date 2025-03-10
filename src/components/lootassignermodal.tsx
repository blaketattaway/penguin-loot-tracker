import { useEffect, useRef, useState } from "react";
import * as bootstrap from "bootstrap";
import { BlizzardItem } from "../interfaces/blizzard.interface";
import { Player } from "../interfaces/player.interface";
import {
  assignItems,
  fetchPlayersData,
} from "../services/penguinLootTrackerService";
import PlayerSelect from "./playerselect";
import LoadingIndicator from "./loadingindicator";
import { toast } from "react-toastify";
import { Result } from "../interfaces/result.interface";

interface LootAssignerModalProps {
  selectedItem: BlizzardItem;
}

const LootAssignerModal = ({ selectedItem }: LootAssignerModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [, setIsModalOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => {
    if (modalRef.current) {
      const modal = new bootstrap.Modal(modalRef.current);
      setSelectedPlayers([]);
      modal.show();
      setIsModalOpen(true);
    }
  };

  const getPlayersData = () => {
    setIsLoading(true);
    fetchPlayersData().then((players: Player[]) => {
      const playersData = players.map((player: Player) => ({
        id: player.id,
        name: player.name,
        lootedItems: player.lootedItems,
      }));

      setPlayers(playersData);

      localStorage.setItem(
        "penguin-loot-tracker-players",
        JSON.stringify(playersData)
      );

      toast("Player data refreshed");
    });

    setIsLoading(false);
  };

  const handleAssignment = () => {
    const assignedItems = selectedPlayers.map((player) => ({
      player: player,
      item: {
        id: selectedItem.id,
        name: selectedItem.name.en_US,
        tableId: "",
      },
    }));
    setIsLoading(true);
    try {
      assignItems(assignedItems).then((result: Result) => {
        if (result.success) {
          toast(result.message);

          if (modalRef.current) {
            const modalInstance = bootstrap.Modal.getInstance(modalRef.current);
            modalInstance?.hide();
          }
        } else {
          toast.warn(result.message);
        }
      });
    } catch {
      console.error();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const players = localStorage.getItem("penguin-loot-tracker-players");

    if (players) setPlayers(JSON.parse(players));
    else getPlayersData();

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
      <button className="btn btn-outline-light" onClick={openModal}>
        Assign <i className="bi bi-bag-check"></i>
      </button>
      <div
        className="modal fade"
        ref={modalRef}
        id={`lootAssignerModal-${selectedItem.id}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">
                {selectedItem?.name?.en_US} assignment
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <LoadingIndicator
                  size="lg"
                  color="#87ceeb"
                  message="Refreshing data..."
                />
              ) : (
                <>
                  Assign item to
                  <PlayerSelect
                    players={players}
                    selectedPlayers={selectedPlayers}
                    onChange={setSelectedPlayers}
                  />
                </>
              )}
            </div>
            <div className="modal-footer border-secondary">
              <button
                className="btn btn-outline-light"
                onClick={getPlayersData}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-repeat"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                disabled={isLoading}
                onClick={handleAssignment}
              >
                Assign
              </button>
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

export default LootAssignerModal;
