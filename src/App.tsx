import "./App.css";
import Chart from "./components/chart";
import githubImage from "./assets/github-mark-white.svg";
import { NavLink, Route, Routes } from "react-router-dom";
import PriorityTracker from "./components/prioritytracker";
import ItemSearcher from "./components/itemsearcher";
import { Bounce, ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/authprovider";

const APP_NAME: string = "Penguin Loot Tracker";

function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink to="/" className="navbar-brand">
            {APP_NAME}
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <NavLink
            to="/priority-tracker"
            className="nav-link ms-3 priority-link"
          >
            Priority Tracker
          </NavLink>
          <NavLink
            to="/loot-asigner"
            className="nav-link ms-3 priority-link"
          >
            Loot Assigner
          </NavLink>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav ms-auto d-flex align-items-center">
              <img src={githubImage} alt="github-image" className="nav-logo" />
              <a
                className="nav-link"
                href="https://github.com/blaketattaway/penguin-loot-tracker"
              >
                Github
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mt-5">
        <div className="row">
          <div className="col-md-12" style={{ height: "70vh" }}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Chart />} />
                <Route
                  path="/priority-tracker"
                  element={<PriorityTracker />}
                />
                <Route
                  path="/loot-asigner"
                  element={<ItemSearcher />}
                />
                <Route path="*" element={<Chart />} />
              </Routes>
            </AuthProvider>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </main>
    </>
  );
}

export default App;
