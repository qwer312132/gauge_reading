// import logo from './logo.svg';
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MarkApp from "./MarkApp";
import CameraApp from "./CameraApp";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ background: "	#84C1FF", padding: "0px" }}>
          <ul
            style={{ listStyleType: "none", display: "flex", padding: "10px" }}
          >
            <li>
              <button className="button">
                <Link
                  to="/mark"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  標示訓練系統
                </Link>
              </button>
            </li>
            <li>
              <button className="button">
                <Link
                  to="/camera"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  偵測辨別系統
                </Link>
              </button>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/mark" element={<MarkApp />} />
          <Route path="/camera" element={<CameraApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
