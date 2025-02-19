import "./App.css";
import Chart from "./components/chart";

const APP_NAME: string = 'Penguin Loot Tracker';

function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            { APP_NAME }
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Github
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container-fluid mt-5">
        <div className="row">
          <div className="col-md-12" style={{ height: "50vh" }}>
            <Chart/>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
