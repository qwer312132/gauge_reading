// import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MarkApp from "./MarkApp";
import CameraApp from "./CameraApp";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ background: "	#84C1FF", padding: "0px" }}>
          <ul style={{ listStyleType: "none", display: "flex", padding: "10px" }}>
            <li >
              <button class="button"> 
                <Link to="/mark" style={{ textDecoration: "none", color: "black" }}>標記系統</Link>
              </button>
            </li>
            <li >
              <button class="button">
                <Link to="/camera" style={{ textDecoration: "none", color: "black" }}>拍照系統</Link>
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
