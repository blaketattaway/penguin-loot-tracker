import "./App.css";
import Chart from "./components/chart";
import githubImage from "./assets/github-mark-white.svg";

const APP_NAME: string = "Penguin Loot Tracker";

function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <div className="navbar-brand">
            {APP_NAME}
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
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
            <Chart />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
