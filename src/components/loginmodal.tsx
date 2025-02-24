import { useEffect, useRef, useState } from "react";
import { login } from "../services/penguinLootTrackerService";
import { Token } from "../interfaces/token.interface";
import * as bootstrap from "bootstrap";
import PlayerModal from "./playermodal";
import { useAuth } from "../hooks/useAuth";

const LoginModal = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setIsModalOpen] = useState(false);
  const loginModalRef = useRef<HTMLDivElement | null>(null);
  const { isValid, checkTokenValidity } = useAuth();

  const openModal = () => {
    if (loginModalRef.current) {
      const modal = new bootstrap.Modal(loginModalRef.current);
      modal.show();
      setIsModalOpen(true);
    }
  };

  const handleLogin = async () => {
    if (password.trim() !== "") {
      setLoading(true);
      try {
        login({ accessCode: password }).then((token: Token) => {
          const tokenExpiration: string = new Date(
            token.expiration
          ).toISOString();

          setPassword("");
          localStorage.setItem("plt-token", token.token);
          localStorage.setItem("plt-token-expiration", tokenExpiration);

          checkTokenValidity();
        });

        if (loginModalRef.current) {
          const modalInstance = bootstrap.Modal.getInstance(
            loginModalRef.current
          );
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
      handleLogin();
    }
  };

  useEffect(() => {
    if (!loginModalRef.current) return;

    const modalElement = loginModalRef.current;

    const handleClose = () => setIsModalOpen(false);
    modalElement.addEventListener("hidden.bs.modal", handleClose);

    checkTokenValidity();

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleClose);
    };
  }, [checkTokenValidity]);

  return (
    <>
      {isValid ? (
        <PlayerModal />
      ) : (
        <button className="btn btn-outline-light float-end" onClick={openModal}>
          <i className="bi bi-key-fill"></i> Login
        </button>
      )}

      <div
        className="modal fade"
        ref={loginModalRef}
        id="loginModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Login</h5>
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
                    type="password"
                    className="form-control bg-secondary text-white password-input"
                    placeholder="Type your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button
                    className="btn btn-outline-light toggle-password"
                    type="button"
                    onClick={handleLogin}
                  >
                    Send
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

export default LoginModal;
